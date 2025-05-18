import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import { Select, Tree, TreeProps, Spin, message } from 'antd';
import AddTaskModal from '../components/AddTaskModal';
import { DownOutlined } from '@ant-design/icons';
import JoditEditor from 'jodit-react';
import { defaultHttp } from '../utils/http';
import { processDataRoutes } from '../routes/api';
import { storedHeaders } from '../utils/storedHeaders';
import { handleErrorResponse } from '../utils';
import { joditConfig } from '../config/joditConfig';

const { Option } = Select;

interface ProjectTask {
  id: number;
  parent_id: number;
  project_id: string;
  content: string;
  sub_title: string;
  title: string;
  create_time: string;
  update_time: string;
  children: ProjectTask[];
  members: Tag[];
  papers: Tag[];
}

interface creatTaskData {
  title: string,
  sub_title: string,
  content: string,
  members: [],
  papers: [],
}

interface Tag {
  id: string;
  className: string;
  [key: string]: string;
}

const ProjectPage = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState(0);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [projectTask, setProjectTask] = useState<ProjectTask | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
      setProjects(data);
    } catch (error) {
      handleErrorResponse(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchProjects: false }));
    }
  };

  const fetchProjectsTasks = async (id: number) => {
    try {
      setLoadingStates(prev => ({ ...prev, fetchProjectsTasks: true }));
      const response = await defaultHttp.get(`${processDataRoutes.project}/${id}/task`, {
        headers: storedHeaders()
      });
      const data = response.data.response;
      setProjectTasks(data);
    } catch (error) {
      handleErrorResponse(error);
      console.error('API 調用失敗:', (error as Error).message);
      if ((error as any).response) {
        console.error('API Response Error:', (error as any).response.body);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchProjectsTasks: false }));
    }
  };

  const fetchProjectsTask = async (projectTaskId: number) => {
    try {
      setLoadingStates(prev => ({ ...prev, fetchProjectsTask: true }));
      const response = await defaultHttp.get(`${processDataRoutes.project}/${projectId}/task/${projectTaskId}`, {
        headers: storedHeaders()
      });
      const data = response.data.response;
      // 重組 members
      const transformedMembers = data.members.map((member: string, index: number) => ({
        id: (index + 1).toString(),
        text: member,
        className: ''
      }));

      // 重組 papers
      const transformedPapers = data.papers.map((paper: string, index: number) => ({
        id: (index + 1).toString(),
        text: paper,
        className: ''
      }));

      // 更新 projectTask
      setProjectTask({
        ...data,
        members: transformedMembers,
        papers: transformedPapers
      });
    } catch (error) {
      handleErrorResponse(error);
      console.error('API 調用失敗:', (error as Error).message);
      if ((error as any).response) {
        console.error('API Response Error:', (error as any).response.body);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchProjectsTask: false }));
    }
  };

  const handleAddTask = async (selectedValue: string, taskDetails: creatTaskData) => {
    try {
      setLoadingStates(prev => ({ ...prev, handleAddTask: true }));
      console.log(selectedValue);
      let project_id = '';
      let parent_id = 0;
      if (selectedValue.startsWith('project-')) {
        project_id = selectedValue.split('-')[1];
      } else if (selectedValue.startsWith('task-')) {
        project_id = selectedValue.split('-')[1];
        parent_id = parseInt(selectedValue.split('-')[2], 10);
      }

      const newTask = {
        parent_id: parent_id,
        title: taskDetails.title,
        sub_title: taskDetails.sub_title,
        content: taskDetails.content,
        members: taskDetails.members,
        papers: taskDetails.papers,
        create_time: new Date().toISOString(),
        update_time: new Date().toISOString(),
        children: [],
      };
    
      await defaultHttp.post(`${processDataRoutes.project}/${project_id}/task`, newTask, { headers: storedHeaders() });
      message.success('新增成功!');
      fetchProjectsTasks(project_id);
    } catch (error) {
      console.error('API 新增失敗:', (error as Error).message);
      message.error('新增失敗!');
      if ((error as any).response) {
        console.error('API Response Error:', (error as any).response.body);
      }
    } finally {
      handleCloseModal();
      setLoadingStates(prev => ({ ...prev, handleAddTask: false }));
    }
  };

  const handleSubmitTaskUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (projectTask) {
      try {
        setLoadingStates(prev => ({ ...prev, handleSubmitTaskUpdate: true }));
        const updatedTask = {
          ...projectTask,
          title: (event.target as any).title.value,
          sub_title: (event.target as any).sub_title.value,
          content: projectTask.content, // 直接使用狀態中的內容
          members: projectTask.members.map(tag => tag.text),
          papers: projectTask.papers.map(tag => tag.text),
        };
      
        await defaultHttp.patch(`${processDataRoutes.project}/${projectId}/task/${projectTask.id}`, updatedTask, { headers: storedHeaders() });
        message.success('更新成功!');
        fetchProjectsTasks(projectId);
      } catch (error) {
        console.error('API 更新失敗:', (error as Error).message);
        message.error('更新失敗!');
        if ((error as any).response) {
          console.error('API Response Error:', (error as any).response.body);
        }
      } finally {
        setLoadingStates(prev => ({ ...prev, handleSubmitTaskUpdate: false }));
      }
    }
  };

  const handleDeleteProjectTask = async () => {
    if (projectTask) {
      try {
        setLoadingStates(prev => ({ ...prev, handleDeleteProjectTask: true }));
        if (!window.confirm('確定要刪除此資料嗎?')) {
          return;
        }
        await defaultHttp.delete(`${processDataRoutes.project}/${projectId}/task/${projectTask.id}`, { headers: storedHeaders() });
        message.success('刪除成功!');  // 顯示成功消息
        fetchProjectsTasks(projectId);
        setProjectTask(null);
      } catch (error) {
        console.error('API 刪除失敗:', (error as Error).message);
        message.error('刪除失敗!');  // 顯示錯誤消息
        if ((error as any).response) {
          console.error('API Response Error:', (error as any).response.body);
        }
      } finally {
        setLoadingStates(prev => ({ ...prev, handleDeleteProjectTask: false }));
      }
    }
  };

  const convertToTreeData = (tasks: ProjectTask[]): { title: string; key: number; children: any[] }[] => {
    return tasks.map(task => ({
      title: task.title,
      key: task.id,
      children: convertToTreeData(task.children || [])
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectTask(prevTask => prevTask ? { ...prevTask, [name]: value } : null);
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleEditorBlur = (newContent: string) => {
    if (projectTask) {
      setProjectTask({ ...projectTask, content: newContent });
    }
  };

  const onTreeSelect: TreeProps['onSelect'] = async (selectedKeys, info) => {
    await fetchProjectsTask(info.node.key as number);
  };

  const handleSelectChange = (id: string) => {
    fetchProjectsTasks(id);
    setProjectId(id);
    setProjectTask(null);
  };

  const handleDeleteMmeberTag = (i: number) => {
    if (projectTask) {
      const updatedTags = projectTask.members.filter((tag, index) => index !== i);
      setProjectTask({ ...projectTask, members: updatedTags });
    }
  };

  const handleAdditionMemberTag = (tag: Tag) => {
    if (projectTask) {
      const updatedTags = [...(projectTask.members || []), tag];
      setProjectTask({ ...projectTask, members: updatedTags });
    }
  };

  const handleDragMemberTag = (tag: any, currPos: number, newPos: number) => {
    if (projectTask) {
      const newTags = projectTask.members.slice();
      newTags.splice(currPos, 1);
      newTags.splice(newPos, 0, tag);
      setProjectTask({ ...projectTask, members: newTags });
    }
  };

  const handleDeletePaperTag = (i: number) => {
    if (projectTask) {
      const updatedTags = projectTask.papers.filter((tag, index) => index !== i);
      setProjectTask({ ...projectTask, papers: updatedTags });
    }
  };

  const handleAdditionPaperTag = (tag: Tag) => {
    if (projectTask) {
      const updatedTags = [...(projectTask.papers || []), tag];
      setProjectTask({ ...projectTask, papers: updatedTags });
    }
  };

  const handleDragPaperTag = (tag: any, currPos: number, newPos: number) => {
    if (projectTask) {
      const newTags = projectTask.papers.slice();
      newTags.splice(currPos, 1);
      newTags.splice(newPos, 0, tag);
      setProjectTask({ ...projectTask, papers: newTags });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <Spin spinning={isLoading} tip="Loading...">
      <DefaultLayout>
        <Breadcrumb pageName="Project_Task" />
        <div className="flex justify-end mb-1">
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center justify-center rounded-md border border-meta-3 py-1 px-3 text-center font-medium text-meta-3 hover:bg-opacity-90"
          >
            新增 Task
          </button>
        </div>
        <AddTaskModal
          open={isModalVisible}
          onOk={handleAddTask}
          onCancel={handleCloseModal}
        />
        <div className="flex flex-col gap-6 mt-5">
          <div className="relative rounded-sm border border-stroke bg-white px-5 pt-6 pb-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-6">
            <div className="max-w-full overflow-x-auto">
              <Select
                style={{ width: 200 }}
                placeholder="Select a project"
                onChange={handleSelectChange}
              >
                {projects.map((project) => (
                  <Option key={project.id} value={project.id}>
                    {project.name}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="mt-4 flex">
              {projectTasks.length !== 0 || projectId === 0 ?
                <Tree
                  showLine
                  switcherIcon={<DownOutlined />}
                  treeData={convertToTreeData(projectTasks)}
                  onSelect={onTreeSelect}
                  className="flex-grow"
                /> : <div>No Data</div>}
              {projectTask && (
                <div className="w-3/4 max-w-4xl rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6 ml-4">
                  <form onSubmit={handleSubmitTaskUpdate} className="flex flex-col gap-6">
                    <div>
                      <label className="mb-3 block text-black dark:text-white">
                        <span className="text-red-500">* </span>標題
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={projectTask?.title || ''}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border border-gray-400 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-3 block text-black dark:text-white">副標題</label>
                      <input
                        type="text"
                        name="sub_title"
                        value={projectTask?.sub_title || ''}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border border-gray-400 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="mb-3 block text-black dark:text-white">成員</label>
                      <Select
                        mode="tags"
                        placeholder={`輸入成員 (按下Enter輸入多個)`}
                        value={projectTask?.members.map((member) => member.text) || undefined} // 將 Tag 元素轉換為 Select 的值
                        className="w-full"
                        size="large"
                        open={false}
                        suffixIcon={null}
                        onChange={(value) => {
                          // 更新選中的成員 tags
                          const updatedTags = value.map((item, index) => ({
                            id: index.toString(),
                            text: item,
                            className: '',
                          }));
                          setProjectTask({ ...projectTask, members: updatedTags });
                        }}
                        options={projectTask?.members.map((member) => ({ label: member.text, value: member.text }))}
                      />
                    </div>
                    <div>
                      <label className="mb-3 block text-black dark:text-white">論文</label>
                      <Select
                        mode="tags"
                        placeholder={`輸入論文 (按下Enter輸入多個)`}
                        value={projectTask?.papers.map((paper) => paper.text) || undefined} // 將 Tag 元素轉換為 Select 的值
                        className="w-full"
                        size="large"
                        open={false}
                        suffixIcon={null}
                        onChange={(value) => {
                          // 更新選中的論文 tags
                          const updatedTags = value.map((item, index) => ({
                            id: index.toString(),
                            text: item,
                            className: '',
                          }));
                          setProjectTask({ ...projectTask, papers: updatedTags });
                        }}
                        options={projectTask?.papers.map((paper) => ({ label: paper.text, value: paper.text }))}
                      />
                    </div>
                    <div>
                      <label className="mb-3 block text-black dark:text-white">內容</label>
                      <JoditEditor
                        value={projectTask?.content}
                        config={joditConfig}
                        onBlur={(newContent) => handleEditorBlur(newContent)}
                      />
                    </div>
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => setProjectTask(null)}
                        className="rounded-md border border-stroke bg-transparent py-2 px-4 text-black dark:text-white"
                      >
                        關閉
                      </button>
                      <button
                        type="submit"
                        className="rounded-md border border-primary bg-primary py-2 px-4 text-white"
                      >
                        更新
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteProjectTask}
                        className="rounded-md border border-red-600 bg-red-600 py-2 px-4 text-white"
                      >
                        刪除此任務
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </DefaultLayout>
    </Spin>
  );
};

export default ProjectPage;
