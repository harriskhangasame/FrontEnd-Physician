import React from 'react';
import { motion } from 'framer-motion';
import { useLocalContext } from '../context/context';
import db from '../lib/firebase';

const Sidebar = () => {
  const {user} = useLocalContext();
  return (
    <motion.div
      initial={{ x: '-100%' }} // Start off-screen
      animate={{ x: 0 }} // Slide in
      exit={{ x: '-100%' }} // Slide out
      transition={{ type: 'tween', duration: 0.3 }} // Smooth transition
      className="fixed top-[5rem] bottom-0 w-[16vw] h-[86.8vh] flex flex-col items-center py-6 border-r bg-white text-black shadow-lg overflow-y-auto"
    >
      {/* Title */}
      <h2 className="text-xl font-bold mb-6 text-[#015BA3]">Query Manager</h2>

      {/* New Query Button */}
      <button className="bg-[#015BA3] text-white font-semibold px-4 py-3 rounded-md w-[90%] hover:bg-[#00457f] focus:ring focus:ring-[#015BA3] mb-8">
        New Query +
      </button>

      {/* Sidebar Content */}
      <div className="flex flex-col items-start w-full px-4 space-y-4">
        {/* Example content - Replace with your own */}
        <div className="w-full p-4 bg-gray-100 rounded-md shadow-sm">
          <p className="text-sm font-medium">Query 1</p>
        </div>
        <div className="w-full p-4 bg-gray-100 rounded-md shadow-sm">
          <p className="text-sm font-medium">Query 2</p>
        </div>
        <div className="w-full p-4 bg-gray-100 rounded-md shadow-sm">
          <p className="text-sm font-medium">Query 3</p>
        </div>
        {/* Add more queries or content as needed */}
      </div>
    </motion.div>
  );
};

export default Sidebar;
