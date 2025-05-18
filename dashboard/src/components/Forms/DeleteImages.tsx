import React, { useState } from 'react';

interface DeleteImagesProps {
  action_1: string;
  action_2: string;
  onClose: () => void;
  id: number;
  imagesId?: string[];
  imageId?: string;
  onDeleteImage: (id: number, imageId: string) => void;
}

const DeleteImages: React.FC<DeleteImagesProps> = ({ onClose, action_1, action_2, id, imageId, imagesId, onDeleteImage }) => {
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://widm.csie.ncu.edu.tw';;

  const handleDeleteClick = (imageId: string) => {
    setConfirmingDelete(imageId);
  };

  const handleConfirmDelete = () => {
    if (confirmingDelete) {
      onDeleteImage(id, confirmingDelete);
      setConfirmingDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmingDelete(null);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-2/4 max-w-2xl rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6 dark:border-strokedark">
          <h3 className="text-lg font-medium text-black dark:text-white">Delete Images</h3>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div>
            <label className="mb-2 block text-black dark:text-white">選擇圖片</label>
            <div className="flex flex-col gap-3">
              {imageId ? (
                <div className="flex items-center justify-between">
                  <img
                    src={`${apiUrl}/${action_1}/${id}/${action_2}/${imageId}`}
                    alt={`Image ${imageId}`}
                    className="w-60 h-60 object-cover"
                  />
                  <button
                    onClick={() => handleDeleteClick(imageId)}
                    className="rounded-md border border-red-500 bg-red-500 py-2 px-4 text-white"
                  >
                    刪除
                  </button>
                </div>
              ) : (
                imagesId?.map(imageId => (
                  <div key={imageId} className="flex items-center justify-between">
                    <img
                      src={`${apiUrl}/${action_1}/${id}/${action_2}/${imageId}`}
                      alt={`Image ${imageId}`}
                      className="w-60 h-60 object-cover"
                    />
                    <button
                      onClick={() => handleDeleteClick(imageId)}
                      className="rounded-md border border-red-500 bg-red-500 py-2 px-4 text-white"
                    >
                      刪除
                    </button>
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
            <p className="mb-4 text-black dark:text-white">是否確定刪除此圖片?</p>
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

export default DeleteImages;
