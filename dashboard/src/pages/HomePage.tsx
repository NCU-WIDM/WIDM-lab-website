import React from 'react';
import DefaultLayout from '../layout/DefaultLayout';
import { NavLink } from 'react-router-dom';

const HomePage: React.FC = () => {
  const webUrl = import.meta.env.VITE_WEB_URL || '#';
  const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || '#';

  // 定義 MouseEnter 和 MouseLeave 處理函數
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 1)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.7)';
  };

  return (
    <DefaultLayout>
      <div className="flex flex-col justify-center items-center h-screen text-center text-black text-lg">
        <div className="w-full">
          <div className="mb-2">
            正式機 Web: 
            <a href={webUrl} className="text-blue-500 no-underline ml-2">
              {webUrl}
            </a>
          </div>
          
          <div className="mb-8">
            正式機 Dashboard: 
            <a href={dashboardUrl} className="text-blue-500 no-underline ml-2">
              {dashboardUrl}
            </a>
          </div>

          <div className="flex flex-col items-center gap-2">
            <NavLink
              to="/activity"
              className="text-white bg-blue-500 bg-opacity-70 py-2 px-10 rounded transition-all duration-300 w-1/2 text-center"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              Activity
            </NavLink>
            <NavLink
              to="/member"
              className="text-white bg-blue-500 bg-opacity-70 py-2 px-10 rounded transition-all duration-300 w-1/2 text-center"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              Member
            </NavLink>
            <NavLink
              to="/news"
              className="text-white bg-blue-500 bg-opacity-70 py-2 px-10 rounded transition-all duration-300 w-1/2 text-center"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              News
            </NavLink>
            <NavLink
              to="/paper"
              className="text-white bg-blue-500 bg-opacity-70 py-2 px-10 rounded transition-all duration-300 w-1/2 text-center"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              Paper
            </NavLink>
            <NavLink
              to="/project"
              className="text-white bg-blue-500 bg-opacity-70 py-2 px-10 rounded transition-all duration-300 w-1/2 text-center"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              Project
            </NavLink>
            <NavLink
              to="/project_task"
              className="text-white bg-blue-500 bg-opacity-70 py-2 px-10 rounded transition-all duration-300 w-1/2 text-center"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              Project Task
            </NavLink>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default HomePage;
