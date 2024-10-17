import React from 'react';
import DefaultLayout from '../layout/DefaultLayout';
import { NavLink } from 'react-router-dom';

const HomePage: React.FC = () => {
  const webUrl = import.meta.env.VITE_WEB_URL || '#';
  const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || '#';

  // 抽取 NavLink 的通用樣式
  const navLinkClass = `
    text-blue-700 border-2 border-blue-700 
    bg-opacity-5 bg-blue-500 
    py-3 px-10 rounded 
    transition-all duration-300 
    w-1/2 text-center

    hover:bg-sky-600
    hover:text-white

  `;

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
              className={navLinkClass}
            >
              Activity
            </NavLink>
            <NavLink
              to="/member"
              className={navLinkClass}
            >
              Member
            </NavLink>
            <NavLink
              to="/news"
              className={navLinkClass}
            >
              News
            </NavLink>
            <NavLink
              to="/paper"
              className={navLinkClass}
            >
              Paper
            </NavLink>
            <NavLink
              to="/project"
              className={navLinkClass}
            >
              Project
            </NavLink>
            <NavLink
              to="/project_task"
              className={navLinkClass}
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
