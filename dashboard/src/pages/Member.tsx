import { useEffect, useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import DynamicTable from '../components/Tables/DynamicTable';
import AddItemForm from '../components/Forms/AddItemForm';
import UploadImage from '../components/Forms/UploadImageForm';
import { Spin, message } from 'antd';
import { defaultHttp } from '../utils/http';
import { processDataRoutes } from '../routes/api';
import { storedHeaders } from '../utils/storedHeaders';
import { handleErrorResponse } from '../utils';

const MemberPage = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
    { id: 'id', Name: 'Id', isShow: 'false', isEnable: "false", type: 'Number' },
    { id: 'name', Name: '名稱', isShow: 'true', type: 'String', required: 'true', style: { minWidth: '150px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'center' } },
    { id: 'name_en', Name: '英文名稱', isShow: 'true', type: 'String', style: { minWidth: '200px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'center' } },
    { id: 'intro', Name: '介紹', isShow: 'true', type: 'Textarea' },
    { id: 'position', Name: '職位', isShow: 'true', type: 'Select', data: ['Master Student', 'PHD Student', 'Project Assistant'], required: 'true', style: { minWidth: '100px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'center' } },
    { id: 'graduate_year', Name: '畢業時間', isShow: 'true', type: 'Date', dateType: ['month','YYYY-MM'] as [PickerMode, string], style: { minWidth: '150px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'center' } },
    { id: 'imageActions', Name: 'member-image', isShow: 'false', type: 'Null' },
  ];

  const fetchMembers = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, fetchMembers: true }));
      const response = await defaultHttp.get(processDataRoutes.member, {
        headers: storedHeaders()
      });
      const data = response.data.response;
      setMembers(data);
      console.log(data);
    } catch (error) {
      handleErrorResponse(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchMembers: false }));
    }
  }

  const createMember = async (formData: { [key: string]: any }) => {
    try {
      setLoadingStates(prev => ({ ...prev, createMember: true }));
      console.log('formData:', formData);
      const newMember = {
        name: formData.name,
        name_en: formData.name_en || "",
        intro: formData.intro || "",
        position: formData.position,
        graduate_year: formData.graduate_year
      };

      let response;
      if (editData) {
        response = await defaultHttp.patch(`${processDataRoutes.member}/${editData.id}`, newMember, { headers: storedHeaders() });
      } else {
        response = await defaultHttp.post(processDataRoutes.member, newMember, { headers: storedHeaders() });
      }
      setIsAdding(false);
      fetchMembers();  // 新增或更新後重新獲取成員數據
      message.success('更新成功!');  // 顯示成功消息
    } catch (error) {
      console.error('API 創建失敗:', (error as Error).message);
      message.error('更新失敗!');  // 顯示錯誤消息
      if ((error as any).response) {
        console.error('API Response Error:', (error as any).response.body);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, createMember: false }));
    }
  };

  const handleUploadImageSubmit = async (formData: { [key: string]: any }) => {
    try {
      setLoadingStates(prev => ({ ...prev, handleUploadImageSubmit: true }));
      if (editData) {
        const memberImageUrl = `${processDataRoutes.member}/${editData.id}/member-image`;
        const uploadFormData = new FormData();
  
        // 確保圖片文件被添加到 FormData 中
        if (formData.image) {
          uploadFormData.append('image', formData.image);
        }
        const response = await defaultHttp.post(memberImageUrl, uploadFormData);
        if (response.status === 200) {
          await fetchMembers();
  
          // 為了強制圖片刷新，添加一個隨機的 query 參數
          const updatedMembers = members.map(member => {
            if (member.id === editData.id) {
              member.imageUrl = `${memberImageUrl}`;
            }
            return member;
          });
          setMembers(updatedMembers);
  
          message.success('圖片上傳成功!');
        } else {
          throw new Error('圖片上傳失敗!');
        }
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

  const deleteMember = async (id: number) => {
    try {
      setLoadingStates(prev => ({ ...prev, deleteMember: true }));
      await defaultHttp.delete(`${processDataRoutes.member}/${id}`, { headers: storedHeaders() });
      fetchMembers(); // 刪除後重新獲取成員數據
      message.success('刪除成功!');
    } catch (error) {
      console.error('API 刪除失敗:', (error as Error).message);
      message.error('刪除失敗!');
      if ((error as any).response) {
        console.error('API Response Error:', (error as any).response.body);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, deleteMember: false }));
    }
  };

  const handleAddNewItem = () => {
    setEditData(null); // 新增時清空 editData
    setIsAdding(true);
  };

  const handleEditItem = (row: { [key: string]: any }) => {
    setEditData(row); // 將當前資料設為 editData
    setIsAdding(true);
  };

  const handleUploadImage = (row: { [key: string]: any }) => {
    setEditData(row);
    setIsUploading(true);
  };

  const handleCloseForm = () => {
    setIsAdding(false);
  };

  const handleCloseUploadImage = () => {
    setIsUploading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <Spin spinning={isLoading} tip="Loading...">
      <DefaultLayout>
        <Breadcrumb pageName="Member" />
        <div className="flex justify-end mb-1">
          <button
            onClick={handleAddNewItem}
            className="inline-flex items-center justify-center rounded-md border border-meta-3 py-1 px-3 text-center font-medium text-meta-3 hover:bg-opacity-90"
          >
            新增
          </button>
        </div>
        <div className="flex flex-col gap-6">
          <DynamicTable page={'member'} data={members} headers={headers} onDelete={deleteMember} onEdit={handleEditItem} onUploadFile={handleUploadImage} />
        </div>
        <AddItemForm headers={headers} isOpen={isAdding} onClose={handleCloseForm} onSubmit={createMember} editData={editData} />
        <UploadImage isOpen={isUploading} onClose={handleCloseUploadImage} onSubmit={handleUploadImageSubmit} />
      </DefaultLayout>
    </Spin>
  );
};

export default MemberPage;
