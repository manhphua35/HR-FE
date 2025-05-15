import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        
        <div className="flex items-center">
          {/* User profile */}
          <div className="flex items-center">
            <img 
              src="https://randomuser.me/api/portraits/men/1.jpg" 
              alt="User profile" 
              className="h-8 w-8 rounded-full mr-2" 
            />
            <span className="text-sm font-medium text-gray-700">Admin User</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 