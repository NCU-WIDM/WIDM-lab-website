// pages/Timeout.js
import React from 'react';

const Timeout = () => {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>請求超時</h1>
      <p>很抱歉，請求時間過長未能完成。請稍後再試或聯絡我們。</p>
      <h3>聯絡資訊</h3>
      <p>電子郵件: web.widm@gmail.com</p>
      <p>電話: 886-3-422-7151 #35348</p>
      <p>地址: (320317) 桃園市中壢區中大路 300 號 工程五館三樓 B317-1</p>
      <a href="/" style={{ marginTop: '20px', display: 'inline-block' }}>返回首頁</a>
    </div>
  );
};

export default Timeout;
