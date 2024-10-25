import { useEffect, useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import DynamicTable from '../components/Tables/DynamicTable';
import AddItemForm from '../components/Forms/AddItemForm';
import UploadAttachmentForm from '../components/Forms/UploadAttachmentForm';
import { Spin, message } from 'antd';
import { defaultHttp } from '../utils/http';
import { processDataRoutes } from '../routes/api';
import { storedHeaders } from '../utils/storedHeaders';
import { handleErrorResponse } from '../utils';

const PaperPage = () => {
  const [papers, setPapers] = useState<any[]>([]);
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
    { id: 'title', Name: '標題', isShow: 'true', type: 'String', required: 'true', style: { minWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'left' } },
    { id: 'sub_title', Name: '副標題', isShow: 'true', type: 'String', required: 'true', style: { minWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'left' } },
    { id: 'origin', Name: '會議、發布地', isShow: 'true', type: 'String', required: 'true', style: { minWidth: '100px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'center' } },
    { id: 'publish_year', Name: '發布時間', isShow: 'true', type: 'Date', required: 'true', dateType: ['month','YYYY-MM'] as [PickerMode, string], style: { minWidth: '150px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'center' } },
    { id: 'authors', Name: '論文作者', isShow: 'true', type: 'SelectItems', required: 'true', data: [], style: { minWidth: '150px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'center' } },
    { id: 'tags', Name: '關鍵詞', isShow: 'true', isEnable: "false", type: 'SelectItems', required: 'true', data: [], style: { minWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'center' } },
    { id: 'types', Name: '發表類型', isShow: 'true', type: 'SelectItems', required: 'true', data: ['Journal Papers', 'International Conference Papers', 'Book Chapters',  'Patents', 'Domestic Conference Papers (In Chinese)', 'Phd Thesis', 'Master Thesis', "Part-time Graduate Students' Master Thesis"], style: { minWidth: '100px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'center' }},
    { id: 'link', Name: '論文連結', isShow: 'true', isEnable: "false", required: 'true', type: 'Url', style: { minWidth: '100px', whiteSpace: 'normal', textAlign: 'center' } },
    { id: 'attachmentActions', Name: 'attachment', isShow: 'false', type: 'Null' },
  ];

  const fetchPapers = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, fetchPapers: true }));
      const response = await defaultHttp.get(processDataRoutes.paper, {
        headers: storedHeaders()
      });
      const data = response.data.response;
      setPapers(data);
      console.log(data);
    } catch (error) {
      handleErrorResponse(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchPapers: false }));
    }
  };

  const createPaper = async (formData: { [key: string]: any }) => {
    try {
      setLoadingStates(prev => ({ ...prev, createPaper: true }));
      const newPaper = {
        title: formData.title,
        sub_title: formData.sub_title || '',
        origin: formData.origin || '',
        publish_year: formData.publish_year,
        authors: formData.authors || [],
        tags: formData.tags || [],
        types: formData.types || [],
        link: formData.link || '',
      };

      let response;
      if (editData) {
        response = await defaultHttp.patch(`${processDataRoutes.paper}/${editData.id}`, newPaper, { headers: storedHeaders() });
      } else {
        response = await defaultHttp.post(processDataRoutes.paper, newPaper, { headers: storedHeaders() });
      }
      setIsAdding(false);
      fetchPapers();  // 新增或更新後重新獲取成員數據
      message.success('更新成功!');  // 顯示成功消息
    } catch (error) {
      console.error('API 創建失敗:', (error as Error).message);
      message.error('更新失敗!');  // 顯示錯誤消息
      if ((error as any).response) {
        console.error('API Response Error:', (error as any).response.body);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, createPaper: false }));
    }
  };

  const handleUploadAttachmentSubmit = async (formData: { [key: string]: any }) => {
    try {
      setLoadingStates(prev => ({ ...prev, handleUploadAttachmentSubmit: true }));
      if (editData) {
        const paperImageUrl = `${processDataRoutes.paper}/${editData.id}/paper-attachment`;
        const uploadFormData = new FormData();
        console.log(formData)
        // 確保圖片文件被添加到 FormData 中
        if (formData.attachment) {
          uploadFormData.append('attachment', formData.attachment);
        }
        const response = await defaultHttp.post(paperImageUrl, uploadFormData);
        if (response.status === 200) {
          await fetchPapers();
          message.success('檔案上傳成功!');
        } else {
          throw new Error('檔案上傳失敗!');
        }
      }
    } catch (error) {
      console.error('檔案上傳失敗:', (error as Error).message);
      message.error('檔案上傳失敗!');
      if ((error as any).response) {
        console.error('API Response Error:', (error as any).response.body);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, handleUploadAttachmentSubmit: false }));
    }
  };

  const deletePaper = async (id: number) => {
    try {
      setLoadingStates(prev => ({ ...prev, deletePaper: true }));
      await defaultHttp.delete(`${processDataRoutes.paper}/${id}`, { headers: storedHeaders() });
      fetchPapers(); // 刪除後重新獲取成員數據
      message.success('刪除成功!');  // 顯示成功消息
    } catch (error) {
      console.error('API 刪除失敗:', (error as Error).message);
      message.error('刪除失敗!');  // 顯示錯誤消息
      if ((error as any).response) {
        console.error('API Response Error:', (error as any).response.body);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, deletePaper: false }));
    }
  };

  const handleDownloadAttachment = async (row: { [key: string]: any }) => {
    try {
      setLoadingStates(prev => ({ ...prev, handleDownloadAttachment: true }));
      const response = await defaultHttp.get(`${processDataRoutes.paper}/${row.id}/paper-attachment`, {
        responseType: 'blob',
      });
      
      if (response.status === 200) {
        const contentDisposition = response.headers['content-disposition'];
        let fileName = 'downloaded-file'; // 設定一個預設的檔名
  
        if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
          const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (fileNameMatch != null && fileNameMatch[1]) {
            fileName = fileNameMatch[1].replace(/['"]/g, '');
          }
        }
  
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
  
        message.success('檔案下載成功!');
      } else {
        throw new Error('檔案下載失敗!');
      }
    } catch (error) {
      console.error('檔案下載失敗:', (error as Error).message);
      message.error('檔案下載失敗!');
      if ((error as any).response) {
        console.error('API Response Error:', (error as any).response.body);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, handleDownloadAttachment: false }));
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

  const handleUploadAttachment = (row: { [key: string]: any }) => {
    setEditData(row);
    setIsUploading(true);
  };

  const handleCloseForm = () => {
    setIsAdding(false);
  };

  const handleCloseUploadAttachment = () => {
    setIsUploading(false);
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  return (
    <Spin spinning={isLoading} tip="Loading...">
      <DefaultLayout>
        <Breadcrumb pageName="Paper" />
        <div className="flex justify-end mb-1">
          <button
            onClick={handleAddNewItem}
            className="inline-flex items-center justify-center rounded-md border border-meta-3 py-1 px-3 text-center font-medium text-meta-3 hover:bg-opacity-90"
          >
            新增
          </button>
        </div>
        <div className="flex flex-col gap-6">
          <DynamicTable page={'paper'} data={papers} headers={headers} onDelete={deletePaper} onEdit={handleEditItem} onUploadFile={handleUploadAttachment} onDownloadFile={handleDownloadAttachment} />
        </div>
        <AddItemForm headers={headers} isOpen={isAdding} onClose={handleCloseForm} onSubmit={createPaper} editData={editData} />
        <UploadAttachmentForm isOpen={isUploading} onClose={handleCloseUploadAttachment} onSubmit={handleUploadAttachmentSubmit} />
      </DefaultLayout>
    </Spin>
  );
};

export default PaperPage;
