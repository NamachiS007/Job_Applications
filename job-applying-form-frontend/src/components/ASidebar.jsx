'use client';

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoIosArrowForward } from "react-icons/io";
import { FaWpforms } from "react-icons/fa";
import { PiListChecksBold } from "react-icons/pi";
import { useAuth } from '../context/AuthContext';

export default function ASidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false); // Track logout button visibility

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: FaWpforms, 
      label: 'Job Applying Form' 
    },
    { 
      path: '/book-appointments', 
      icon: PiListChecksBold, 
      label: 'List of Applicants' 
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout(); // Call logout function
    navigate('/login'); // Redirect to login page
  };

  const isActive = (path) => {
    return location.pathname === path 
      ? 'bg-[#ff8303] font-semibold text-black' 
      : 'text-white-600 font-semibold hover:bg-[rgba(255,131,3,0.2)]';
  };

  return (
    <div className="flex flex-col h-screen w-64 text-gray-800 overflow-y-auto px-3 py-4" style={{backgroundColor: "#101828"}}>
      {/* Header */}
      <div className="flex justify-center items-center mb-4 relative">
        <div className="rounded-xl p-3 w-80 bg-white/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
              <img 
                src={user?.avatar || '/My Current Photo.jpg'} 
                alt="Profile" 
                className="h-full w-full object-cover" 
              />
            </div>
            <div className="flex-1">
              <h5 className="text-sm font-medium text-white">
                {user?.name || 'Namachi S'}
              </h5>
              <p className="text-sm text-gray-300">
                {user?.email || '@namachis'}
              </p>
            </div>
            {/* Arrow button to toggle logout */}
            <IoIosArrowForward 
              className="text-gray-400 cursor-pointer" 
              onClick={() => setShowLogout(!showLogout)} // Toggle logout button
            />
          </div>
        </div>

        {/* Logout Button */}
        {showLogout && (
          <div className="absolute top-16 right-0 bg-white text-black rounded-md shadow-lg p-2">
            <button 
              onClick={handleLogout} 
              className="w-full text-left px-4 py-2 hover:bg-gray-200 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Menu Label */}
      <div className="mb-2 px-2">
        <p className="text-xs text-gray-500 font-medium">Menu</p>
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col gap-1 flex-1">
        {menuItems.map((item) => (
          <button 
            key={item.path}
            onClick={() => handleNavigation(item.path)} 
            className={`flex items-center text-white px-2 py-2.5 rounded-lg text-sm ${isActive(item.path)}`}
          >
            <div className="w-8 flex justify-center">
              <item.icon className="h-5 w-5" />
            </div>
            <span className="ml-3">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
