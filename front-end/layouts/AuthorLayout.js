import Image from '@/components/Image'
import { PageSEO } from '@/components/SEO'
import Link from '@/components/Link'
import Experience from '@/components/Experience'
import experienceData from '@/data/experienceData'
import { RoughNotation } from 'react-rough-notation'
import { AiOutlineTwitter } from 'react-icons/ai'

export default function AuthorLayout({ children, frontMatter }) {
  const {
    name,
    avatar,
    occupation,
    company,
    email,
    twitter,
    linkedin,
    github,
    text1,
    text2,
    text3,
    tel,
  } = frontMatter

  return (
    <>
      <PageSEO title={`About - ${name}`} description={`A little trivia me`} />
      <div className="mx-auto max-w-6xl divide-y divide-gray-400">
        <div className="pt-6 pb-8 md:space-y-5 flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-12">
            Advisor
          </h1>
        </div>
      </div>
      <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
        <div className="flex flex-col items-center space-x-2 pt-8 xl:sticky xl:top-0">
          <Image
            src={avatar}
            alt="avatar"
            width="192px"
            height="192px"
            className="h-48 w-48 rounded-full xl:rounded-full"
            placeholder="blur"
            blurDataURL="/static/images/SVG-placeholder.png"
          />
          <h3 className="pt-4 pb-2 text-2xl font-bold leading-8 tracking-tight">{name}</h3>
          <div className="text-gray-500 dark:text-gray-400">{occupation}</div>
          <div className="text-gray-500 dark:text-gray-400">{company}</div>
          <div className="text-gray-500 dark:text-gray-400">Tel:{tel}</div>
        </div>
        <div className="prose max-w-none pt-8 pb-8 dark:prose-dark xl:col-span-2">
          <p>
            <RoughNotation
              type="bracket"
              brackets={['left', 'right']}
              show={true}
              color="#FF0000"
              animationDelay={300}
              animationDuration={3000}
            >
              {text1}
              {/* Currently, I am focused on building data pipelines and automating them at{' '}
              <Link
                href={'https://www.accenture.com/in-en'}
                className="special-underline no-underline hover:text-gray-100 dark:text-gray-100 hover:dark:text-gray-100"
              >
                Accenture
              </Link> */}
            </RoughNotation>
          </p>
          <br />
          <p>
            This is what I am doing right{' '}
            <Link
              href={'/now'}
              className="special-underline no-underline hover:text-gray-100 dark:text-gray-100 hover:dark:text-gray-100"
            >
              now
            </Link>
          </p>
          <br />
          <p className="sm:block md:hidden lg:hidden">
            I am always looking to learn new things. I am currently working on a few projects
            related to
            <span className="font-semibold">
              {' '}
              Natural Language Processing and Machine Learning.{' '}
            </span>
            At the same time I am{' '}
            <RoughNotation
              type="underline"
              show={true}
              color="#FBCFE8"
              animationDelay={1500}
              animationDuration={3000}
              multiline={true}
            >
              actively on the lookout for remote internships which I can pursue in field of Data
              Science.
            </RoughNotation>
          </p>
          <p className="hidden md:block">
            I am always looking to learn new things. I am currently working on a few projects
            related to{' '}
            <RoughNotation
              animationDelay="1000"
              animationDuration="3000"
              type="highlight"
              color="#0ea4e9"
              strokeWidth="3"
              show={true}
            >
              <span className="text-black dark:text-white">
                Natural Language Processing and Machine Learning.{' '}
              </span>
            </RoughNotation>
            At the same time I am{' '}
            <RoughNotation
              type="underline"
              show={true}
              color="#FBCFE8"
              animationDelay={1500}
              animationDuration={3000}
              multiline={true}
            >
              actively on the lookout for remote internships which I can pursue in field of Data
              Science
            </RoughNotation>
          </p>
          <br />
          <p>
            I am a strong advocate for open source and I am always interested in working on new
            projects with new people. Feel free to reach out if you have anything to talk about,
            you can reach me through{' '}
            <Link
              href={'mailto:chiahui@g.ncu.edu.tw '}
              className="special-underline no-underline hover:text-gray-100 dark:text-gray-100 hover:dark:text-gray-100"
            >
              Mail
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="ml-0.5 inline-block h-4 w-4 fill-current"
              >
                <g data-name="Layer 2">
                  <g data-name="external-link">
                    <rect width="24" height="24" opacity="0" />
                    <path d="M20 11a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1z" />
                    <path d="M16 5h1.58l-6.29 6.28a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0L19 6.42V8a1 1 0 0 0 1 1 1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-4a1 1 0 0 0 0 2z" />
                  </g>
                </g>
              </svg>
            </Link>{' '}
            
          </p>
          <br />
          <p>
            <Link
              href={'/project'}
              className="special-underline no-underline hover:text-gray-100 dark:text-gray-100 hover:dark:text-gray-100"
            >
              Here
            </Link>{' '} you can see what I doing now.
          </p>
          <br />
        </div>
      </div>
      <div className="mt-10 md:pl-16">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Experience
          </h1>
        </div>
        <div className="max-w-none pt-8 pb-8 xl:col-span-2">
          {experienceData.map((d, index) => (
            <Experience
              key={index}
              title={d.title}
              company={d.company}
              location={d.location}
              range={d.range}
              url={d.url}
              textArray={d.textArray}
            />
          ))}
        </div>
      </div>
    </>
  )
}
