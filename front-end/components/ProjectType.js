import ProjectCard from '@/components/ProjectCard';

const ProjectType = ({ projects }) => {
  return (
    <div className="mb-8 p-4 border-2 border-solid border-pink-500 rounded-md shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{projects.length > 0 && projects[0].types.length > 0
          ? projects[0].types
          : 'Other'}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {projects.map((d) => (
          // <div key={d.id} className="flex">
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
            />
          // </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectType;
