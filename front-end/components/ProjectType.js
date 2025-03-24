import ProjectCard from '@/components/ProjectCard';

const ProjectType = ({ projects }) => {
  return (
    <div className="mb-8 p-4 border-2 border-solid border-pink-500 rounded-md shadow-lg">
      <h1 className="mb-3 text-4xl font-bold leading-8 tracking-tight text-black dark:text-white">{projects.length > 0 && projects[0].types.length > 0
          ? projects[0].types
          : 'Other'}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {projects.sort((a, b) => {
          const seqA = a.sequence || 0;
          const seqB = b.sequence || 0;
          return seqA - seqB;
        }).map((d) => (
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
              sequence={d.sequence}
            />
          // </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectType;
