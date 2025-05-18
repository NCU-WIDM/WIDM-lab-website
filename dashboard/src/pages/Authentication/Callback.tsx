import React, { useEffect } from 'react';
import { UserManager } from 'oidc-client';

// 確認這裡使用 import.meta.env
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


const Callback: React.FC = () => {
  useEffect(() => {
    console.log('Callback component mounted');
    
    userManager.signinRedirectCallback().then(user => {
      console.log('User logged in successfully:', user);
      // 導向回首頁
      window.location.href = '/';
    }).catch(error => {
      console.error('Error during signin callback:', error);
      // 顯示錯誤訊息
      document.body.innerHTML = `<div style="color: red;">Error: ${error.message}</div>`;
    });

    // 測試基本的重導向
    setTimeout(() => {
      console.log('Testing redirect to home page');
      window.location.href = '/';
    }, 5000); // 5秒後重導向首頁，測試用
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-white">Signing in...</div>
    </div>
  );
};

export default Callback;
