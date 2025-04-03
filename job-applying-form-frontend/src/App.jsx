import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import JobApplicationForm from './pages/Dashboard';
import AppliedJobsList from './pages/ListofApplicants';
// import Appointments from './pages/Appointments';
// import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* All protected routes use MainLayout */}
          <Route element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<JobApplicationForm />} />
            <Route path="/dashboard" element={<JobApplicationForm />} />
            <Route path="/book-appointments" element={<AppliedJobsList />} />
            {/* <Route path="/appointments" element={<Appointments />} />
            <Route path="/settings" element={<Settings />} /> */}
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;