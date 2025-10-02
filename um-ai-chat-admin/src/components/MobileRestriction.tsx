import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop, faMobile } from '@fortawesome/free-solid-svg-icons';

const MobileRestriction: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#292929] flex items-center justify-center">
      <div className="text-center text-white p-8 max-w-md mx-auto">
        {/* Mobile Icon */}
        <div className="mb-6">
          <FontAwesomeIcon 
            icon={faMobile} 
            className="text-6xl text-[#900C27] mb-4"
          />
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold mb-4">
          ask<span className="text-[#900C27]">VC</span> Admin
        </h1>
        
        {/* Message */}
        <div className="bg-[#4a4a4a] rounded-lg p-6 mb-6">
          <FontAwesomeIcon 
            icon={faDesktop} 
            className="text-2xl text-[#900C27] mb-3"
          />
          <h2 className="text-xl font-semibold mb-3">Desktop Only</h2>
          <p className="text-gray-300 leading-relaxed">
            The admin panel is designed for desktop use only. 
            Please access this interface from a desktop or laptop computer 
            for the best experience and full functionality.
          </p>
        </div>
        
        {/* Additional Info */}
        <div className="text-sm text-gray-400">
          <p>For mobile users, please use the mobile app instead.</p>
        </div>
      </div>
    </div>
  );
};

export default MobileRestriction;
