from flask import Flask, request, jsonify, send_from_directory, abort
import os
import uuid
from werkzeug.utils import secure_filename
from datetime import datetime
from flask_cors import CORS
import mimetypes
import PyPDF2

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
    }
})

# Create uploads directory
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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

# Applications will be stored here during runtime only
applications = []

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_pdf_text(file_path):
    """Extract text from PDF file for preview"""
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
                'download_url': f"/download/{resume_filename}"
            }
            
        if enhanced_app.get('cover_letter_path'):
            cl_filename = os.path.basename(enhanced_app['cover_letter_path'])
            enhanced_app['cover_letter'] = {
                'filename': cl_filename,
                'original_name': f"{enhanced_app['firstName']}_{enhanced_app['lastName']}_CoverLetter",
                'download_url': f"/download/{cl_filename}"
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
                'download_url': f"/download/{resume_filename}"
            }
            
        if enhanced_app.get('cover_letter_path'):
            cl_filename = os.path.basename(enhanced_app['cover_letter_path'])
            enhanced_app['cover_letter'] = {
                'filename': cl_filename,
                'original_name': f"{enhanced_app['firstName']}_{enhanced_app['lastName']}_CoverLetter",
                'download_url': f"/download/{cl_filename}"
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

if __name__ == '__main__':
    app.run(debug=True)