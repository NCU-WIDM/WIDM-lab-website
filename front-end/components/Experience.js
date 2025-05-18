import Link from '@/components/Link'

const Experience = ({ title, company, location, range, url, textArray = [] }) => {
  return (
    <div className="my-3">
      <div className="flex flex-row text-xl">
        <span className="text-gray-500 dark:text-gray-400">{title}</span>{' '}
        <span className="text-gray-500 dark:text-gray-400">&nbsp;&nbsp;</span>{' '}
        <span className="text-primary-color-500">
          <Link href={url} className="company">
            {company}
          </Link>
        </span>
      </div>
      <div>
        <div className="p-1 font-mono text-sm text-gray-400 dark:text-gray-600">{range}</div>
        <div className="p-2">
          {textArray.map((text, index) => (
            <div key={index} className="grid grid-cols-1 flex-nowrap gap-1 md:grid-cols-9">
              <div className="flex items-center md:col-span-2 md:flex-row">
                <div className="items-top flex">
                  <div className="mr-2 text-lg text-primary-color-500"> &#8227;</div>
                  <div className="mr-4 whitespace-nowrap text-lg text-gray-500 dark:text-gray-400">
                    {text.time}
                  </div>
                </div>
              </div>
              <div className="mb-2 mr-4 text-gray-500 dark:text-gray-400 md:col-span-7">
                {text.content &&
                  text.content.map((contentItem, contentIndex) =>
                    contentItem.link ? (
                      <a
                        key={contentIndex}
                        href={contentItem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-color-500"
                      >
                        {contentItem.text}
                      </a>
                    ) : (
                      <a key={contentIndex}>{contentItem.text}</a>
                    )
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="justify-center text-center text-2xl font-medium text-gray-200  dark:text-gray-600">
        {/* &#126;&#126;&#126; */}
      </div>
    </div>
  )
}

export default Experience
