import React from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { HiChevronDown, HiFolderAdd } from 'react-icons/hi';
import { IoIosSchool } from 'react-icons/io';
import { FaFileAlt } from 'react-icons/fa';
import { AiFillCode } from 'react-icons/ai';

import Link from '@/components/Link'


const IconMap = [
  <HiFolderAdd />,
  <IoIosSchool />,
  <FaFileAlt />,
  <AiFillCode />
];

// 定義顏色陣列，用於不同層級的背景顏色
const colorMap = [
  "#95ABE2",
  "#E39696",
  "#91C67C",
  "#E4C969"
];

function TimelineItem({ item, level = 0 }) {
  const icon = IconMap[level % IconMap.length];
  const backgroundColor = colorMap[level % colorMap.length]; // 獲取對應層級的背景顏色


  return (
    <>
      <Link
        href={`/projectTasks/${item.project_id}/${item.id}`}
        key={item.project_task_id}
      >
        <li className="list-none mb-4 ml-8 rounded-md border border-gray-100 bg-white px-4 py-4 shadow-sm shadow-gray-300 dark:border-zinc-900 dark:bg-zinc-900 dark:shadow-none"
            style={{ borderColor: backgroundColor, boxShadow: `0 2px 4px ${backgroundColor}` }}>
          <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full"
                style={{ backgroundColor: backgroundColor, ringColor: backgroundColor }}>
            {icon}
          </span>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {item.title}
            
          </h2>
          <p className='mt-1 mb-3 '>{
            item.sub_title && (
              <span className="mt-2 mb-3 rounded px-2.5 py-0.5 text-sm font-medium"
                    style={{ backgroundColor: backgroundColor, color: '#FFFFFF' }}>
                {item.sub_title}
              </span>
            )}
          </p>
          <time className="text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
            updated by {item.update_time}
          </time>
        </li>
      </Link>
      {item.children.length != 0 && (
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button>
                <div className="text-small ml-1.5 flex">
                  <HiChevronDown className={`h-6 w-6 transform transition-all duration-200 ${open ? 'rotate-180 text-gray-300 font-normal' : 'text-gray-700 font-bold'}`} />
                </div>
              </Disclosure.Button>
              <Transition
                show={open}
                enter="transition duration-400 ease-in-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel>
                  <ul className='list-none'>
                    {item.children.map((child, index) => <TimelineItem key={child.id} item={child} level={level + 1} />)}
                  </ul>
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
      )}
    </>
  );
}

function Timeline({ items }) {
  return (
    <div>
      <ol className="relative mt-6 ml-6 border-l border-zinc-400 dark:border-gray-800">
        {items.map(item => <TimelineItem key={item.id} item={item} level={0} />)}
      </ol>
    </div>
  );
}

export default Timeline;
