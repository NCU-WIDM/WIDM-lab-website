import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import HomePage from './pages/HomePage';
import Activity from './pages/Activity';
import News from './pages/News';
import Paper from './pages/Paper';
import Project from './pages/Project';
import Project_Task from './pages/Project_Task';
import Member from './pages/Member';
import NotFound from './pages/NotFound'
import Unauthorized from './pages/Unauthorized';

import { defaultHttp } from './utils/http';
import { processDataRoutes } from './routes/api';
import { storedHeaders } from './utils/storedHeaders';
import { handleErrorResponse } from './utils/';

// import { AuthApi } from '../domain/api-client/api';
// import { Configuration} from '../domain/api-client/configuration';

const App: React.FC = () => {
  const { pathname } = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 

  const user_info_get = async () => {
    try {

      const response = await defaultHttp.get(processDataRoutes.user_info, {
        headers: storedHeaders(),
        withCredentials: true,
      });
        
      setIsAuthenticated(response.status === 200);
    } catch (error) {
        console.error('Error fetching user info:', error);
    } finally {
        setIsLoading(false); 
    }
  }
  
  useEffect(() => {
    user_info_get();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (isLoading) {
    return <div>Loading...</div>; // 顯示加載指示器直到API調用完成
  }

  return true ? (
    <Routes>
      <Route
        index
        element={
          <>
            <PageTitle title="eCommerce Dashboard | TailAdmin - Tailwind CSS Admin Dashboard Template" />
            <HomePage />
          </>
        }
      />
      <Route path="/activity" element={<Activity />} />
      <Route path="/member" element={<Member />} />
      <Route path="/news" element={<News />} />
      <Route path="/paper" element={<Paper />} />
      <Route path="/project" element={<Project />} />
      <Route path="/project_task" element={<Project_Task />} />
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  ) : (
    <Routes>
      <Route
        index
        element={
          <>
            <PageTitle title="Sign In | WIDM" />
            <SignIn />
          </>
        }
      />
      <Route
        path="/auth/signin"
        element={
          <>
            <PageTitle title="Sign In | WIDM" />
            <SignIn />
          </>
        }
      />
      <Route
        path="/loginFailed"
        element={<Unauthorized />} // 401 頁面
      />
      <Route
        path="*"
        element={<NotFound />} // 404 頁面
      />
    </Routes>
  );
}

export default App;
