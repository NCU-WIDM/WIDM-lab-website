import React, { useState } from 'react';
import { Modal } from 'antd';

interface UploadImageProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: { [key: string]: any }) => void;
}

const UploadImage: React.FC<UploadImageProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFile) {
      setFormData({
        ...formData,
        image: imageFile,
      });
      onSubmit({ ...formData, image: imageFile });
      onClose();
    } else {
      onSubmit(formData);
      onClose();
    }
  };

  return (
    <Modal
      title="Upload Image"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered={true}
      maskClosable={false}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="mb-3 block text-black dark:text-white">圖片 (會覆蓋原有圖片)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
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
    </Modal>
  );
};

export default UploadImage;
