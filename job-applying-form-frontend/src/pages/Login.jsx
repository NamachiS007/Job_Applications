import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Link, 
  Checkbox, 
  FormControlLabel,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Register State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // UI State
  const [isLogin, setIsLogin] = useState(true);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Reusable TextField styling
  const textFieldStyle = {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#1E293B',
      '& fieldset': { 
        borderColor: '#334155', 
        borderRadius: '8px'
      },
      '&:hover fieldset': { borderColor: '#475569' },
      '&.Mui-focused fieldset': { borderColor: '#FF8303' },
    },
    '& .MuiInputBase-input': { 
      color: '#FFFFFF',
      padding: '12px 14px',
      '&:-webkit-autofill': {
        WebkitTextFillColor: '#FFFFFF',
        WebkitBoxShadow: '0 0 0 100px #1E293B inset',
        transition: 'background-color 5000s ease-in-out 0s'
      }
    },
    '& .MuiInputLabel-root': { 
      color: '#94A3B8',
      '&.Mui-focused': { color: '#FF8303' }
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check for specific credentials
      if (loginEmail === 'namachissnv@gmail.com' && loginPassword === '@Password123') {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const userData = {
          email: loginEmail,
          name: 'Admin User',
          avatar: '/default-avatar.png',
          role: 'admin'
        };
        
        login(userData); // Save user to context
        
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('user', JSON.stringify(userData));
        }
        
        navigate('/dashboard'); // This line should navigate to the dashboard
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      setError(err.message);
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (registerPassword !== confirmPassword) {
      setError("Passwords do not match");
      setOpenSnackbar(true);
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the terms and conditions");
      setOpenSnackbar(true);
      return;
    }

    // Here you would typically call your registration API
    // For now, we'll just log the user in
    handleLoginSubmit(e);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: "rgba(0, 0, 0, 0.98)",
        padding: '0',
        margin: '0',
        overflow: 'hidden',
        backgroundImage: 'url(/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Error Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Box 
        sx={{ 
          width: '100%', 
          maxWidth: isLogin ? '400px' : '450px', 
          background: '#0F172A',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'max-width 0.3s ease',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Logo and branding */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>
            <span style={{ color: '#FF8303' }}>ClearCode </span>Labs
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#9CA3AF', mt: 1 }}>
            {isLogin ? 'Your smile is our priority' : 'Create Your Account'}
          </Typography>
        </Box>

        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 'bold', 
            mb: 3, 
            color: '#FFFFFF', 
            textAlign: 'center' 
          }}
        >
          {isLogin ? 'Welcome Back' : 'Sign Up'}
        </Typography>

        {isLogin ? (
          // LOGIN FORM
          <form onSubmit={handleLoginSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              variant="outlined"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              type="email"
              placeholder="youremail@example.com"
              required
              sx={textFieldStyle}
            />

            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type={showLoginPassword ? 'text' : 'password'}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      edge="end"
                      sx={{ color: '#94A3B8' }}
                    >
                      {showLoginPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={textFieldStyle}
            />

            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2 
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{ 
                      color: '#64748B', 
                      '&.Mui-checked': { color: '#FF8303' } 
                    }} 
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                    Remember me
                  </Typography>
                }
              />
              <Link 
                href="#" 
                variant="body2" 
                sx={{ 
                  color: '#FF8303', 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: '#FF8303',
                color: '#FFFFFF',
                padding: '12px',
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#FF6B00',
                },
                '&.Mui-disabled': {
                  backgroundColor: '#FFA726',
                  color: '#FFFFFF'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Sign In'
              )}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                Don't have an account?{' '}
                <Link 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLogin(false);
                  }}
                  sx={{ 
                    color: '#FF8303', 
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </form>
        ) : (
          // REGISTER FORM
          <form onSubmit={handleRegisterSubmit}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                variant="outlined"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                sx={textFieldStyle}
              />
              <TextField
                fullWidth
                label="Last Name"
                variant="outlined"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                sx={textFieldStyle}
              />
            </Box>

            <TextField
              fullWidth
              label="Email Address"
              variant="outlined"
              type="email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              placeholder="youremail@example.com"
              required
              sx={textFieldStyle}
            />

            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type={showRegisterPassword ? 'text' : 'password'}
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      edge="end"
                      sx={{ color: '#94A3B8' }}
                    >
                      {showRegisterPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={textFieldStyle}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              variant="outlined"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      sx={{ color: '#94A3B8' }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={textFieldStyle}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  sx={{ 
                    color: '#64748B', 
                    '&.Mui-checked': { color: '#FF8303' } 
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  I agree to the Terms and Conditions
                </Typography>
              }
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                backgroundColor: '#FF8303',
                color: '#FFFFFF',
                padding: '12px',
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#FF6B00',
                },
                '&.Mui-disabled': {
                  backgroundColor: '#FFA726',
                  color: '#FFFFFF'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Create Account'
              )}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                Already have an account?{' '}
                <Link 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLogin(true);
                  }}
                  sx={{ 
                    color: '#FF8303', 
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </form>
        )}
      </Box>
    </Box>
  );
};

export default Login;