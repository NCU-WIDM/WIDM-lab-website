import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt, FaLink } from 'react-icons/fa';
import { LuImage, LuImagePlus, LuImageMinus } from "react-icons/lu";
import { FiFilePlus, FiFileMinus } from "react-icons/fi";
import { MdOutlineFileDownload } from "react-icons/md";
import { Tag, Modal, Tooltip, Switch } from 'antd';

type HeaderType = {
  id: string;
  Name: string;
  isShow: string;
  type: string;
  isEnable?: string;
  data?: any;
  style?: any;
};

interface TableProps {
  page?: string; // 這個參數是用來判斷是哪個頁面的表單
  headers: Array<HeaderType>;
  data: Array<{ [key: string]: any }>;
  onDelete: (id: number) => void;
  onEdit: (row: { [key: string]: any }) => void;
  onUploadFile?: (row: { [key: string]: any }) => void;
  onDeleteFiles?: (row: { [key: string]: any }) => void;
  onDownloadFile?: (row: { [key: string]: any }) => void;
  onEditImage?: (row: { [key: string]: any }) => void;
}

const DynamicTable: React.FC<TableProps> = ({ page, headers, data, onDelete, onEdit, onUploadFile, onDeleteFiles, onDownloadFile, onEditImage, onPinTop }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [imageUpdate, setImageUpdate] = useState(0);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://widm-back-end.nevercareu.space';; // 使用環境變數

  useEffect(() => {
    setImageUpdate(prev => prev + 1); // 更新狀態
  }, [data]);

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId !== null) {
      onDelete(selectedId);
      setShowModal(false);
      setSelectedId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setSelectedId(null);
  };

  return (
    <div className="relative rounded-sm border border-stroke mt-5 bg-white shadow-default dark:border-strokedark dark:bg-boxdark ">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr key={`outtr-${page}`} className="bg-gray-2 text-left dark:bg-meta-4">
              {headers.map((header) => (
                (!header.isEnable || header.isEnable === 'true') ? (
                  <th
                    key={`outth-${header.id}`}
                    scope="col"
                    className="py-4 px-4 font-medium text-black dark:text-white text-center"
                    style={header.style ? header.style : { minWidth: '200px' }}
                  >
                    {header.isShow === 'true' ? header.Name : ''}
                  </th>
                ) : null
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row) => (
              <tr key={`intr-${row.id}`} className="hover:bg-gray-50 dark:hover:bg-meta-4">
                {headers.map((header) => (
                  (!header.isEnable || header.isEnable === 'true') ? ( 
                    <td 
                      key={`intd-${row.id}-${header.id}`}
                      className="border-b border-[#eee] py-3 px-3 dark:border-strokedark"
                      style={header.style ? header.style : {minWidth: '200px'}}>
                      {/* header.id === 'actions' 新增 修改 刪除 */}
                      {header.id === 'actions' && ( // 新增 修改 刪除
                        <div className="flex items-center space-x-3.5">
                          <button className="hover:text-primary" onClick={() => onEdit(row)}>
                            <FaEdit />
                          </button>
                          <button className="hover:text-primary" onClick={() => handleDeleteClick(row.id)}>
                            <FaTrashAlt />
                          </button>
                        </div>
                      )}
                      {header.id === 'imageActions' && (onUploadFile || onDeleteFiles) && ( // 上傳單張圖片
                        <div className="flex items-center space-x-10">
                          <div className="flex items-center space-x-5 px-3.5 py-2 w-full">
                            {onEdit && (
                              <button className="hover:text-primary" onClick={() => onEdit(row)}>
                                <FaEdit />
                              </button>
                            )}
                            <button className="hover:text-primary" onClick={() => handleDeleteClick(row.id)}>
                              <FaTrashAlt />
                            </button>
                            {onUploadFile && !row[header.Name] && (
                              <button className="hover:text-primary" onClick={() => onUploadFile(row)}>
                                <LuImagePlus className="text-green-500"/>
                              </button>
                            )}
                            {onDeleteFiles && row[header.Name] && (
                              <button className="hover:text-primary" onClick={() => onDeleteFiles(row)}>
                                <LuImageMinus className="text-red-500"/>
                              </button>
                            )}
                            {row.image_existed && (
                              <img
                                key={imageUpdate}
                                src={row.imageUrl ? row.imageUrl : `${apiUrl}/${page}/${row['id']}/${header.Name}`}
                                className="w-10 h-10 object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                        </div>
                      )}
                      {header.id === 'imagesActions' && (onUploadFile || onDeleteFiles || onEditImage) && ( // 上傳多張圖片
                        <div className="flex items-center space-x-3.5">
                          {onEdit && (
                            <button className="hover:text-primary" onClick={() => onEdit(row)}>
                              <FaEdit />
                            </button>
                          )}
                          <button className="hover:text-primary" onClick={() => handleDeleteClick(row.id)}>
                            <FaTrashAlt />
                          </button>
                          {onUploadFile && (
                            <button className="hover:text-primary" onClick={() => onUploadFile(row)}>
                              <LuImagePlus className="text-green-500"/>
                            </button>
                          )}
                          {onDeleteFiles && row[header.Name] != null && (
                            <button className="hover:text-primary" onClick={() => onDeleteFiles(row)}>
                              <LuImageMinus className="text-red-500"/>
                            </button>
                          )}
                          {onEditImage && row[header.Name] != null && (
                            <button className="hover:text-primary" onClick={() => onEditImage(row)}>
                              <LuImage />
                            </button>
                          )}
                        </div>
                      )}
                      {header.id === 'attachmentActions' && ( // 上傳檔案
                        <div className="flex justify-center items-center space-x-3.5">
                          {onEdit && (
                            <Tooltip title="編輯">
                              <button className="hover:text-primary" onClick={() => onEdit(row)}>
                                <FaEdit />
                              </button>
                            </Tooltip>
                          )}
                          <Tooltip title="刪除">
                            <button className="hover:text-primary" onClick={() => handleDeleteClick(row.id)}>
                              <FaTrashAlt />
                            </button>
                          </Tooltip>
                          {onUploadFile && !row[header.Name] && (
                            <Tooltip title="上傳檔案">
                              <button className="hover:text-primary" onClick={() => onUploadFile(row)}>
                                <FiFilePlus />
                              </button>
                            </Tooltip>
                          )}
                          {onDeleteFiles && row[header.Name] && (
                            <Tooltip title="刪除檔案">
                              <button className="hover:text-primary" onClick={() => onDeleteFiles(row)}>
                                <FiFileMinus />
                              </button>
                            </Tooltip>
                          )}
                          {onDownloadFile && row[`${page}_existed`] && (
                            <Tooltip title="下載檔案">
                              <button className="hover:text-primary" onClick={() => onDownloadFile(row)}>
                                <MdOutlineFileDownload style={{ fontSize: '20px', color: '#0066FF' }} />
                              </button>
                            </Tooltip>
                          )}
                        </div>
                      )}
                      {header.type === 'Tags' || header.type === 'SelectItems' ? ( // 顯示標籤
                        <div className="flex flex-wrap">
                          {row[header.id] ? row[header.id].map((tag: string, index: number) => (
                            <Tag key={`tag-${row}-${tag}-${index}`} className="mb-1 mr-1">
                              {tag}
                            </Tag>
                          )) : <></>}
                        </div>
                      ) : header.type === 'Url' && row[header.id] ? ( // 顯示連結
                        <div className="flex justify-center items-center">
                          <a href={row[header.id]} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                            <FaLink />
                          </a>
                        </div>
                      ) : ( // 顯示文字
                        <div
                          className="text-black dark:text-white inline-block max-w-full"
                          style={{ maxWidth: '100%' }}  // 使用 max-width 來防止內容超出表格邊界
                        >
                          {row[header.id]}
                        </div>
                      )}
                      {header.effect === 'importance' && (
                        <Switch
                          checked={row[header.id]}
                          onChange={(checked) => onPinTop (row.id, checked)}
                          defaultChecked={row[header.id]}
                        />
                      )}
                    </td>
                  ) : <></>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 刪除用 */}
        <Modal
          title="確認刪除"
          open={showModal}
          onCancel={handleCancelDelete}
          footer={null}
          centered={true}
          maskClosable={false}
        >
          <h3 className="mb-4 text-black dark:text-white">確定刪除此筆資料?</h3>
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleCancelDelete}
              className="px-4 py-2 rounded border border-gray-300 text-black dark:text-white"
            >
              關閉
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded bg-red-500 text-white"
            >
              確定
            </button>
          </div>
        </Modal>
    </div>
  );
};

export default DynamicTable;
