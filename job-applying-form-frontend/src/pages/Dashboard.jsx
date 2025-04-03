import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Container,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Error as ErrorIcon,
  Description as DescriptionIcon,
  Article as ArticleIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
  School as SchoolIcon,
  Star as StarIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Send as SendIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Snackbar, Alert } from '@mui/material';
import { submitApplication, fetchJobs } from '../services/api';
import IconButton from '@mui/material/IconButton';

const ColorButton = styled(Button)(({ theme }) => ({
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    color: theme.palette.common.white,
    fontWeight: 600,
    padding: '10px 24px',
    boxShadow: theme.shadows[3],
    '&:hover': {
      boxShadow: theme.shadows[6],
      background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
    },
    '&.Mui-disabled': {
      background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      color: theme.palette.common.white,
      opacity: 0.7,
    },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '16px',
  boxShadow: theme.shadows[10],
  background: theme.palette.background.paper,
}));

const UploadArea = styled(Box)(({ theme, error }) => ({
  border: `2px dashed ${error ? theme.palette.error.main : theme.palette.primary.main}`,
  borderRadius: '12px',
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: theme.palette.background.default,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-2px)',
  },
}));

const JobApplicationForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showJobListings, setShowJobListings] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    linkedIn: '',
    portfolio: '',
    currentPlace: '',
    availability: '',
    position: '',
    experience: '',
    education: '',
    skills: [],
    resume: null,
    coverLetter: null,
    job_id: ''
  });
  
  const [errors, setErrors] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const steps = ['Personal Info', 'Professional Details', 'Documents', 'Review'];
  
  const educationLevels = [
    'High School',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Other',
  ];

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetchJobs();
        setJobs(response); 
        console.log("Jobs loaded:", response);
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoadingJobs(false);
      }
    };
    loadJobs();
  }, []);

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setFormData(prev => ({
      ...prev,
      position: job.title,
      job_id: job.id
    }));
    setShowJobListings(false);
  };

  const handleBackToListings = () => {
    setShowJobListings(true);
    setSelectedJob(null);
    setActiveStep(0);
    // Reset form and errors when returning to listings
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      age: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      linkedIn: '',
      portfolio: '',
      currentPlace: '',
      availability: '',
      position: '',
      experience: '',
      education: '',
      skills: [],
      resume: null,
      coverLetter: null,
      job_id: ''
    });
    setErrors({});
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const fileType = file.type;
      const fileSize = file.size / 1024 / 1024; // Convert to MB
      
      if (
        fileType === 'application/pdf' || 
        fileType === 'application/msword' || 
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        if (fileSize <= 5) {
          setFormData({
            ...formData,
            [name]: file
          });
          
          if (errors[name]) {
            setErrors({
              ...errors,
              [name]: null
            });
          }
        } else {
          setErrors({
            ...errors,
            [name]: 'File size must be less than 5MB'
          });
        }
      } else {
        setErrors({
          ...errors,
          [name]: 'Please upload a PDF or Word document only'
        });
      }
    }
  };
  
  const handleAddSkill = () => {
    if (newSkill.trim() !== '' && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
      
      if (errors.skills) {
        setErrors({
          ...errors,
          skills: null
        });
      }
    }
    setOpenDialog(false);
  };
  
  const handleDeleteSkill = (skillToDelete) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToDelete)
    });
  };
  
  const validateStep = (step) => {
    let newErrors = {};
    let isValid = true;
    
    if (step === 0) {
      // Personal information validation
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
        isValid = false;
      } else if (!/^[A-Za-z\s]+$/.test(formData.firstName)) {
        newErrors.firstName = 'First name should contain only letters';
        isValid = false;
      }
      
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
        isValid = false;
      } else if (!/^[A-Za-z\s]+$/.test(formData.lastName)) {
        newErrors.lastName = 'Last name should contain only letters';
        isValid = false;
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
        isValid = false;
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
      
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
        isValid = false;
      } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
        isValid = false;
      }
      
      if (!formData.age) {
        newErrors.age = 'Age is required';
        isValid = false;
      } else if (isNaN(formData.age) || parseInt(formData.age) < 18 || parseInt(formData.age) > 100) {
        newErrors.age = 'Age must be between 18 and 100';
        isValid = false;
      }
      
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
        isValid = false;
      }
      
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
        isValid = false;
      }
      
      if (!formData.country.trim()) {
        newErrors.country = 'Country is required';
        isValid = false;
      }
      
      if (!formData.currentPlace.trim()) {
        newErrors.currentPlace = 'Current place is required';
        isValid = false;
      }
      
      if (!formData.availability.trim()) {
        newErrors.availability = 'Availability information is required';
        isValid = false;
      }
      
      // Optional fields validation
      if (formData.linkedIn.trim() && !/^https?:\/\/(?:www\.)?linkedin\.com\/in\/[\w-]+\/?$/.test(formData.linkedIn)) {
        newErrors.linkedIn = 'Please enter a valid LinkedIn URL';
        isValid = false;
      }
      
      if (formData.portfolio.trim() && !/^https?:\/\/(?:www\.)?[\w-]+\.[\w.-]+\/?.*$/.test(formData.portfolio)) {
        newErrors.portfolio = 'Please enter a valid portfolio URL';
        isValid = false;
      }
    } else if (step === 1) {
      // Professional details validation
      if (!formData.position) {
        newErrors.position = 'Position is required';
        isValid = false;
      }
      
      if (!formData.experience.trim()) {
        newErrors.experience = 'Experience information is required';
        isValid = false;
      } else if (formData.experience.trim().length < 50) {
        newErrors.experience = 'Please provide more detailed experience information (minimum 50 characters)';
        isValid = false;
      }
      
      if (!formData.education) {
        newErrors.education = 'Education level is required';
        isValid = false;
      }
      
      if (formData.skills.length === 0) {
        newErrors.skills = 'At least one skill is required';
        isValid = false;
      } else if (formData.skills.length < 2) {
        newErrors.skills = 'Please add at least two skills';
        isValid = false;
      }
    } else if (step === 2) {
      // Documents validation
      if (!formData.resume) {
        newErrors.resume = 'Resume is required';
        isValid = false;
      }
      
      if (formData.coverLetter) {
        const coverLetterSize = formData.coverLetter.size / 1024 / 1024; // Convert to MB
        if (coverLetterSize > 5) {
          newErrors.coverLetter = 'Cover letter must be less than 5MB';
          isValid = false;
        }
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
  };
  
  const handleFinalSubmit = async () => {
    try {
      // Validate all steps before final submission
      for (let i = 0; i < steps.length - 1; i++) {
        if (!validateStep(i)) {
          setActiveStep(i);
          return;
        }
      }
      
      setIsSubmitting(true);
      
      // Create FormData properly
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('age', formData.age);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('currentPlace', formData.currentPlace);
      formDataToSend.append('availability', formData.availability);
      formDataToSend.append('position', formData.position);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('educationLevel', formData.education);
      formDataToSend.append('skills', JSON.stringify(formData.skills));
      formDataToSend.append('job_id', selectedJob.id);
      
      // Add optional fields if they exist
      if (formData.linkedIn) formDataToSend.append('linkedIn', formData.linkedIn);
      if (formData.portfolio) formDataToSend.append('portfolio', formData.portfolio);
      
      // Add files
      formDataToSend.append('resume', formData.resume);
      if (formData.coverLetter) {
        formDataToSend.append('coverLetter', formData.coverLetter);
      }
      
      // Debug what's being sent
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }
      
      // Send to backend
      const response = await submitApplication(formDataToSend);
      
      setOpenSnackbar(true);
      handleBackToListings();
    } catch (error) {
      console.error('Submission failed:', error);
      setErrors({
        ...errors,
        submit: error.message || 'Application submission failed'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  const getFileIcon = (file) => {
    if (!file) return null;
    
    if (file.type === 'application/pdf') {
      return <DescriptionIcon color="primary" fontSize="large" />;
    } else {
      return <ArticleIcon color="primary" fontSize="large" />;
    }
  };

  const renderJobListings = () => (
    <Box sx={{ maxWidth: '1200px' }}>
      <Typography 
        variant="h5" 
        sx={{ 
          textAlign: 'center', 
          fontWeight: 700, 
          mb: 3,
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Current Job Openings
      </Typography>
      {loadingJobs ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={30} />
        </Box>
      ) : jobs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" color="text.secondary">
            No job openings available at the moment
          </Typography>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          width: '100%',
        }}>
          {jobs.map((job) => (
            <Card 
              key={job.id} 
              sx={{ 
                borderRadius: '8px',
                boxShadow: theme.shadows[1],
                border: '2px solid', 
                borderImageSource: 'linear-gradient(to right, #4ABFFF, #4C00FF)', 
                borderImageSlice: 1,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[3],
                }
              }}
            >          
              <CardContent sx={{ py: 1.5, px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BusinessIcon color="primary" sx={{ mr: 1, fontSize: '1.2rem' }} />
                  <Typography variant="subtitle1" component="div" sx={{ fontSize: '23px', fontWeight: 'bold' }}>
                    {job.title}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '1rem' }} />
                    <Typography variant="body2" color="text.secondary">
                      {job.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '1rem' }} />
                    <Typography variant="body2" color="text.secondary">
                      {job.salary}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '1rem' }} />
                    <Typography variant="body2" color="text.secondary">
                      Posted: {new Date(job.posted_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={{ fontSize: '0.85rem', mb: 1 }}>
                  {job.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                <ColorButton 
                  variant="contained" 
                  size="small"
                  onClick={() => handleJobSelect(job)}
                  sx={{ 
                    width: 'auto', 
                    px: 2, 
                    py: 0.5, 
                    fontSize: '0.75rem' 
                  }}
                >
                  Apply Now
                </ColorButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
  
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                <PersonIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Personal Information</Typography>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <TextField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    variant="outlined"
                    size="medium"
                    inputProps={{ maxLength: 50 }}
                    placeholder="Enter your first name"
                />
                
                <TextField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    variant="outlined"
                    size="medium"
                    inputProps={{ maxLength: 50 }}
                    placeholder="Enter your last name"
                />
                
                <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!errors.email}
                    helperText={errors.email}
                    variant="outlined"
                    size="medium"
                    inputProps={{ maxLength: 100 }}
                    placeholder="example@email.com"
                />
                
                <TextField
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!errors.phone}
                    helperText={errors.phone}
                    variant="outlined"
                    size="medium"
                    inputProps={{ maxLength: 20 }}
                    placeholder="+1 123-456-7890"
                />

                <TextField
                    label="Age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!errors.age}
                    helperText={errors.age}
                    variant="outlined"
                    size="medium"
                    InputProps={{ inputProps: { min: 18, max: 100 } }}
                    placeholder="Enter your age"
                />

                <TextField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!errors.address}
                    helperText={errors.address}
                    variant="outlined"
                    size="medium"
                    inputProps={{ maxLength: 200 }}
                    placeholder="Enter your address"
                />

                <TextField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!errors.city}
                    helperText={errors.city}
                    variant="outlined"
                    size="medium"
                    inputProps={{ maxLength: 100 }}
                    placeholder="Enter your city"
                />

                <TextField
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!errors.country}
                    helperText={errors.country}
                    variant="outlined"
                    size="medium"
                    inputProps={{ maxLength: 100 }}
                    placeholder="Enter your country"
                />

                <TextField
                    label="Current Place"
                    name="currentPlace"
                    value={formData.currentPlace}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!errors.currentPlace}
                    helperText={errors.currentPlace}
                    variant="outlined"
                    size="medium"
                    inputProps={{ maxLength: 100 }}
                    placeholder="Current city/location"
                />

                <TextField
                    label="Availability/Notice Period"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!errors.availability}
                    helperText={errors.availability}
                    variant="outlined"
                    size="medium"
                    inputProps={{ maxLength: 100 }}
                    placeholder="e.g., 2 weeks notice, available immediately"
                />

                <TextField
                    label="LinkedIn Profile"
                    name="linkedIn"
                    value={formData.linkedIn}
                    onChange={handleInputChange}
                    fullWidth
                    error={!!errors.linkedIn}
                    helperText={errors.linkedIn}
                    variant="outlined"
                    size="medium"
                    inputProps={{ maxLength: 100 }}
                    placeholder="https://linkedin.com/in/yourprofile"
                />

                <TextField
                    label="Portfolio Website"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    fullWidth
                    error={!!errors.portfolio}
                    helperText={errors.portfolio}
                    variant="outlined"
                    size="medium"
                    inputProps={{ maxLength: 100 }}
                    placeholder="https://yourportfolio.com"
                />
                </Box>
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>
                <WorkIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Professional Details</Typography>
            </Box>
            
            <Box sx={{ display: 'grid', gap: 3 }}>
              {/* Display job position as read-only field */}
              <TextField
                label="Position"
                name="position"
                value={formData.position}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                required
                variant="outlined"
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: theme.palette.text.primary,
                    fontWeight: "500",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.main,
                  },
                }}
              />
              
              <TextField
                label="Experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                placeholder="Please describe your relevant work experience (minimum 50 characters)"
                required
                error={!!errors.experience}
                helperText={errors.experience}
                variant="outlined"
                inputProps={{ maxLength: 2000 }}
              />
              
              <FormControl fullWidth error={!!errors.education} required>
                <InputLabel>Education Level</InputLabel>
                <Select
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  label="Education Level"
                  variant="outlined"
                >
                  {educationLevels.map((edu) => (
                    <MenuItem key={edu} value={edu}>{edu}</MenuItem>
                  ))}
                </Select>
                {errors.education && <FormHelperText>{errors.education}</FormHelperText>}
              </FormControl>
              
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{color: 'bold'}}>Skills (minimum 2 required)</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {formData.skills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      onDelete={() => handleDeleteSkill(skill)}
                      color="primary"
                      variant="contained"
                    />
                  ))}
                </Box>
                
                <Button 
                  variant="comtained" 
                  onClick={() => setOpenDialog(true)}
                  size="medium"
                  startIcon={<AddIcon />}
                >
                  Add Skill
                </Button>
                
                {errors.skills && (
                  <FormHelperText error sx={{ mt: 1 }}>{errors.skills}</FormHelperText>
                )}
              </Box>
            </Box>
            
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 4 } }}>
              <DialogTitle
                sx={{
                    background: 'linear-gradient(90deg, #007BFF, #9C27B0)',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                }}
              >Add a Skill</DialogTitle>
              <DialogContent sx={{ pt: 3 }}>
                <DialogContentText sx={{ mt: 3, fontSize: '0.9rem', fontWeight: 'bold' }}>
                  Enter a skill you want to add to your application:
                </DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  label="Skill"
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                />
              </DialogContent>
              <DialogActions sx={{ mb: 3, mr: 2 }}>
                <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
                <ColorButton onClick={handleAddSkill} color="primary" variant="contained">Add Skill</ColorButton>
              </DialogActions>
            </Dialog>
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.info.main, mr: 2 }}>
                <DescriptionOutlinedIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Upload Documents</Typography>
            </Box>
            
            <Box sx={{ display: 'grid', gap: 2 }}>
              <label htmlFor="resume-upload">
                <input
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  id="resume-upload"
                  type="file"
                  name="resume"
                  onChange={handleFileChange}
                />
                
                <UploadArea error={!!errors.resume}>
                  {formData.resume ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {getFileIcon(formData.resume)}
                      <Typography variant="body1" sx={{ fontWeight: 500, mt: 2 }}>
                        {formData.resume.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(formData.resume.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <CloudUploadIcon color="primary" sx={{ fontSize: 48 }} />
                      <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>Upload Resume</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        PDF or Word document only (Max 5MB)
                      </Typography>
                    </Box>
                  )}
                  
                  {errors.resume && (
                    <Typography color="error" variant="caption" sx={{ display: 'block', mt: 2 }}>
                      <ErrorIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      {errors.resume}
                    </Typography>
                  )}
                </UploadArea>
              </label>
              
              <label htmlFor="cover-letter-upload">
                <input
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  id="cover-letter-upload"
                  type="file"
                  name="coverLetter"
                  onChange={handleFileChange}
                />
                
                <UploadArea error={!!errors.coverLetter}>
                  {formData.coverLetter ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {getFileIcon(formData.coverLetter)}
                      <Typography variant="body1" sx={{ fontWeight: 500, mt: 2 }}>
                        {formData.coverLetter.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(formData.coverLetter.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <ArticleIcon color="primary" sx={{ fontSize: 48 }} />
                      <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>Upload Cover Letter (Optional)</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        PDF or Word document only (Max 5MB)
                      </Typography>
                    </Box>
                  )}
                  
                  {errors.coverLetter && (
                    <Typography color="error" variant="caption" sx={{ display: 'block', mt: 2 }}>
                      <ErrorIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      {errors.coverLetter}
                    </Typography>
                  )}
                </UploadArea>
              </label>
            </Box>
          </Box>
        );
        
      case 3:
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1}}>
              <Avatar sx={{ bgcolor: theme.palette.success.main, mr: 2 }}>
                <CheckCircleIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Review Your Application</Typography>
            </Box>
            
            <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Applying for: {selectedJob?.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedJob?.company} - {selectedJob?.location}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Personal Information</Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Name</Typography>
                  <Typography>{formData.firstName} {formData.lastName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography>{formData.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography>{formData.phone}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 3 }}>
                <WorkIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Professional Details</Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Position</Typography>
                  <Typography>{formData.position}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Education</Typography>
                  <Typography>{formData.education}</Typography>
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="caption" color="text.secondary">Experience</Typography>
                  <Typography sx={{ whiteSpace: 'pre-line' }}>{formData.experience}</Typography>
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="caption" color="text.secondary">Skills</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {formData.skills.map(skill => (
                      <Chip key={skill} label={skill} size="small" color="primary" />
                    ))}
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 3 }}>
                <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Uploaded Documents</Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getFileIcon(formData.resume)}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="caption" color="text.secondary">Resume</Typography>
                    <Typography variant="body2">{formData.resume?.name}</Typography>
                  </Box>
                </Box>
                
                {formData.coverLetter && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getFileIcon(formData.coverLetter)}
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="caption" color="text.secondary">Cover Letter</Typography>
                      <Typography variant="body2">{formData.coverLetter.name}</Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: theme.palette.grey[100], borderRadius: '8px' }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                By submitting this application, you certify that all information provided is true and complete.
              </Typography>
            </Box>
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        py: 2,
        height: '93vh',
        maxHeight: '800px',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <StyledPaper sx={{ 
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {showJobListings ? (
          renderJobListings()
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton onClick={handleBackToListings} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Application for {selectedJob?.title}
              </Typography>
            </Box>
            
            <Stepper 
              activeStep={activeStep} 
              sx={{ mb: 4 }}
              alternativeLabel={isMobile}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel 
                    StepIconProps={{
                      sx: {
                        '&.Mui-completed': {
                          color: theme.palette.success.main,
                        },
                        '&.Mui-active': {
                          color: theme.palette.primary.main,
                        },
                      }
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ 
              flex: 1,
              overflow: 'auto',
              pb: 2
            }}>
              {isSubmitting && (
                <Box sx={{ width: '100%', mb: 3 }}>
                  <LinearProgress />
                  <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                    Submitting your application...
                  </Typography>
                </Box>
              )}
              
              <form onSubmit={handleSubmit} noValidate style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {renderStepContent(activeStep)}
                
                <Box sx={{ 
                  mt: 'auto',
                  pt: 4, 
                  display: 'flex', 
                  justifyContent: 'space-between'
                }}>
                  <Button
                    disabled={activeStep === 0 || isSubmitting}
                    onClick={handleBack}
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    sx={{ borderRadius: '8px' }}
                  >
                    Back
                  </Button>
                  
                  <Box>
                    {activeStep === steps.length - 1 ? (
                      <ColorButton
                        type="button"
                        variant="contained"
                        size="large"
                        endIcon={<SendIcon />}
                        disabled={isSubmitting}
                        onClick={handleFinalSubmit}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      </ColorButton>
                    ) : (
                      <ColorButton
                        variant="contained"
                        onClick={handleNext}
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        disabled={isSubmitting}
                        type="button"
                      >
                        Next
                      </ColorButton>
                    )}
                  </Box>
                </Box>
              </form>
            </Box>
          </>
        )}
      </StyledPaper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 5 }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity="success" 
          sx={{ 
            width: '100%',
            border: '2px solid #4caf50',
            borderRadius: '8px'
          }}
          variant="filled"
        >
          Application submitted successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default JobApplicationForm;