import React, { useEffect, useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import DynamicTable from '../components/Tables/DynamicTable';
import AddItemForm from '../components/Forms/AddItemForm';
import { Spin, message } from 'antd';
import { defaultHttp } from '../utils/http';
import { processDataRoutes } from '../routes/api';
import { storedHeaders } from '../utils/storedHeaders';
import { handleErrorResponse } from '../utils';
import { joditConfig } from '../config/joditConfig';

const NewsPage = () => {
  const [news, setNews] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editData, setEditData] = useState<{ [key: string]: any } | null>(null);

  // - Loading
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});    // 儲存各個API的loading狀態
  useEffect(() => {   // 當任何一個API的loading狀態改變時，更新isLoading
    const anyLoading = Object.values(loadingStates).some(state => state);
    setIsLoading(anyLoading);
  }, [loadingStates]);

  const headers = [
    { id: 'id', Name: 'Id', isShow: 'false', isEnable: "false", type: 'Number' },
    { id: 'title', Name: '標題', isShow: 'true', type: 'String', required: 'true', style: { whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'left' }  },
    { id: 'sub_title', Name: '副標題', isShow: 'true', type: 'String', style: { whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'left' }  },
    { id: 'content', Name: '內容', isShow: 'false', isEnable: 'false', type: 'jodit' },
    { id: 'actions', Name: 'Actions', isShow: 'false', type: 'Null' },
  ];

  const fetchNews = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, fetchNews: true }));
      const response = await defaultHttp.get(processDataRoutes.news, {
          headers: storedHeaders()
      });
      const data = response.data.response;
      setNews(data);
    } catch (error) {
      handleErrorResponse(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchNews: false }));
    }
  };

  const createNews = async (formData: { [key: string]: any }) => {
    try {
      setLoadingStates(prev => ({ ...prev, createNews: true }));
      const newNews = {
        title: formData.title,
        sub_title: formData.sub_title || '',
        content: formData.content || '',
      };
      let response;
      if (editData) {
        response = await defaultHttp.patch(`${processDataRoutes.news}/${editData.id}`, newNews, { headers: storedHeaders() });
      } else {
        response = await defaultHttp.post(processDataRoutes.news, newNews, { headers: storedHeaders() });
      }
      setIsAdding(false);
      fetchNews();  // 新增或更新後重新獲取成員數據
      message.success('更新成功!');  // 顯示成功消息
    } catch (error) {
      console.error('API 創建失敗:', (error as Error).message);
      message.error('更新失敗!');  // 顯示錯誤消息
      if ((error as any).response) {
        console.error('API Response Error:', (error as any).response.body);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, createNews: false }));
    }
  };

  const deleteNews = async (id: number) => {
    try {
      setLoadingStates(prev => ({ ...prev, deleteNews: true }));
      await defaultHttp.delete(`${processDataRoutes.news}/${id}`, { headers: storedHeaders() });
      fetchNews(); // 刪除後重新獲取成員數據
      message.success('刪除成功!');  // 顯示成功消息
    } catch (error) {
      console.error('API 刪除失敗:', (error as Error).message);
      message.error('刪除失敗!');  // 顯示錯誤消息
      if ((error as any).response) {
        console.error('API Response Error:', (error as any).response.body);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, deleteNews: false }));
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleAddNewItem = () => {
    setEditData(null); // 新增時清空 editData
    setIsAdding(true);
  };

  const handleEditItem = (row: { [key: string]: any }) => {
    setEditData(row); // 將當前資料設為 editData
    setIsAdding(true);
  };

  const handleCloseForm = () => {
    setIsAdding(false);
  };
  

  return (
    <Spin spinning={isLoading} tip="Loading...">
      <DefaultLayout>
        <Breadcrumb pageName="News" />
        <div className="flex justify-end mb-1">
          <button
            onClick={handleAddNewItem}
            className="inline-flex items-center justify-center rounded-md border border-meta-3 py-1 px-3 text-center font-medium text-meta-3 hover:bg-opacity-90"
          >
            新增
          </button>
        </div>
        <div className="flex flex-col gap-6">
          <DynamicTable data={news} headers={headers} onDelete={deleteNews} onEdit={handleEditItem} />
        </div>
        <AddItemForm headers={headers} isOpen={isAdding} onClose={handleCloseForm} onSubmit={createNews} editData={editData} joditConfig={joditConfig} />
      </DefaultLayout>
    </Spin>
  );
};

export default NewsPage;
