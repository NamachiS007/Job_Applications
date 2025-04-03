'use client';

import { FaSearch, FaBell, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { format } from 'date-fns';

export default function Navbar({ onDateRangeSelect }) {
  const navigate = useNavigate();
  const [showDateRange, setShowDateRange] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  const handleDateSelect = (ranges) => {
    setDateRange([ranges.selection]);
    if (onDateRangeSelect) {
      onDateRangeSelect({
        startDate: format(ranges.selection.startDate, 'yyyy-MM-dd'),
        endDate: format(ranges.selection.endDate, 'yyyy-MM-dd')
      });
    }
    setShowDateRange(false);
  };

  return (
    <div className="w-full p-3 bg-[#101828] shadow-none drop-shadow-[0_5px_10px_rgba(0,0,0,0.1)] relative z-10">
      <div className="flex items-center justify-end"> {/* Use justify-between to separate left & right */}
        
        {/* Left: Dental Branding */}
        <div className="flex items-center space-x-1">
          <div className="flex flex-col">
            <h1 className="font-bold text-white" style={{fontSize: "20px"}}>ClearCode Labs - Job Application</h1> 
          </div>
        </div>
      </div>
    </div>
  );  
}