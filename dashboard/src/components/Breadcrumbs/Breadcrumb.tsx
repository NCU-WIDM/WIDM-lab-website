import { Link } from 'react-router-dom';
interface BreadcrumbProps {
  pageName: string;
}
const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  return (
    <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-title-md2 font-semibold text-black dark:text-white">
        {pageName}
      </h2>

      <nav>
        <div className="flex items-center">
          <span className="font-medium">
            <Link to="/">Dashboard</Link>
          </span>
          <span className="mx-2">/</span>
          <span className="font-medium text-primary">{pageName}</span>
        </div>
      </nav>
    </div>
  );
};

export default Breadcrumb;
