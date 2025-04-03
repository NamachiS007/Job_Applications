import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import {
  Work as WorkIcon,
  BusinessCenter as BusinessCenterIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '16px',
  boxShadow: theme.shadows[10],
  background: theme.palette.background.paper,
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  let bgColor;
  
  switch (status) {
    case 'approved':
      bgColor = theme.palette.success.main;
      break;
    case 'rejected':
      bgColor = theme.palette.error.main;
      break;
    case 'pending':
    default:
      bgColor = theme.palette.warning.main;
  }
  
  return {
    backgroundColor: bgColor,
    color: '#FFFFFF',
    fontWeight: 600,
    '& .MuiChip-icon': {
      color: '#FFFFFF'
    }
  };
});

const JobListItem = styled(ListItem)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '12px',
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[3],
    borderColor: theme.palette.primary.light,
  },
}));

const DetailItem = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
    <Box sx={{ mr: 2, color: 'text.secondary' }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body1">{value || 'Not specified'}</Typography>
    </Box>
  </Box>
);

const AppliedJobsList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  
  // PDF Viewer states
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/applications');
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        const data = await response.json();
        
        // Parse the skills field for each application
        const parsedApplications = data.applications.map(app => ({
          ...app,
          skills: JSON.parse(app.skills || '[]'),
          company: "Tech Corp",
          logoColor: theme.palette.primary.main,
          status: "pending"
        }));
        
        setApplications(parsedApplications);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setDetailDialogOpen(true);
  };

  const handleConfirmDelete = (id) => {
    setApplications(applications.filter(app => app.id !== id));
    setDeleteDialogOpen(false);
    setApplicationToDelete(null);
  };

  const openDeleteDialog = (application, event) => {
    event.stopPropagation();
    setApplicationToDelete(application);
    setDeleteDialogOpen(true);
  };

  const handleStatusChange = (applicationId, newStatus) => {
    setApplications(applications.map(app => 
      app.id === applicationId ? { ...app, status: newStatus } : app
    ));
    
    if (selectedApplication && selectedApplication.id === applicationId) {
      setSelectedApplication({ ...selectedApplication, status: newStatus });
    }
    
    console.log(`Application ${applicationId} status updated to ${newStatus}`);
  };

  // PDF Viewer functions
  const handlePdfOpen = (url) => {
    setPdfUrl(url);
    setPdfOpen(true);
  };

  const handlePdfClose = () => {
    setPdfOpen(false);
    setPdfUrl(null);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsPdfLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon />;
      case 'rejected':
        return <CloseIcon />;
      case 'pending':
      default:
        return <PendingIcon />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const PdfViewerDialog = () => (
    <Dialog
      open={pdfOpen}
      onClose={handlePdfClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { height: '90vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Document Preview</Typography>
        <IconButton onClick={handlePdfClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
        {isPdfLoading && <CircularProgress sx={{ my: 4 }} />}
        
        {pdfUrl ? (
          <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => console.error('PDF load error:', error)}
              loading={<CircularProgress />}
              options={{
                cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                cMapPacked: true,
              }}
            >
              {Array.from(new Array(numPages), (_, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={isMobile ? 400 : 800}
                  loading={<CircularProgress />}
                />
              ))}
            </Document>
          </Box>
        ) : (
          <Typography color="error">No document available</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Typography variant="body2" color="text.secondary">
          {numPages ? `Page 1 of ${numPages}` : 'Loading document...'}
        </Typography>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <StyledPaper>
        <Typography 
          variant="h5" 
          sx={{ 
            textAlign: 'center', 
            fontWeight: 700, 
            mb: 4,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          List of Job Applicants
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading applications...
            </Typography>
          </Box>
        ) : applications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <BusinessCenterIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, opacity: 0.3 }} />
            <Typography variant="h6" sx={{ mt: 2, color: theme.palette.text.secondary }}>
              No applications found
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {applications.length} applications
              </Typography>
            </Box>

            <List sx={{ width: '100%' }}>
              {applications.map((application) => (
                <JobListItem 
                  key={application.id} 
                  alignItems="flex-start"
                  onClick={() => handleViewDetails(application)}
                  sx={{ cursor: 'pointer' }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: application.logoColor }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 1 }}>
                          {application.firstName} {application.lastName} - {application.position}
                        </Typography>
                        <StatusChip
                          label={getStatusLabel(application.status)}
                          size="small"
                          status={application.status}
                          icon={getStatusIcon(application.status)}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          Applied on {formatDate(application.timestamp)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                            <LocationIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16, color: theme.palette.text.secondary }} />
                            <Typography variant="caption" color="text.secondary">
                              {application.city}, {application.country}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                            <EmailIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16, color: theme.palette.text.secondary }} />
                            <Typography variant="caption" color="text.secondary">
                              {application.email}
                            </Typography>
                          </Box>
                        </Box>
                      </>
                    }
                  />
                </JobListItem>
              ))}
            </List>
          </>
        )}
      </StyledPaper>

      {/* Application Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        {selectedApplication && (
          <>
            <DialogTitle
              sx={{
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: 'white',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Applicant Details
              </Box>
              <IconButton 
                edge="end" 
                color="inherit" 
                onClick={() => setDetailDialogOpen(false)}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ 
                  bgcolor: selectedApplication.logoColor, 
                  mr: 2,
                  width: 60,
                  height: 60,
                  fontSize: '2rem'
                }}>
                  {selectedApplication.firstName.charAt(0)}{selectedApplication.lastName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {selectedApplication.firstName} {selectedApplication.lastName}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {selectedApplication.position}
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <StatusChip
                    label={getStatusLabel(selectedApplication.status)}
                    size="medium"
                    status={selectedApplication.status}
                    icon={getStatusIcon(selectedApplication.status)}
                  />
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                {/* Personal Information */}
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 2 }}>
                    Personal Information
                  </Typography>
                  
                  <Box sx={{ display: 'grid', rowGap: 2 }}>
                    <DetailItem icon={<EmailIcon />} label="Email" value={selectedApplication.email} />
                    <DetailItem icon={<PhoneIcon />} label="Phone" value={selectedApplication.phone} />
                    <DetailItem icon={<CalendarIcon />} label="Age" value={selectedApplication.age} />
                    <DetailItem icon={<LocationIcon />} label="Current Location" value={selectedApplication.currentPlace} />
                    <DetailItem icon={<HomeIcon />} label="Address" value={selectedApplication.address} />
                  </Box>
                </Paper>
                
                {/* Professional Information */}
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 2 }}>
                    Professional Information
                  </Typography>
                  
                  <Box sx={{ display: 'grid', rowGap: 2 }}>
                    <DetailItem icon={<SchoolIcon />} label="Education Level" value={selectedApplication.educationLevel} />
                    <DetailItem icon={<WorkIcon />} label="Experience" value={selectedApplication.experience} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <CodeIcon sx={{ mr: 2, color: 'primary.main', mt: 0.5 }} />
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>Skills:</Typography>
                        <Box sx={{ mt: 1 }}>
                          {selectedApplication.skills.map((skill, i) => (
                            <Chip 
                              key={i} 
                              label={skill} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }} 
                              color="primary" 
                              variant="contained" 
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                    
                    <DetailItem icon={<AccessTimeIcon />} label="Availability" value={selectedApplication.availability} />
                    <DetailItem icon={<CalendarIcon />} label="Applied Date" value={formatDate(selectedApplication.timestamp)} />
                  </Box>
                </Paper>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Application Documents
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
                  {selectedApplication.resume && (
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DescriptionIcon color="primary" sx={{ mr: 2 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1">Resume</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedApplication.resume.filename}
                          </Typography>
                        </Box>
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => handlePdfOpen(selectedApplication.resume.download_url)}
                          sx={{ borderRadius: '20px' }}
                        >
                          View
                        </Button>
                      </Box>
                    </Paper>
                  )}

                  {selectedApplication.cover_letter && (
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DescriptionIcon color="secondary" sx={{ mr: 2 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1">Cover Letter</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedApplication.cover_letter.filename}
                          </Typography>
                        </Box>
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => handlePdfOpen(selectedApplication.cover_letter.download_url)}
                          sx={{ borderRadius: '20px' }}
                        >
                          View
                        </Button>
                      </Box>
                    </Paper>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={(e) => openDeleteDialog(selectedApplication, e)}
                color="error"
                variant="contained"
                startIcon={<DeleteIcon />}
                sx={{ 
                  borderRadius: '4px',
                  textTransform: 'none',
                  boxShadow: 'none',
                  backgroundColor: '#d32f2f', // Ensure initial color
                  borderColor: '#d32f2f',
                  '&:hover': {
                    backgroundColor: 'rgba(211, 47, 47, 0.85)', // Darker red on hover
                    borderColor: '#b71c1c'
                  },
                  '&:focus': {
                    backgroundColor: '#d32f2f', // Prevent white color on focus
                    borderColor: '#b71c1c'
                  },
                  '&:active': {
                    backgroundColor: '#b71c1c', // Ensure proper click color
                    borderColor: '#9a0007'
                  }
                }}
              >
                Delete Application
              </Button>
              
              <Box>
                <Button
                  onClick={() => handleStatusChange(selectedApplication.id, 'approved')}
                  variant="contained"
                  sx={{ 
                    ml: 1, 
                    borderRadius: '4px',
                    backgroundColor: '#2e7d32',
                    textTransform: 'none',
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
                    '&:hover': {
                      backgroundColor: '#1b5e20'
                    }
                  }}
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleStatusChange(selectedApplication.id, 'pending')}
                  variant="contained"
                  sx={{ 
                    ml: 1, 
                    borderRadius: '4px',
                    backgroundColor: '#ed6c02',
                    textTransform: 'none',
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
                    '&:hover': {
                      backgroundColor: '#e65100'
                    }
                  }}
                >
                  On-hold
                </Button>
                <Button
                  onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}
                  variant="contained"
                  sx={{ 
                    ml: 1, 
                    borderRadius: '4px',
                    backgroundColor: '#d32f2f',
                    textTransform: 'none',
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
                    '&:hover': {
                      backgroundColor: '#b71c1c'
                    }
                  }}
                >
                  Reject
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 600, mt: 3 }}>
          Delete Application
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 3 }}>
          <DialogContentText>
            Are you sure you want to delete the application for{' '}
            <strong>{applicationToDelete?.firstName} {applicationToDelete?.lastName}</strong>?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleConfirmDelete(applicationToDelete?.id)} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* PDF Viewer Dialog */}
      <PdfViewerDialog />
    </Container>
  );
};

export default AppliedJobsList;