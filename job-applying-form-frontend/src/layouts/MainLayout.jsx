import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/ASidebar';

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />
        
        {/* Main Content - Pages will render here */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;