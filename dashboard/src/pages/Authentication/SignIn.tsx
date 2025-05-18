import React, { useEffect, useState } from 'react';
import { UserManager, User } from 'oidc-client';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';

const userManager = new UserManager({
  authority: import.meta.env.VITE_AUTHORITY || '',
  client_id: import.meta.env.VITE_CLIENT_ID || '',
  redirect_uri: import.meta.env.VITE_REDIRECT_URI || '',
  response_type: 'code',
  scope: 'identifier chinese-name',
  metadata: {
    authorization_endpoint: import.meta.env.VITE_AUTHORIZATION_ENDPOINT || '',
    token_endpoint: import.meta.env.VITE_TOKEN_ENDPOINT || '',
    userinfo_endpoint: import.meta.env.VITE_USERINFO_ENDPOINT || ''
  }
});


const SignIn: React.FC = () => {

  const handleLogin = () => {
    userManager.signinRedirect();
  };

  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <>
      <div className="flex justify-center items-center h-100 bg-gray-100 dark:bg-gray-900 overflow-hidden">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark max-w-lg w-full max-h-[70vh] overflow-y-auto">
          <div className="p-4 sm:p-12.5 xl:p-17.5 text-center">
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
              Sign In to WIDM Website
            </h2>
            <div className="flex flex-col items-center">
              <button
                onClick={handleLogin}
                className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
              >
                Sign in with Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
