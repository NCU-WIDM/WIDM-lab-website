import React, { useState } from 'react';

interface DeleteFileProps {
  action: string;
  onClose: () => void;
  id: number;
  filesId?: string[];
  fileId?: string;
  onDeleteFile: (id: number, fileId: string) => void;
}

const DeleteFiles: React.FC<DeleteFileProps> = ({ onClose, action, id, fileId, filesId, onDeleteFile }) => {
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const handleDeleteClick = (fileId: string) => {
    setConfirmingDelete(fileId);
  };

  const handleConfirmDelete = () => {
    if (confirmingDelete) {
      onDeleteFile(id, confirmingDelete);
      setConfirmingDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmingDelete(null);
  };

  const handleDownloadClick = (fileId: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://widm.csie.ncu.edu.tw';;
    const link = document.createElement('a');
    link.href = `${apiUrl}/${action}/${id}/${action}-attachment/${fileId}`;
    link.download = fileId;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-2/4 max-w-2xl rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6 dark:border-strokedark">
          <h3 className="text-lg font-medium text-black dark:text-white">管理檔案</h3>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div>
            <label className="mb-2 block text-black dark:text-white">選擇檔案</label>
            <div className="flex flex-col gap-3">
              {fileId ? (
                <div className="flex items-center justify-between">
                  <span className="text-black dark:text-white">{fileId}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadClick(fileId)}
                      className="rounded-md border border-blue-500 bg-blue-500 py-2 px-4 text-white"
                    >
                      下載
                    </button>
                    <button
                      onClick={() => handleDeleteClick(fileId)}
                      className="rounded-md border border-red-500 bg-red-500 py-2 px-4 text-white"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              ) : (
                filesId?.map(fileId => (
                  <div key={fileId} className="flex items-center justify-between">
                    <span className="text-black dark:text-white">{fileId}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadClick(fileId)}
                        className="rounded-md border border-blue-500 bg-blue-500 py-2 px-4 text-white"
                      >
                        下載
                      </button>
                      <button
                        onClick={() => handleDeleteClick(fileId)}
                        className="rounded-md border border-red-500 bg-red-500 py-2 px-4 text-white"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-stroke bg-transparent py-2 px-4 text-black dark:text-white"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
      {confirmingDelete && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 className="text-lg font-medium text-black dark:text-white mb-4">確認刪除</h3>
            <p className="mb-4 text-black dark:text-white">是否確定刪除此檔案?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelDelete}
                className="rounded-md border border-stroke bg-transparent py-2 px-4 text-black dark:text-white"
              >
                關閉
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-md border border-red-500 bg-red-500 py-2 px-4 text-white"
              >
                確定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteFiles;
