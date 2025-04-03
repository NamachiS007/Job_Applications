'use client';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function Navbar() {
  return (
    <div className="w-full p-3 bg-[#101828] shadow-none drop-shadow-[0_5px_10px_rgba(0,0,0,0.1)] relative z-10">
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-1">
          <div className="flex flex-col">
            <h1 className="font-bold text-white" style={{fontSize: "20px"}}><span style={{ color: '#FF8303' }}>ClearCode Labs</span> | Job Application</h1> 
          </div>
        </div>
      </div>
    </div>
  );  
}