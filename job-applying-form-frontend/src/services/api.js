// src/services/api.js
import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api';

// Configure axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle errors consistently
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data?.error || 'An unexpected error occurred');
  }
);

export const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs`);
      return response.data.jobs; // Make sure to return response.data.jobs, not just response.data
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
};
  

export const fetchJobDetails = async (jobId) => {
  try {
    const response = await api.get(`/jobs/${jobId}`);
    return response.job || null; // Return null if no job found
  } catch (error) {
    console.error(`Error fetching job details for ID ${jobId}:`, error);
    throw error;
  }
};

export const submitApplication = async (formData) => {
  try {
    // REMOVED: Don't create a new FormData here, use the one passed in
    // REMOVED: formDataToSend console.log that was referencing undefined variable
    
    // Debug: Log what's being sent
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    
    const response = await axios.post(`${API_BASE_URL}/apply`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      transformRequest: (data) => data, // Prevent axios from transforming FormData
    });

    return response.data;
  } catch (error) {
    console.error('Error submitting application:', error);
    if (error.response) {
      // Return the server's error message if available
      throw error.response.data.error || error.response.data.message || 'Submission failed';
    } else if (error.request) {
      throw 'No response received from server';
    } else {
      throw error.message || 'Error setting up request';
    }
  }
};


export const fetchApplications = async () => {
  try {
    const response = await api.get('/applications');
    return response.applications || []; // Return empty array if no applications
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
};

// Utility function to format date from API
export const formatJobDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};