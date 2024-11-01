import React, { useState, useEffect } from 'react';
import { WithContext as ReactTags } from 'react-tag-input';
import { DatePicker, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import JoditEditor from 'jodit-react';

dayjs.extend(customParseFormat);
const { Option } = Select;

interface Header {
  id: string;
  Name: string;
  isShow: string | boolean;
  type: string;
  data?: any;
  dateType?: [PickerMode, string];
  required?: string;
}

interface AddItemFormProps {
  headers: Header[];
  onClose: () => void;
  isOpen: boolean;
  onSubmit: (formData: { [key: string]: any }) => void;
  editData?: { [key: string]: any } | null;
  joditConfig?: any;
}

type PickerMode = 'date' | 'week' | 'month' | 'quarter' | 'year'; // 定義PickerMode類型
const AddItemForm: React.FC<AddItemFormProps> = ({ headers, isOpen, onClose, onSubmit, editData, joditConfig }) => {

  // selectitems
  const [selectOpen, setSelectOpen] = useState(false);

  const [formData, setFormData] = useState<{ [key: string]: any }>(() => {
    const initialData: { [key: string]: any } = {};
    headers.forEach(header => {
      if (header.type === 'Date') {
        initialData[header.id] = dayjs().format(header.dateType?.[1] || 'YYYY-MM-DD');
      } else {
        initialData[header.id] = null;
      }
    });
    return initialData;
  });

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        const cleanEditData = { ...editData };
        headers.forEach((header) => {
          if (header.type === 'Tags' && editData[header.id]) {
            cleanEditData[header.id] = editData[header.id].map((item: any) =>
              typeof item === 'string' ? { id: item, text: item } : item
            );
          }
        });
        setFormData(cleanEditData);
      } else {
        // 如果沒有 editData，則重置 formData 為初始狀態
        const initialData: { [key: string]: any } = {};
        headers.forEach(header => {
          if (header.type === 'Date') {
            initialData[header.id] = dayjs().format(header.dateType?.[1] || 'YYYY-MM-DD');
          } else {
            initialData[header.id] = null;
          }
        });
        setFormData(initialData);
      }
    }
  }, [isOpen, editData, headers]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDeleteTag = (i: number, id: string) => {
    const updatedTags = formData[id]?.filter((_: any, index: number) => index !== i) || [];
    setFormData({
      ...formData,
      [id]: updatedTags.length > 0 ? updatedTags : [],
    });
  };

  const handleAdditionTag = (tag: any, id: string) => {
    const updatedTags = [...(formData[id] || []), tag];
    setFormData({
      ...formData,
      [id]: updatedTags.length > 0 ? updatedTags : [],
    });
  };

  const handleDragTag = (tag: any, currPos: number, newPos: number, id: string) => {
    const newTags = formData[id]?.slice() || [];

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    setFormData({
      ...formData,
      [id]: newTags,
    });
  };

  const onTagUpdate = (index: number, newTag: any, id: string) => {
    const updatedTags = formData[id]?.slice() || [];
    updatedTags.splice(index, 1, newTag);
    setFormData({
      ...formData,
      [id]: updatedTags,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 檢查所有必填項是否填寫
    for (const header of headers) {
      if (header.required === 'true' && !formData[header.id]) {
        alert(`${header.Name} 是必填項`);
        return;
      }
    }

    onSubmit(formData);
    onClose();
  };

  const renderDateField = (header: Header) => {
    const [pickerType, setPickerType] = useState<PickerMode>('month');
    const [dateValue, setDateValue] = useState<string | null>(formData[header.id]);

    useEffect(() => {
      setDateValue(formData[header.id])
    }, [formData[header.id]]);
  
    const dateFormats: Record<PickerMode, string> = {
      date: 'YYYY-MM-DD',
      week: 'YYYY-WW',
      month: 'YYYY-MM',
      quarter: 'YYYY-[Q]Q',
      year: 'YYYY',
    };
  
    const handlePickerChange = (value: PickerMode) => {
      setPickerType(value);
      const default_month = '07'

      if (value === 'year') {
        // 如果選擇年份，預設為該年七月
        const currentYear = dayjs().format('YYYY');
        const julyDate = `${currentYear}-${default_month}`; 
        setDateValue(julyDate);
        setFormData({
          ...formData,
          [header.id]: julyDate,
        });
      } else {
        setDateValue(null); // 清除選擇
      }
    };
  
    return (
      <div className="flex items-center gap-2">
        <Select
          value={pickerType}
          onChange={handlePickerChange}
          className="w-1/6"
        >
          <Option value="month">Year-Month</Option>
          <Option value="year">Year</Option>
        </Select>
        <DatePicker
          format={dateFormats[pickerType]}
          picker={pickerType}
          value={dateValue ? dayjs(dateValue, dateFormats[pickerType]) : null}
          onChange={(date) => {
            const formattedDate = date ? date.format(dateFormats[pickerType]) : null;
            setDateValue(formattedDate);
            setFormData({
              ...formData,
              [header.id]: formattedDate,
            });
          }}
          className="w-full"
        />
      </div>
    );
  };
  

  const renderInputField = (header: Header) => {
    const commonProps = {
      name: header.id,
      placeholder: header.Name,
      value: formData[header.id] || '',
      onChange: handleChange,
      required: header.required === 'true',
      className:
        "w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
    };

    if (header.type === 'Number') {
      return (
        <input
          key={header.id}
          type="number"
          {...commonProps}
        />
      );
    } else if (header.type === 'Tags') {
      return (
        <div key={header.id}>
          <ReactTags
            tags={formData[header.id] || []}
            handleDelete={(i: number) => handleDeleteTag(i, header.id)}
            handleAddition={(tag) => handleAdditionTag(tag, header.id)}
            handleDrag={(tag, currPos, newPos) => handleDragTag(tag, currPos, newPos, header.id)}
            onTagUpdate={(index, newTag) => onTagUpdate(index, newTag, header.id)}
            inputFieldPosition="top"
            editable
          />
        </div>
      );
    } else if (header.type === 'Textarea') {
      return (
        <textarea
          key={header.id}
          {...commonProps}
          rows={4}
        />
      );
    } else if (header.type === 'Date') {
      return renderDateField(header);
    } else if (header.type === 'Select') {
      return (
        <select
          key={header.id}
          {...commonProps}
        >
          <option value="" disabled>{`選擇${header.Name}`}</option>
          {header.data?.map((option: string) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    } else if (header.type === 'SelectItems') {
      return (
        <Select
          key={header.id}
          mode="tags"
          placeholder={header.data.length > 0 ? `選擇或輸入${header.Name}` : `輸入${header.Name} (按下Enter輸入多個)`}
          value={formData[header.id] || undefined} // 使用 undefined 來表示沒有選擇
          className="w-full"
          size={'large'}
          open={selectOpen && header.data.length > 0} // 如果有資料才顯示下拉選單
          suffixIcon={header.data.length > 0 ? undefined : null} // 如果沒有資料，不顯示下拉選單的箭頭
          onDropdownVisibleChange={(open) => {
            // 只有在有資料時才改變下拉選單的開啟狀態
            if (header.data.length > 0) {
              setSelectOpen(open);
            }
          }}
          onChange={(value) => {
            setFormData({ ...formData, [header.id]: value });
          }}
          options={header.data.map((item: any) => ({ label: item, value: item }))}
        />
      );
    } else if (header.type === 'jodit') {
      return (
        <JoditEditor
          key={header.id}
          value={formData[header.id] || ''}
          onBlur={(newContent) => setFormData({
            ...formData,
            [header.id]: newContent,
          })}
          config={joditConfig}
        />
      );
    }
    return (
      <input
        key={header.id}
        type="text"
        {...commonProps}
      />
    );
  };

  return (
    <Modal
      title={editData ? 'Edit Item' : 'Add New Item'}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered={true}
      maskClosable={false}
    >
      <div className="overflow-y-auto max-h-[80vh] p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {headers
            .filter(
              (header) =>
                header.id !== 'id' &&
                header.id !== 'actions' &&
                header.id !== 'imageActions' &&
                header.id !== 'imagesActions' &&
                header.id !== 'attachmentActions'
            )
            .map((header) => (
              <div key={header.id}>
                <label className="mb-3 block text-black dark:text-white">
                  {header.required === 'true' && (
                    <span className="text-red-500">* </span>
                  )}
                  {header.Name}
                </label>
                {renderInputField(header)}
              </div>
            ))}
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
              {editData ? '更新' : '新增'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddItemForm;
