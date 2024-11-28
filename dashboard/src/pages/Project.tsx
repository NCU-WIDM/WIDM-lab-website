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

const ProjectPage = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editData, setEditData] = useState<{ [key: string]: any } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
    { id: 'name', Name: '專案名稱', isShow: 'true', type: 'String', required: 'true', style: { minWidth: '250px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'left' } },
    { id: 'description', Name: '專案描述', isShow: 'true', type: 'Textarea', style: { minWidth: '500px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'left' } },
    { id: 'summary', Name: '專案摘要', isShow: 'true', type: 'Textarea', style: { minWidth: '500px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'left' } },
    { id: 'github', Name: 'GitHub 連結', isShow: 'true', isEnable: "false", type: 'Url', style: { minWidth: '100px', whiteSpace: 'normal', textAlign: 'center' } },
    { id: 'link', Name: '專案連結', isShow: 'true', isEnable: "false", type: 'Url', style: { minWidth: '100px', whiteSpace: 'normal', textAlign: 'center' } },
    { id: 'tags', Name: '專案標籤', isShow: 'true', type: 'SelectItems', data: [] },
    { id: 'members', Name: '人員', isShow: 'true', type: 'SelectItems', data: [], style: { minWidth: '150px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'center' } },
    { id: 'start_time', Name: '開始時間', isShow: 'true', type: 'Date', dateType: ['month','YYYY-MM'] as [PickerMode, string], style: { minWidth: '150px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'center' }, required: 'true' },
    { id: 'end_time', Name: '結束時間', isShow: 'true', type: 'Date', dateType: ['month','YYYY-MM'] as [PickerMode, string], style: { minWidth: '150px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'center' } },
    { id: 'imageActions', Name: 'project-icon', isShow: 'false', type: 'Null' },
  ];

  const fetchProjects = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, fetchProjects: true }));
      const response = await defaultHttp.get(processDataRoutes.project, {
        headers: storedHeaders()
      });
      const data = response.data.response;
      setProjects(data);
    } catch (error) {
      handleErrorResponse(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchProjects: false }));
    }
  };

  const createProject = async (formData: { [key: string]: any }) => {
    try {
      setLoadingStates(prev => ({ ...prev, createProject: true }));
      const newProject = {
        name: formData.name,
        description: formData.description || '',
        summary: formData.summary || '',
        github: formData.github || '',
        link: formData.link || '',
        tags: formData.tags || [],
        members: formData.members || [],
        start_time: formData.start_time || '',
        end_time: formData.end_time || ''
      };


      let response;
      if (editData) {
        response = await defaultHttp.patch(`${processDataRoutes.project}/${editData.id}`, newProject, { headers: storedHeaders() });
      } else {
        response = await defaultHttp.post(processDataRoutes.project, newProject, { headers: storedHeaders() });
      }
      setIsAdding(false);
      fetchProjects();  // 新增或更新後重新獲取成員數據
      message.success('更新成功!');  // 顯示成功消息
    } catch (error) {
      console.error('API 創建失敗:', (error as Error).message);
      message.error('更新失敗!');  // 顯示錯誤消息
      if ((error as any).response) {
        console.error('API Response Error:', (error as any).response.body);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, createProject: false }));
    }
  };

  const deleteProject = async (id: number) => {
    try {
      setLoadingStates(prev => ({ ...prev, deleteProject: true }));
      await defaultHttp.delete(`${processDataRoutes.project}/${id}`, { headers: storedHeaders() });
      fetchProjects(); // 刪除後重新獲取成員數據
      message.success('刪除成功!');  // 顯示成功消息
    } catch (error) {
      console.error('API 刪除失敗:', (error as Error).message);
      message.error('刪除失敗!');  // 顯示錯誤消息
      if ((error as any).response) {
        console.error('API Response Error:', (error as any).response.body);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, deleteProject: false }));
    }
  };

  const handleUploadImageSubmit = async (formData: { [key: string]: any }) => {
    try {
      setLoadingStates(prev => ({ ...prev, handleUploadImageSubmit: true }));
      if (editData) {
        const projectIconUrl = `${processDataRoutes.project}/${editData.id}/project-icon`;
        const uploadFormData = new FormData();
  
        // 確保圖片文件被添加到 FormData 中
        if (formData.image) {
          uploadFormData.append('image', formData.image);
        }
        const response = await defaultHttp.post(projectIconUrl, uploadFormData);
        if (response.status === 200) {
          await fetchProjects();

  
          // 為了強制圖片刷新，添加一個隨機的 query 參數
          const updatedProjects = projects.map(project => {
            if (project.id === editData.id) {
              project.imageUrl = `${projectIconUrl}`;
            }
            return project;
          });
          setProjects(updatedProjects);
  
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

  const handleUploadImage = (row: { [key: string]: any }) => {
    setEditData(row);
    setIsUploading(true);
  };

  const handleCloseUploadImage = () => {
    setIsUploading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <Spin spinning={isLoading} tip="Loading...">
      <DefaultLayout>
        <Breadcrumb pageName="Project" />
        <div className="flex justify-end mb-1">
          <button
            onClick={handleAddNewItem}
            className="inline-flex items-center justify-center rounded-md border border-meta-3 py-1 px-3 text-center font-medium text-meta-3 hover:bg-opacity-90"
          >
            新增
          </button>
        </div>
        <div className="flex flex-col gap-6">
          <DynamicTable page={'project'} data={projects} headers={headers} onDelete={deleteProject} onEdit={handleEditItem} onUploadFile={handleUploadImage} />
        </div>
        <AddItemForm headers={headers} isOpen={isAdding} onClose={handleCloseForm} onSubmit={createProject} editData={editData} />
        <UploadImage isOpen={isUploading} onClose={handleCloseUploadImage} onSubmit={handleUploadImageSubmit} />
      </DefaultLayout>
    </Spin>
  );
};

export default ProjectPage;
