import React, { useState, useEffect, useRef } from 'react';
import { Modal, message } from 'antd';

interface ImageManagementProps {
  action_1: string;
  action_2: string;
  id: number;
  initialImagesId?: number[];
  imageId?: string;
  onUploadImage: (images: File[]) => Promise<void>;
  onDeleteImage: (id: number, imageId: number) => void;
  onClose: () => void;
  isOpen: boolean;
}

const ImageManagement: React.FC<ImageManagementProps> = ({ onClose, isOpen, action_1, action_2, id, initialImagesId, onUploadImage, onDeleteImage }) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagesId, setImagesId] = useState<number[]>(initialImagesId || []);
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://widm.csie.ncu.edu.tw';; // 使用環境變數

  useEffect(() => {
    setImagesId(initialImagesId || []);
  }, [initialImagesId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length > 0) {
      try {
        await onUploadImage(imageFiles);
        message.success('所有圖片上傳成功!');
      } catch (error) {
        message.error('圖片上傳過程中發生錯誤!');
      }
      setImageFiles([]);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleDeleteClick = (imageId: number) => {
    setConfirmingDelete(imageId);
  };

  const handleConfirmDelete = () => {
    if (confirmingDelete) {
      onDeleteImage(id, confirmingDelete);
      setImagesId(imagesId.filter(imgId => imgId !== confirmingDelete));
      setConfirmingDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmingDelete(null);
  };

  return (
    <Modal
      title="Images Management"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
      centered={true}
      maskClosable={false}
    >
      <form onSubmit={handleUploadSubmit} className="flex flex-col gap-6 p-8">
        <div>
          <label className="mb-3 block text-black dark:text-white">上傳圖片</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            ref={inputRef}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-stroke bg-transparent py-3 px-6 text-black dark:text-white"
          >
            關閉
          </button>
          <button
            type="submit"
            className="rounded-md border border-primary bg-primary py-3 px-6 text-white"
          >
            上傳
          </button>
        </div>
      </form>
      <div className="border-t border-stroke py-6 px-8 dark:border-strokedark">
        <h3 className="text-lg font-medium text-black dark:text-white">刪除圖片</h3>
        <div className="max-h-80 overflow-y-auto flex flex-col gap-4">
          {imagesId.map(imageId => (
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
          }
        </div>
      </div>
      {confirmingDelete && (
        <Modal
          title="確認刪除"
          open={true}
          onCancel={handleCancelDelete}
          footer={null}
          width={400} // 設置確認刪除Modal寬度
        >
          <div className="p-6">
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
        </Modal>
      )}
    </Modal>
  );
};

export default ImageManagement;
