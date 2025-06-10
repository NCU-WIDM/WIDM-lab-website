import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const ProjectCarousel = ({ projects }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  // 自動切換邏輯 - 當滑鼠懸停時暫停
  useEffect(() => {
    if (projects.length <= 1 || isHovered) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length)
    }, 3000) // 每3秒切換一次

    return () => clearInterval(interval)
  }, [projects.length, isHovered])

  // 處理專案點擊
  const handleProjectClick = async (project) => {
    try {
      // 使用與 ProjectCard 相同的邏輯
      const apiUrl = `/api/project/${project.id}/task`
      const response = await fetch(apiUrl)
      
      if (response.ok) {
        const data = await response.json()
        const projectTasks = data.response
        
        if (projectTasks && projectTasks.length > 0) {
          const sortedTasks = projectTasks.sort((a, b) => {
            if (a.parent_id === 0 && b.parent_id !== 0) return -1
            if (a.parent_id !== 0 && b.parent_id === 0) return 1
            return a.id - b.id
          })
          
          const firstTask = sortedTasks[0]
          router.push(`/projectTasks/${project.id}/${firstTask.id}`)
        } else {
          router.push(`/projectTasks/${project.id}`)
        }
      } else {
        router.push(`/projectTasks/${project.id}`)
      }
    } catch (error) {
      console.error('Failed to navigate to project:', error)
      router.push(`/projectTasks/${project.id}`)
    }
  }

  if (!projects.length) return null

  // 計算要顯示的專案（當前顯示9個）
  const getVisibleProjects = () => {
    const visibleCount = Math.min(9, projects.length)
    const visible = []
    
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % projects.length
      visible.push(projects[index])
    }
    
    return visible
  }

  const visibleProjects = getVisibleProjects()

  return (
    <div className="w-full mb-8">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        {/* 專案輪播區域 */}
        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* 左側導航按鈕 */}
          <button 
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full p-2 shadow-md transition-all duration-200"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length)}
          >
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* 右側導航按鈕 */}
          <button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full p-2 shadow-md transition-all duration-200"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % projects.length)}
          >
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="flex justify-center items-center space-x-1.5 overflow-hidden py-2 px-12">
            {visibleProjects.map((project, index) => {
              // 計算縮放和透明度 (中央專案現在是 index 4)
              const distance = Math.abs(index - 4)
              let scale = 'scale-90'
              let opacity = 'opacity-60'
              
              if (index === 4) {
                scale = 'scale-110'
                opacity = 'opacity-100'
              } else if (distance === 1) {
                scale = 'scale-100'
                opacity = 'opacity-80'
              } else if (distance === 2) {
                scale = 'scale-95'
                opacity = 'opacity-70'
              } else if (distance === 3) {
                scale = 'scale-90'
                opacity = 'opacity-60'
              } else {
                scale = 'scale-85'
                opacity = 'opacity-50'
              }
              
              return (
                <div
                  key={`${project.id}-${currentIndex}-${index}`}
                  className={`flex flex-col items-center transition-all duration-500 ease-in-out cursor-pointer transform ${scale} ${opacity} hover:scale-105`}
                  onClick={() => handleProjectClick(project)}
                >
                {/* 專案圖標 */}
                <div className={`relative mb-2 ${
                  index === 4 ? 'w-14 h-14' : 'w-12 h-12'
                } transition-all duration-300`}>
                  <div className="w-full h-full rounded-lg overflow-hidden bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-2 flex items-center justify-center">
                    {project.icon_existed ? (
                      <img
                        className="w-full h-full object-contain"
                        src={`${API_URL}/project/${project.id}/project-icon`}
                        alt={project.name}
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = '/static/images/placeholder.svg'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {project.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 專案名稱 */}
                <div className="text-center max-w-20">
                  <h3 className={`font-medium text-gray-700 dark:text-gray-300 transition-all duration-300 ${
                    index === 4 ? 'text-sm' : 'text-xs'
                  }`}>
                    {project.name.length > 10 
                      ? `${project.name.substring(0, 10)}...` 
                      : project.name
                    }
                  </h3>
                </div>
              </div>
              )
            })}
          </div>

          {/* 進度指示器 */}
          <div className="flex justify-center mt-3 space-x-1">
            {projects.map((_, index) => (
              <button
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-blue-500 w-4'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 w-1.5'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectCarousel 