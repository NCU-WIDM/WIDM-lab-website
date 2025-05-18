import React, { useState, useEffect } from 'react';
import Activate from '@/components/Activity';
import Link from '@/components/Link';

const DisplayMessage = ({ title, info }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % info.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [info.length]);

    return (
        <>
            <hr style={{paddingBottom: '20px'}}></hr>
            <Link
                href={`/${title.toLowerCase()}`}
                className="link-underline rounded py-1 px-2 text-2xl font-bold text-gray-800 hover:bg-gray-200 dark:text-gray-500 dark:hover:bg-gray-700 sm:py-2 sm:px-3"
            >
                {title}
            </Link>
            <div className="w-full">
                {title === 'News' ? (
                    <Link
                        href={`/news/${info[currentIndex].id}`}
                        key={info[currentIndex].id}
                        className="group flex bg-transparent bg-opacity-20 px-2 transition duration-100 hover:scale-105 hover:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <li key={info[currentIndex].uniqueId} className="list-none py-6 w-full">
                            <article className="h-28 min-h-[112px] space-y-2 bg-transparent bg-opacity-20 p-2 transition duration-200 hover:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-3">
                                <div className="space-y-5 xl:col-span-4">
                                    <div className="space-y-1">
                                        <div>
                                            <h2 className="text-2xl font-bold leading-8 tracking-tight">
                                                {info[currentIndex].title}
                                            </h2>
                                        </div>
                                        <div>{info[currentIndex].sub_title}</div>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{info[currentIndex].create_time}</p>
                                </div>
                            </article>
                        </li>
                    </Link>
                ) : (
                    <div className="w-full flex justify-center items-center">
                        <Activate {...info[currentIndex]} />
                    </div>
                )}
            </div>
        </>
    );
};

export default DisplayMessage;
