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
      </div>
      {/* <p className="mb-6 text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
        {getTypeDescription(typeName)}
      </p> */}
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