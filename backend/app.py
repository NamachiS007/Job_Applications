from flask import Flask, request, jsonify, send_from_directory, abort, render_template
import os
import uuid
import json
from werkzeug.utils import secure_filename
from datetime import datetime
from flask_cors import CORS
import mimetypes
import PyPDF2
import io

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt'}
MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB

app = Flask(__name__)
CORS(app)

# Configure CORS with appropriate routes
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    },
    r"/download/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET"],
        "allow_headers": ["Content-Type"]
    },
    r"/preview/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET"],
        "allow_headers": ["Content-Type"]
    }
})

# Create uploads directory
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Create metadata directory
METADATA_FOLDER = os.path.join(UPLOAD_FOLDER, 'metadata')
os.makedirs(METADATA_FOLDER, exist_ok=True)

# Consistent job data structure
job_openings = [
    {
        "id": "1",
        "title": "Software Engineer",
        "description": "Developing web applications using modern frameworks",
        "location": "San Francisco",
        "salary": "$120,000 - $150,000",
        "posted_date": "2025-03-15"
    },
    {
        "id": "2",
        "title": "Data Scientist",
        "description": "Analyzing large datasets and building ML models",
        "location": "Remote",
        "salary": "$130,000 - $160,000",
        "posted_date": "2025-03-20"
    },
    {
        "id": "3",
        "title": "UX Designer",
        "description": "Creating user-centered designs for web and mobile applications",
        "location": "New York",
        "salary": "$100,000 - $130,000",
        "posted_date": "2025-03-25"
    }
]

# Applications will be stored here during runtime
applications = []

# Path to the applications persistence file
APPLICATIONS_FILE = os.path.join(METADATA_FOLDER, 'applications.json')

