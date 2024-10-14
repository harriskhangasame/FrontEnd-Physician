import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import 'antd/dist/reset.css'; 

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar is open by default

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar visibility
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        {isSidebarOpen && <Sidebar />}
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[16vw]' : 'ml-0'}`}>
          <Chat isSidebarOpen={isSidebarOpen} />
        </div>
      </div>
    </div>
  );
}

export default App;
