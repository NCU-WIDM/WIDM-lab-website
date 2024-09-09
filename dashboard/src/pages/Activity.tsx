import { useEffect, useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import DynamicTable from '../components/Tables/DynamicTable';
import AddItemForm from '../components/Forms/AddItemForm';
import ImageManagement from '../components/Forms/ImageManagement';
import { Spin, message } from 'antd';
import { defaultHttp } from '../utils/http';
import { processDataRoutes } from '../routes/api';
import { storedHeaders } from '../utils/storedHeaders';
import { handleErrorResponse } from '../utils';
import style from 'react-syntax-highlighter/dist/esm/styles/hljs/a11y-dark';

const ActivityPage = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditImages, setIsEditImages] = useState(false);
  const [editData, setEditData] = useState<{ [key: string]: any } | null>(null);

  // - Loading
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});    // 儲存各個API的loading狀態
  useEffect(() => {   // 當任何一個API的loading狀態改變時，更新isLoading
    const anyLoading = Object.values(loadingStates).some(state => state);
    setIsLoading(anyLoading);
  }, [loadingStates]);

  type PickerMode = 'date' | 'week' | 'month' | 'quarter' | 'year'; // 定義PickerMode類型

  const headers = [
    { id: 'id', Name: 'Id', isShow: 'false', isEnable: 'false', type: 'Number' },
    { id: 'title', Name: '標題', isShow: 'true', type: 'String', required: 'true',  style: { minWidth: '150px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'left' } },
    { id: 'sub_title', Name: '副標題', isShow: 'true', type: 'String',  style: { minWidth: '150px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'left' } },
    { id: 'date', Name: '日期', isShow: 'true', type: 'Date', dateType: ['date','YYYY-MM-DD'] as [PickerMode, string], required: 'true', style: {textAlign: 'center'}},
    { id: 'imagesActions', Name: 'images', isShow: 'false', type: 'Null',  style: {textAlign: 'center'}},
  ];

  const fetchActivities = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, fetchActivities: true }));
      const response = await defaultHttp.get(processDataRoutes.activity, {
          headers: storedHeaders()
      });
      const data = response.data.response;
      setActivities(data);
      console.log(data);
    } catch (error) {
      handleErrorResponse(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchActivities: false }));
    }
  }

  const createActivitie = async (formData: { [key: string]: any }) => {
    try {
      setLoadingStates(prev => ({ ...prev, createActivitie: true }));
      const newActivity = {
        title: formData.title,
        sub_title: formData.sub_title || '',
        date: formData.date,
      };

      let response;
      if (editData) {
        response = await defaultHttp.patch(`${processDataRoutes.activity}/${editData.id}`, newActivity, { headers: storedHeaders() });
      } else {
        response = await defaultHttp.post(processDataRoutes.activity, newActivity, { headers: storedHeaders() });
      }
      setIsAdding(false);
      fetchActivities();  // 新增或更新後重新獲取成員數據
      message.success('更新成功!');  // 顯示成功消息
    } catch (error) {
      console.error('API 創建失敗:', (error as Error).message);
      message.error('更新失敗!');  // 顯示錯誤消息
      if ((error as any).response) {
        console.error('API Response Error:', (error as any).response.body);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, createActivitie: false }));
    }
  };

  const handleUploadImageSubmit = async (images: File[]) => {
    try {
      setLoadingStates(prev => ({ ...prev, handleUploadImageSubmit: true }));
      
      if (editData && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const activityImageUrl = `${processDataRoutes.activity}/${editData.id}/activity-image`;
          const uploadFormData = new FormData();
          uploadFormData.append('image', images[i]);
  
          try {
            const response = await defaultHttp.post(activityImageUrl, uploadFormData);
            if (response.status === 200) {
              message.success(`圖片 ${i + 1} 上傳成功!`);
            } else {
              throw new Error(`圖片 ${i + 1} 上傳失敗!`);
            }
          } catch (error) {
            message.error(`圖片 ${i + 1} 上傳失敗!`);
            throw error; // 如果上傳失敗，仍然拋出錯誤，停止後續上傳
          }
        }
  
        await fetchActivities();
        updateImagesId(editData.id);
      }
    } catch (error) {
      console.error('圖片上傳失敗:', (error as Error).message);
      message.error('圖片上傳失敗!');
      if ((error as any).response) {
        console.error('API Response Error:', (error as any).response.body);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, handleUploadImageSubmit: false }));
    }
  };

  const handleDeleteImagesSubmit = async (id: number, imageId: number) => {
    try {
      setLoadingStates(prev => ({ ...prev, handleDeleteImagesSubmit: true }));
      await defaultHttp.delete(`${processDataRoutes.activity}/${id}/activity-image/${imageId}`, { headers: storedHeaders() });
      await fetchActivities();
      updateImagesId(id);
      message.success('圖片刪除成功!');
    } catch (error) {
      console.error('圖片刪除失敗:', (error as Error).message);
      message.error('圖片刪除失敗!');
      if ((error as any).response) {
        console.error('API Response Error:', (error as any).response.body);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, handleDeleteImagesSubmit: false }));
    }
  };

  const deleteActivitie = async (id: number) => {
    try {
      setLoadingStates(prev => ({ ...prev, deleteActivitie: true }));
      await defaultHttp.delete(`${processDataRoutes.activity}/${id}`, { headers: storedHeaders() });
      fetchActivities(); // 刪除後重新獲取成員數據
      message.success('刪除成功!');  // 顯示成功消息
    } catch (error) {
      console.error('API 刪除失敗:', (error as Error).message);
      message.error('刪除失敗!');  // 顯示錯誤消息
      if ((error as any).response) {
        console.error('API Response Error:', (error as any).response.body);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, deleteActivitie: false }));
    }
  };

  useEffect(() => {
    if (editData && activities.length > 0) {
      updateImagesId(editData.id);
    }
  }, [activities, editData]);

  const handleAddNewItem = () => {
    setEditData(null); // 新增時清空 editData
    setIsAdding(true);
  };

  const handleEditItem = (row: { [key: string]: any }) => {
    setEditData(row); // 將當前資料設為 editData
    setIsAdding(true);
  };

  const handleEditImages = (row: { [key: string]: any }) => {
    setEditData(row);
    setIsEditImages(true);
  };

  const handleCloseEditImages = () => {
    setIsEditImages(false);
  };

  const handleCloseForm = () => {
    setIsAdding(false);
  };

  const updateImagesId = (id: number) => {
    const updatedActivity = activities.find(activity => activity.id === id);
    if (updatedActivity && editData && updatedActivity.images !== editData.images) {
      setEditData({ ...editData, images: updatedActivity.images });
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <Spin spinning={isLoading} tip="Loading...">
      <DefaultLayout>
        <Breadcrumb pageName="Activity" />
        <div className="flex justify-end mb-1">
          <button
            onClick={handleAddNewItem}
            className="inline-flex items-center justify-center rounded-md border border-meta-3 py-1 px-3 text-center font-medium text-meta-3 hover:bg-opacity-90"
          >
            新增
          </button>
        </div>
        <div className="flex flex-col gap-6">
          <DynamicTable data={activities} headers={headers} onDelete={deleteActivitie} onEdit={handleEditItem} onEditImage={handleEditImages}/>
        </div>
        <AddItemForm headers={headers} isOpen={isAdding} onClose={handleCloseForm} onSubmit={createActivitie} editData={editData} />
        <ImageManagement isOpen={isEditImages} onClose={handleCloseEditImages} action_1={'activity'} action_2={'activity-image'} id={editData?.id!} initialImagesId={editData?.images} onUploadImage={handleUploadImageSubmit} onDeleteImage={handleDeleteImagesSubmit}/>
      </DefaultLayout>
    </Spin>
  );
};

export default ActivityPage;
