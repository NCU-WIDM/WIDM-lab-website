import ProjectCard from '@/components/ProjectCard';

const ProjectType = ({ projects }) => {
  const typeName = projects.length > 0 && projects[0].types.length > 0
    ? projects[0].types
    : 'Other';
    
  // Count projects with demos
  const demoCount = projects.filter(project => project.link).length;
    
  return (
    <div className="w-full">
      <div className="mb-6 flex items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{typeName}</h2>
        <div className="ml-4 h-0.5 flex-grow bg-pink-500"></div>
        {demoCount > 0 && (
          <div className="ml-4 flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="mr-1.5 h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
            {demoCount} Interactive {demoCount === 1 ? 'Demo' : 'Demos'}
          </div>
        )}
      </div>
      <p className="mb-6 text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
        {getTypeDescription(typeName)}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.sort((a, b) => {
          const seqA = a.sequence || 0;
          const seqB = b.sequence || 0;
          return seqA - seqB;
        }).map((d) => (
          <div key={d.id} className="flex">
            <ProjectCard
              project_id={d.id}
              title={d.name}
              description={d.description}
              summary={d.summary}
              github={d.github}
              tags={d.tags}
              icon={d.icon}
              members={d.members}
              types={d.types}
              start_time={d.start_time}
              end_time={d.end_time}
              project_link={d.link}
              icon_existed={d.icon_existed}
              sequence={d.sequence}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to provide descriptions for each project type
function getTypeDescription(type) {
  const descriptions = {
    'Legal AI': 'Cutting-edge AI solutions for legal document analysis, judgment prediction, and legal assistance.',
    'NLP': 'Natural Language Processing research focusing on text understanding, generation, and semantic analysis.',
    'Computer Vision': 'Research in image recognition, object detection, and visual data understanding.',
    'Data Mining': 'Techniques and algorithms for discovering patterns in large datasets.',
    'other': 'Various research projects that cross multiple domains.'
  };
  
  return descriptions[type] || `Our research projects in the ${type} domain.`;
}

export default ProjectType;