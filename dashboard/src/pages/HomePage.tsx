import React from 'react';
import DefaultLayout from '../layout/DefaultLayout';
import { NavLink } from 'react-router-dom';

const HomePage: React.FC = () => {
  const webUrl = import.meta.env.VITE_WEB_URL || '#';
  const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || '#';

  return (
    <DefaultLayout>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center', color: 'black', fontSize: '20px' }}>
        <div>
          <div style={{ marginBottom: '10px' }}>
            正式機 Web: <a href={webUrl} style={{ color: '#007BFF', textDecoration: 'none' }}>{webUrl}</a>
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            正式機 Dashboard: <a href={dashboardUrl} style={{ color: '#007BFF', textDecoration: 'none' }}>{dashboardUrl}</a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <NavLink to="/activity" style={{ color: 'white', backgroundColor: '#007BFF', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none' }}>
              Activity
            </NavLink>
            <NavLink to="/member" style={{ color: 'white', backgroundColor: '#007BFF', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none' }}>
              Member
            </NavLink>
            <NavLink to="/news" style={{ color: 'white', backgroundColor: '#007BFF', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none' }}>
              News
            </NavLink>
            <NavLink to="/paper" style={{ color: 'white', backgroundColor: '#007BFF', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none' }}>
              Paper
            </NavLink>
            <NavLink to="/project" style={{ color: 'white', backgroundColor: '#007BFF', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none' }}>
              Project
            </NavLink>
            <NavLink to="/project_task" style={{ color: 'white', backgroundColor: '#007BFF', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none' }}>
              Project Task
            </NavLink>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default HomePage;
