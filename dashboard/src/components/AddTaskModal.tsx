import React, { useState, useEffect } from 'react';
import { Modal, TreeSelect, Input, Form } from 'antd';
import type { TreeNodeNormal } from 'antd/lib/tree/Tree';
import { WithContext as ReactTags } from 'react-tag-input';
import { Spin } from 'antd';
import { defaultHttp } from '../utils/http';
import { processDataRoutes } from '../routes/api';
import { storedHeaders } from '../utils/storedHeaders';
import { handleErrorResponse } from '../utils';
import JoditEditor from 'jodit-react';
import { joditConfig } from '../config/joditConfig';

interface Task {
  id: number;
  project_id: number;
  title: string;
  children?: Task[];
}

interface AddTaskModalProps {
  open: boolean;
  onOk: (selectedValue: string, taskDetails: any) => void;
  onCancel: () => void;
}

interface Tag {
  id: string;
  className: string;
  [key: string]: string;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ open, onOk, onCancel }) => {
  const [treeData, setTreeData] = useState<TreeNodeNormal[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskSubtitle, setTaskSubtitle] = useState<string>('');
  const [taskContent, setTaskContent] = useState<string>('');
  const [treeKey, setTreeKey] = useState<number>(0);
  const [memberTags, setMemberTags] = React.useState<Array<Tag>>([]);
  const [paperTags, setPaperTags] = React.useState<Array<Tag>>([]);

  // - Loading
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});    // 儲存各個API的loading狀態
  useEffect(() => {   // 當任何一個API的loading狀態改變時，更新isLoading
    const anyLoading = Object.values(loadingStates).some(state => state);
    setIsLoading(anyLoading);
  }, [loadingStates]);

  const fetchProjects = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, fetchProjects: true }));
      const response = await defaultHttp.get(processDataRoutes.project, {
        headers: storedHeaders()
      });
      const data = response.data.response;
      return data;
    } catch (error) {
      handleErrorResponse(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchProjects: false }));
    }
  };

  const fetchProjectsTasks = async (id: number) => {
    try {
      setLoadingStates(prev => ({ ...prev, fetchProjects: true }));
      const response = await defaultHttp.get(`${processDataRoutes.project}/${id}/task`, {
        headers: storedHeaders()
      });
      const data = response.data.response;
      return data;
    } catch (error) {
      handleErrorResponse(error);
      return [];
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchProjects: false }));
    }
  };

  const formatTasks = (tasks: Task[]): TreeNodeNormal[] => {
    return tasks.map(task => ({
      title: task.title,
      value: `task-${task.project_id}-${task.id}`,
      key: `task-${task.project_id}-${task.id}`,
      isLeaf: !task.children || task.children.length === 0,
      children: task.children ? formatTasks(task.children) : [],
    }));
  };

  const onLoadData = async (treeNode: any) => {
    try {
      const { value } = treeNode;
      const [prefix, id] = value.split('-');
      if (prefix === 'project') {
        const projectId = parseInt(id, 10);
        const tasks = await fetchProjectsTasks(projectId);
        const formattedTasks = formatTasks(tasks);

        const updateTreeData = (list: TreeNodeNormal[], key: React.Key, children: TreeNodeNormal[]): TreeNodeNormal[] =>
          list.map(node => {
            if (node.key === key) {
              return { ...node, children };
            }
            if (node.children) {
              return { ...node, children: updateTreeData(node.children, key, children) };
            }
            return node;
          });

        setTreeData(prevData => updateTreeData(prevData, value, formattedTasks));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onModalOpen = async () => {
    const projects = await fetchProjects();
    const formattedProjects = projects.map((project: { name: any; id: any; }) => ({
      title: project.name,
      value: `project-${project.id}`,
      key: `project-${project.id}`,
      isLeaf: false,
    }));
    setTreeData(formattedProjects);
  };

  const handleDeleteMemberTag = (i: number) => {
    const updatedTags = memberTags.filter((tag, index) => index !== i);
    setMemberTags(updatedTags);
  };

  const handleAdditionMemberTag = (tag: Tag) => {
    setMemberTags((prevTags) => {
      return [...prevTags, tag];
    });
  };

  const handleDragMemberTag = (tag: any, currPos: number, newPos: number) => {
    const newTags = memberTags.slice();
    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);
    setMemberTags(newTags);
  };

  const handleDeletePaperTag = (i: number) => {
    const updatedTags = paperTags.filter((tag, index) => index !== i);
    setPaperTags(updatedTags);
  };

  const handleAdditionPaperTag = (tag: Tag) => {
    setPaperTags((prevTags) => {
      return [...prevTags, tag];
    });
  };

  const handleDragPaperTag = (tag: any, currPos: number, newPos: number) => {
    const newTags = paperTags.slice();
    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);
    setPaperTags(newTags);
  };

  useEffect(() => {
    setTreeData([]);
    onModalOpen();
    setSelectedValue(undefined);
    setTaskTitle('');
    setTaskSubtitle('');
    setTaskContent('');
    setMemberTags([]);
    setPaperTags([]);
    setTreeKey(prevKey => prevKey + 1); // 更新 treeKey 強制重新渲染 TreeSelect
  }, [open]);

  const handleOk = () => {
    if (selectedValue && taskTitle) {
      const taskDetails = {
        title: taskTitle,
        sub_title: taskSubtitle,
        content: taskContent,
        members: memberTags.map(tag => tag.text),
        papers: paperTags.map(tag => tag.text),
      };
      onOk(selectedValue, taskDetails);
      setSelectedValue(undefined);
      setTaskTitle('');
      setTaskSubtitle('');
      setTaskContent('');
      setMemberTags([]);
      setPaperTags([]);
      setTreeData([]);
    } else {
      alert("請填入必填欄位");
    }
  };

  return (
    <Spin spinning={isLoading} tip="Loading...">
      <Modal
        title="新增 Task"
        open={open}
        onOk={handleOk}
        onCancel={() => {
          onCancel();
          setSelectedValue(undefined);
          setTaskTitle('');
          setTaskSubtitle('');
          setTaskContent('');
          setMemberTags([]);
          setPaperTags([]);
          setTreeData([]);
        }}
        okText="儲存"
        cancelText="關閉"
        okButtonProps={{ style: { backgroundColor: '#3c50e0', color: 'white' } }}
        width={'50%'}
      >
        <TreeSelect
          key={treeKey}
          showSearch
          style={{ width: '100%' }}
          value={selectedValue}
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          placeholder="請選擇一個 Project 或 Task"
          allowClear
          treeDefaultExpandAll={false}
          treeData={treeData}
          loadData={onLoadData}
          onChange={value => setSelectedValue(value)}
        />
        {selectedValue && (
          <Form layout="vertical" style={{ marginTop: '20px' }}>
            <Form.Item label="標題" required>
              <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
            </Form.Item>
            <Form.Item label="副標題">
              <Input value={taskSubtitle} onChange={(e) => setTaskSubtitle(e.target.value)} />
            </Form.Item>
            <Form.Item label="成員">
              <ReactTags
                tags={memberTags}
                handleDelete={handleDeleteMemberTag}
                handleAddition={handleAdditionMemberTag}
                handleDrag={handleDragMemberTag}
                inputFieldPosition="top"
                editable
              />
            </Form.Item>
            <Form.Item label="論文">
              <ReactTags
                tags={paperTags}
                handleDelete={handleDeletePaperTag}
                handleAddition={handleAdditionPaperTag}
                handleDrag={handleDragPaperTag}
                inputFieldPosition="top"
                editable
              />
            </Form.Item>
            <Form.Item label="內容">
              <JoditEditor
                value={taskContent}
                config={joditConfig}
                onBlur={(newContent) => setTaskContent(newContent)}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </Spin>
  );
};

export default AddTaskModal;