# Load existing applications if file exists
def load_applications():
    if os.path.exists(APPLICATIONS_FILE):
        try:
            with open(APPLICATIONS_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading applications: {str(e)}")
    return []

# Save applications to file
def save_applications():
    try:
        with open(APPLICATIONS_FILE, 'w') as f:
            json.dump(applications, f, indent=2)
    except Exception as e:
        print(f"Error saving applications: {str(e)}")

# Load applications at startup
applications = load_applications()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_pdf_text(file_path):
    """Extract text from PDF file for indexing/preview"""
    try:
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page_num in range(len(pdf_reader.pages)):
                text += pdf_reader.pages[page_num].extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {str(e)}")
        return "Unable to extract text from PDF"

def save_file_metadata(application):
    """Save metadata about uploaded files"""
    try:
        metadata = {
            "application_id": application["id"],
            "applicant_name": f"{application['firstName']} {application['lastName']}",
            "email": application["email"],
            "position": application["position"],
            "job_id": application["job_id"],
            "submission_date": application["timestamp"],
            "resume_filename": os.path.basename(application["resume_path"]) if application.get("resume_path") else None,
            "cover_letter_filename": os.path.basename(application["cover_letter_path"]) if application.get("cover_letter_path") else None
        }
        
        # Add file preview text if it's a PDF
        if application.get("resume_path") and application["resume_path"].lower().endswith('.pdf'):
            metadata["resume_preview"] = extract_pdf_text(application["resume_path"])[:500] + "..."
        
        if application.get("cover_letter_path") and application["cover_letter_path"].lower().endswith('.pdf'):
            metadata["cover_letter_preview"] = extract_pdf_text(application["cover_letter_path"])[:500] + "..."
        
        # Save individual metadata file for this application
        metadata_path = os.path.join(METADATA_FOLDER, f"{application['id']}_metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
            
        # Create a lookup file that maps filenames to application IDs
        filename_lookup = {}
        
        # Load existing lookup if it exists
        lookup_path = os.path.join(METADATA_FOLDER, 'filename_lookup.json')
        if os.path.exists(lookup_path):
            try:
                with open(lookup_path, 'r') as f:
                    filename_lookup = json.load(f)
            except:
                pass
        
        # Update lookup with new files
        if application.get("resume_path"):
            filename_lookup[os.path.basename(application["resume_path"])] = application["id"]
        if application.get("cover_letter_path"):
            filename_lookup[os.path.basename(application["cover_letter_path"])] = application["id"]
        
        # Save updated lookup
        with open(lookup_path, 'w') as f:
            json.dump(filename_lookup, f, indent=2)
            
    except Exception as e:
        print(f"Error saving file metadata: {str(e)}")

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    return jsonify({"jobs": job_openings})

@app.route('/api/jobs/<job_id>', methods=['GET'])
def get_job(job_id):
    job = next((job for job in job_openings if job["id"] == job_id), None)
    if job:
        return jsonify({"job": job})
    return jsonify({"error": "Job not found"}), 404

@app.route("/api/apply", methods=["POST"])
def apply_for_job():
    try:
        data = request.form
        files = request.files
        
        required_fields = [
            "firstName", "lastName", "email", "phone", "age", "address",
            "city", "country", "currentPlace", "availability", "position",
            "experience", "educationLevel", "skills", "job_id"
        ]
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Required fields missing: {', '.join(missing_fields)}"}), 400
        
        job_id = str(data["job_id"]).strip()  # Ensure string and trim whitespace
        
        job = next((job for job in job_openings if job["id"] == job_id), None)
        if not job:
            return jsonify({
                "error": f"Job not found. Received: '{job_id}'",
                "available_jobs": [job["id"] for job in job_openings]
            }), 404
        
        if "resume" not in files or files["resume"].filename == "":
            return jsonify({"error": "Resume file is required"}), 400
        
        resume = files["resume"]
        if not allowed_file(resume.filename):
            return jsonify({"error": "File type not allowed. Please upload PDF, DOC, DOCX, or TXT"}), 400
        
        application_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        # Create a more descriptive filename while maintaining uniqueness
        original_ext = resume.filename.rsplit('.', 1)[1].lower() if '.' in resume.filename else 'pdf'
        resume_filename = secure_filename(f"{data['firstName']}_{data['lastName']}_{application_id}.{original_ext}")
        resume_path = os.path.join(UPLOAD_FOLDER, resume_filename)
        resume.save(resume_path)
        
        # Create application
        application = {
            "id": application_id,
            "job_id": job_id,
            "timestamp": timestamp,
            "firstName": data["firstName"],
            "lastName": data["lastName"],
            "email": data["email"],
            "phone": data["phone"],
            "age": data["age"],
            "address": data["address"],
            "city": data["city"],
            "country": data["country"],
            "currentPlace": data["currentPlace"],
            "availability": data["availability"],
            "linkedInProfile": data.get("linkedInProfile", ""),
            "portfolioWebsite": data.get("portfolioWebsite", ""),
            "position": data["position"],
            "experience": data["experience"],
            "educationLevel": data["educationLevel"],
            "skills": data["skills"],
            "resume_path": resume_path,
            "cover_letter_path": None
        }
        
        # Save cover letter if provided
        if "coverLetter" in files and files["coverLetter"].filename:
            cover_letter = files["coverLetter"]
            if allowed_file(cover_letter.filename):
                cl_original_ext = cover_letter.filename.rsplit('.', 1)[1].lower() if '.' in cover_letter.filename else 'pdf'
                cl_filename = secure_filename(f"{data['firstName']}_{data['lastName']}_CL_{application_id}.{cl_original_ext}")
                cl_filepath = os.path.join(UPLOAD_FOLDER, cl_filename)
                cover_letter.save(cl_filepath)
                application["cover_letter_path"] = cl_filepath
        
        applications.append(application)
        
        # Save metadata about files
        save_file_metadata(application)
        
        # Persist applications to disk
        save_applications()
        
        return jsonify({
            "success": True,
            "message": "Application submitted successfully",
            "application_id": application_id
        }), 201
    
    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/applications', methods=['GET'])
def get_applications():
    # Prepare applications with file information
    enhanced_applications = []
    
    for app in applications:
        enhanced_app = app.copy()
        
        # Add file information instead of just paths
        if enhanced_app.get('resume_path'):
            resume_filename = os.path.basename(enhanced_app['resume_path'])
            enhanced_app['resume'] = {
                'filename': resume_filename,
                'original_name': f"{enhanced_app['firstName']}_{enhanced_app['lastName']}_Resume",
                'download_url': f"/download/{resume_filename}",
                'preview_url': f"/preview/{resume_filename}"
            }
            
        if enhanced_app.get('cover_letter_path'):
            cl_filename = os.path.basename(enhanced_app['cover_letter_path'])
            enhanced_app['cover_letter'] = {
                'filename': cl_filename,
                'original_name': f"{enhanced_app['firstName']}_{enhanced_app['lastName']}_CoverLetter",
                'download_url': f"/download/{cl_filename}",
                'preview_url': f"/preview/{cl_filename}"
            }
        
        # Remove raw paths
        enhanced_app.pop('resume_path', None)
        enhanced_app.pop('cover_letter_path', None)
        
        enhanced_applications.append(enhanced_app)
    
    return jsonify({"applications": enhanced_applications})

@app.route('/api/applications/<job_id>', methods=['GET'])
def get_applications_by_job(job_id):
    job_applications = [app for app in applications if app['job_id'] == job_id]
    
    # Enhanced applications with file information
    enhanced_applications = []
    
    for app in job_applications:
        enhanced_app = app.copy()
        
        # Add file information instead of just paths
        if enhanced_app.get('resume_path'):
            resume_filename = os.path.basename(enhanced_app['resume_path'])
            enhanced_app['resume'] = {
                'filename': resume_filename,
                'original_name': f"{enhanced_app['firstName']}_{enhanced_app['lastName']}_Resume",
                'download_url': f"/download/{resume_filename}",
                'preview_url': f"/preview/{resume_filename}"
            }
            
        if enhanced_app.get('cover_letter_path'):
            cl_filename = os.path.basename(enhanced_app['cover_letter_path'])
            enhanced_app['cover_letter'] = {
                'filename': cl_filename,
                'original_name': f"{enhanced_app['firstName']}_{enhanced_app['lastName']}_CoverLetter",
                'download_url': f"/download/{cl_filename}",
                'preview_url': f"/preview/{cl_filename}"
            }
        
        # Remove raw paths
        enhanced_app.pop('resume_path', None)
        enhanced_app.pop('cover_letter_path', None)
        
        enhanced_applications.append(enhanced_app)
    
    return jsonify({"applications": enhanced_applications})

@app.route('/download/<path:filename>', methods=['GET'])
def download_file(filename):
    try:
        secure_name = secure_filename(filename)
        file_path = os.path.join(UPLOAD_FOLDER, secure_name)
        
        if not os.path.exists(file_path):
            abort(404)
            
        # Determine MIME type
        mime_type = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
        
        response = send_from_directory(
            UPLOAD_FOLDER,
            secure_name,
            mimetype=mime_type,
            as_attachment=False  # Important for PDF viewer
        )
        
        # Add CORS headers
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Methods', 'GET')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        
        return response
        
    except Exception as e:
        print(f"Error serving file: {str(e)}")
        abort(500)

@app.route('/preview/<path:filename>', methods=['GET'])
def preview_file(filename):
    """Generate preview of PDF files"""
    try:
        # Secure the filename and get the full path
        secure_name = secure_filename(filename)
        file_path = os.path.join(UPLOAD_FOLDER, secure_name)
        
        # Check if file exists
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
            
        # Get applicant information
        lookup_path = os.path.join(METADATA_FOLDER, 'filename_lookup.json')
        applicant_info = {"name": "Unknown Applicant"}
        preview_text = "Preview not available"
        
        if os.path.exists(lookup_path):
            try:
                with open(lookup_path, 'r') as f:
                    lookup = json.load(f)
                
                if filename in lookup:
                    application_id = lookup[filename]
                    metadata_path = os.path.join(METADATA_FOLDER, f"{application_id}_metadata.json")
                    
                    if os.path.exists(metadata_path):
                        with open(metadata_path, 'r') as f:
                            metadata = json.load(f)
                        
                        applicant_info = {
                            "name": metadata["applicant_name"],
                            "email": metadata["email"],
                            "position": metadata["position"],
                            "submission_date": metadata["submission_date"]
                        }
                        
                        if metadata['resume_filename'] == filename and metadata.get('resume_preview'):
                            preview_text = metadata['resume_preview']
                        elif metadata.get('cover_letter_filename') == filename and metadata.get('cover_letter_preview'):
                            preview_text = metadata['cover_letter_preview']
            except Exception as e:
                print(f"Error looking up file metadata: {str(e)}")
        
        # For PDF files, extract text if we don't have it already
        if file_path.lower().endswith('.pdf') and preview_text == "Preview not available":
            preview_text = extract_pdf_text(file_path)
        
        return jsonify({
            "filename": filename,
            "applicant": applicant_info,
            "preview": preview_text,
            "download_url": f"/download/{filename}",
            "file_type": file_path.split('.')[-1].upper()
        })
        
    except Exception as e:
        print(f"Error generating preview: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/file-info/<path:filename>', methods=['GET'])
def get_file_info(filename):
    """Get information about a specific file"""
    try:
        # Secure the filename
        secure_name = secure_filename(filename)
        file_path = os.path.join(UPLOAD_FOLDER, secure_name)
        
        # Check if file exists
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
            
        # Get applicant information
        lookup_path = os.path.join(METADATA_FOLDER, 'filename_lookup.json')
        
        if os.path.exists(lookup_path):
            with open(lookup_path, 'r') as f:
                lookup = json.load(f)
            
            if secure_name in lookup:
                application_id = lookup[secure_name]
                
                # Find the application
                application = next((app for app in applications if app["id"] == application_id), None)
                
                if application:
                    return jsonify({
                        "filename": secure_name,
                        "applicant_name": f"{application['firstName']} {application['lastName']}",
                        "email": application["email"],
                        "position": application["position"],
                        "submission_date": application["timestamp"],
                        "job_id": application["job_id"]
                    })
        
        # If we couldn't find metadata, return basic file info
        file_stats = os.stat(file_path)
        return jsonify({
            "filename": secure_name,
            "size_bytes": file_stats.st_size,
            "created_timestamp": datetime.fromtimestamp(file_stats.st_ctime).isoformat(),
            "modified_timestamp": datetime.fromtimestamp(file_stats.st_mtime).isoformat()
        })
        
    except Exception as e:
        print(f"Error getting file info: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)