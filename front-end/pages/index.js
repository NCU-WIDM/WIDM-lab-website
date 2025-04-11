import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import { RoughNotation } from 'react-rough-notation'
import { IoMdReturnLeft } from "react-icons/io"
import React, { useState, useRef, useEffect } from 'react'
import eventBus from '../utils/eventBus'
import { Icon } from '@iconify/react'
import { defaultHttp } from '../utils/http'
import { processDataRoutes } from '../routes/api'
import { marked } from 'marked';
import Tag from '@/components/Tag'
import DisplayMessage from '@/components/DisplayMessage'
import { post } from 'superagent'

export default function Home({news,activities}) {
  const [messages, setMessages] = useState([]);
  const nodeRef = useRef(null);
  const messagesEndRef = useRef(null);
  const labinfo = `
  The Web Intelligence and Data Mining Laboratory at National Central University's Computer Science Department focuses on developing intelligent systems for complex real-world challenges. Our research encompasses web intelligence, data mining, machine learning, and AI applications. By combining theoretical foundations with practical implementations, we develop innovative solutions for both academic and industrial applications. Our laboratory provides a collaborative environment where students and researchers work together on challenging problems in data analysis, pattern recognition, and intelligent system design.`
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    eventBus.on('refreshMessages', loadMessagesFromStorage); // 訂閱刷新消息事件
    return () => {
      eventBus.off('refreshMessages', loadMessagesFromStorage); // 清除訂閱
    };
  }, []);

  const loadMessagesFromStorage = () => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  };

  useEffect(() => {
    if (messages.length > 10) {
      setMessages((prevMessages) => prevMessages.slice(1));
    }
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (nodeRef.current) {
      nodeRef.current.scrollTop = nodeRef.current.scrollHeight;
    }
  }, [messages]);

  // const handleSubmitMessage = async (current_text) => {
    
  //   const timestamp = new Date().toLocaleString(); // 獲取當前時間
  //   const newMessage = { sender: 'user', text: current_text };
  //   const timeMessage = { sender: 'time', text: timestamp };
  //   const tempMessage = { sender: 'api', text: 'loading' }; // 等待回應的符號...
  //   const updatedMessages = [...messages, timeMessage, newMessage, tempMessage];
  //   if (updatedMessages.length > 15) {
  //     updatedMessages.shift();
  //     updatedMessages.shift(); // 移除最舊的訊息
  //   }

  //   setMessages(updatedMessages);
  //   localStorage.setItem('chatMessages', JSON.stringify(updatedMessages)); // 更新 localStorage
  //   eventBus.emit('refreshMessages'); // 通知其他對話框刷新消息
  //   // - Response
  //   const response = await defaultHttp.get(`${processDataRoutes.retrieval}/query`, {
  //     params: {
  //       query_string: current_text,
  //       person_id: "1"
  //     }
  //   });
  //   // console.log(response)
  //   const responseMessage = { sender: 'api', text: response.data.response.answer }; // 單一解答
  //   // console.log(response.data.response)
  //   const responseSourceLink = response.data.response.source_list; // 連結列表 (list)
  //   const linksource = Array.isArray(responseSourceLink) && responseSourceLink.length > 0
  //   ? responseSourceLink
  //       .map((link, index) => {
  //         const isLastLink = index === responseSourceLink.length - 1;
  //         return `<a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a>${isLastLink ? '' : '<br>'}`;
  //       })
  //       .join('')
  //   : '';
  //   const combinedMessage = {
  //     sender: 'api',
  //     text: linksource ? `${marked(responseMessage.text)}<br>${linksource}` : responseMessage.text,
  //   };

  //   // 合併到 finalMessages
  //   const finalMessages = [
  //     ...updatedMessages.slice(0, -1), // 保留原來的訊息，移除最後一個
  //     combinedMessage, // 插入合併後的訊息
  //   ];

  //   // console.log(finalMessages);
  //   // const responseMessage = { sender: 'api', text: response.data.response.answer };
  //   // const responseSourceLink = { sender: 'api', text: response.data.response.source_list };
  //   // const finalMessages = [...updatedMessages.slice(0, -1), responseMessage]; // 排除回覆符號，在新增回覆訊息

  //   if (finalMessages.length > 15) {
  //     finalMessages.shift(); // 移除最舊的訊息
  //   }
  //   setMessages(finalMessages || []);
  //   localStorage.setItem('chatMessages', JSON.stringify(finalMessages)); // 更新 localStorage
  //   eventBus.emit('refreshMessages'); // 通知其他對話框刷新消息
  // };

  // function AutoResizeTextarea() {
  //   const [text, setText] = useState("");
  //   const [textareaHeight, setTextareaHeight] = useState('6rem');
  //   const [isComposing, setIsComposing] = useState(false);
  //   const textareaRef = useRef(null);

  //   useEffect(() => {
  //     textareaRef.current.style.height = "inherit";
  //     const newHeight = `${textareaRef.current.scrollHeight}px`;
  //     textareaRef.current.style.height = newHeight;
  //     setTextareaHeight(newHeight);
  //   }, [text]);

  //   const handleSubmit = () => {
  //     handleSubmitMessage(text);
  //     setText("");
  //   };

  //   const handleKeyDown = (event) => {
  //     if (event.key === 'Enter' && !event.shiftKey && !isComposing) {
  //       event.preventDefault();
  //       handleSubmit();
  //     }
  //   };

  //   const handleComposition = (event) => {
  //     if (event.type === 'compositionstart') {
  //       setIsComposing(true);
  //     }
  //     if (event.type === 'compositionend') {
  //       setIsComposing(false);
  //     }
  //   };

  //   return (
  //     <div className="flex items-stretch space-x-2">
  //       <textarea
  //         ref={textareaRef}
  //         className="bg-gray-100 dark:bg-black borde r border-gray-300 rounded-l-md flex-1 py-4 px-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  //         placeholder="輸入消息..."
  //         value={text}
  //         onChange={(e) => setText(e.target.value)}
  //         onKeyDown={handleKeyDown}
  //         onCompositionStart={handleComposition}
  //         onCompositionEnd={handleComposition}
  //         style={{ minHeight: '3rem', maxHeight: '24rem' }}
  //       />
  //       <button
  //         className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-r-md"
  //         onClick={handleSubmit}
  //         type="button"
  //         style={{
  //           height: textareaHeight,
  //           opacity: 0.7,
  //           boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  //           transition: 'opacity 0.3s ease, box-shadow 1s ease'
  //         }}
  //       >
  //         <IoMdReturnLeft className="text-xl"/>
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <div>
      
        <div className="pt-10">
          <h1 className="pb-6 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Hello, Here's &nbsp;
            <span className="text-primary-color-500 dark:text-primary-color-dark-500">WIDM</span>
          </h1>
        </div>

        <hr style={{paddingBottom: '20px'}}></hr>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:flex-row item-center">
          
          <div className="col-span-1 flex items-center justify-center">
            <div className="grid grid-cols-1 grid-rows-3 gap-8 py-12">
              <div className="my-2 grid items-start gap-8">
                <div className="group relative">
                  <div className="animate-tilt absolute -inset-0.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 opacity-50 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
                  <Link href="/project">
                    <span className="relative flex items-center divide-x divide-gray-600 rounded-lg bg-white px-7 py-4 leading-none dark:bg-black">
                      <span className="flex items-center space-x-5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 -rotate-6 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                          />
                        </svg>
                        <span className="pr-6 text-gray-900 dark:text-gray-100">What we Built</span>
                      </span>
                      <span className="pl-6 text-amber-400 transition duration-200 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                        Projects&nbsp;&rarr;
                      </span>
                    </span>
                  </Link>
                </div>
              </div>

              <div className="my-2 grid items-start gap-8 ">
                <div className="group relative">
                  <div className="animate-tilt absolute -inset-0.5 rounded-lg bg-gradient-to-r from-fuchsia-600 to-emerald-600 opacity-50 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
                  <Link href="https://sites.google.com/site/jahuichang/" newTab={true}>
                    <span className="relative flex items-center divide-x divide-gray-600 rounded-lg bg-white px-7 py-4 leading-none dark:bg-black">
                      <span className="flex items-center space-x-5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 -rotate-6 text-fuchsia-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M12 14l9-5-9-5-9 5-9-5 9 5z" />
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 14l9-5-9-5-9 5-9-5 9 5-9-5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                          />
                        </svg>
                        <span className="pr-6 text-gray-900 dark:text-gray-100">Our Advisor</span>
                      </span>
                      <span className="pl-6 text-indigo-400 transition duration-200 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                        Website&nbsp;&rarr;
                      </span>
                    </span>
                  </Link>
                </div>
              </div>

              <div className="my-2 grid items-start gap-8">
                <div className="group relative">
                  <div className="animate-tilt absolute -inset-0.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 opacity-50 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
                  <Link href="/members">
                    <span className="relative flex items-center divide-x divide-gray-600 rounded-lg bg-white px-7 py-4 leading-none dark:bg-black">
                      <span className="flex items-center space-x-5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 -rotate-6 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                          />
                        </svg>
                        <span className="pr-6 text-gray-900 dark:text-gray-100">Our Member!</span>
                      </span>
                      <span className="pl-6 text-amber-400 transition duration-200 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                        Check&nbsp;&rarr;
                      </span>
                    </span>
                  </Link>
                </div>
              </div>

              <div className="my-2 grid items-start gap-8">

                <div className="group relative">
                  <div className="animate-tilt absolute -inset-0.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 opacity-50 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
                  <Link href="/papers" newTab={true}>
                    <span className="relative flex items-center divide-x divide-gray-600 rounded-lg bg-white px-7 py-4 leading-none dark:bg-black">
                      <span className="flex items-center space-x-5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 -rotate-6 text-pink-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                          />
                        </svg>
                        <span className="pr-6 text-gray-900 dark:text-gray-100">
                          What We Publish&nbsp;&nbsp;&nbsp;
                        </span                      >
                      </span>
                      <span className="pl-6 text-primary-400 transition duration-200 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                        Paper&nbsp;&rarr;
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 xl:col-span-2 space-y-8">
            <h2 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Our Lab
            </h2>

            <div className="w-full mb-12">
              <RoughNotation
                type="bracket"
                brackets={['left', 'right']}
                show={true}
                color="#FF0000"
                animationDelay={300}
                animationDuration={3000}
              >
                <p className="text-lg leading-relaxed">{labinfo}</p>
              </RoughNotation>
            </div>

            <div className="flex flex-wrap">
              <Tag text={'#Natural Language Processing'} />
              <Tag text={'#Machine Learning'} />
              <Tag text={'#Data Mining'} />
              <Tag text={'#Conversational Agents'} />
              <Tag text={'#knowledge graphs'} />
            </div>

          </div>
        </div>
        {news && news.length > 0 && (
          <DisplayMessage title = {'News'} info={news}/>
        )}
        
        {activities && activities.length > 0 && (
          <DisplayMessage title = {'Activate'} info={activities}/>
        )}
        <hr className="my-8"></hr>
        <div className="my-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-500">Our Calendar</h2>
            <div className="h-[600px] w-full overflow-hidden rounded-lg shadow-lg">
              <iframe
                src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Asia%2FTaipei&showPrint=0&src=Z3BxNGdoYWZvYTA1YTFjaWc3ZzVrazhhbGtAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&color=%23D50000"
                style={{ border: 'solid 1px #777' }}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                title="WIDM Lab Calendar"
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
            </div>
        </div>  
        <hr style={{paddingBottom: '20px'}}></hr>
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold mb-3 text-gray-800 dark:text-gray-500">{siteMetadata.labName}</h1>
            <h2 className="text-2xl font-semibold mt-5 mb-2 text-gray-700 dark:text-gray-500">位置</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-500">{siteMetadata.address}</p>

            <h2 className="text-2xl font-semibold mt-5 mb-2 text-gray-700 dark:text-gray-500">聯絡方式</h2>
            <p className="text-xl text-gray-600 dark:text-gray-500">{siteMetadata.contactNumber}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .fade-enter {
          opacity: 0;
        }
        .fade-enter-active {
          opacity: 1;
          transition: opacity 300ms;
        }
        .fade-exit {
          opacity: 1;
        }
        .fade-exit-active {
          opacity: 0;
          transition: opacity 300ms;
        }
      `}</style>
    </>
  );
}
export async function getStaticProps() {
  try {
    // 同時發送兩個請求
    const [newsResponse, activityResponse] = await Promise.all([
      defaultHttp.get(processDataRoutes.news, { timeout: 10000 }),
      defaultHttp.get(processDataRoutes.activity, { timeout: 10000 })
    ]);

    // 處理新聞數據
    const newsWithId = newsResponse.data.response.map((news, index) => ({
      ...news,
      uniqueId: `${news.id}-${index}`,
    }));
    const activates = activityResponse.data.response;

    // 根據數據量決定要顯示的數量
    const topNews = newsWithId.length >= 3 
      ? newsWithId.slice(0, 3)  // 如果有3筆或以上，顯示前3筆
      : newsWithId.slice(0, newsWithId.length); // 顯示所有現有的

    const topActivities = activates.length >= 3 
      ? activates.slice(0, 3)  // 如果有3筆或以上，顯示前3筆
      : activates.slice(0, activates.length); // 顯示所有現有的
    return {
      props: {
        news: topNews,
        activities: topActivities,
        timeoutError: false,
      },
      revalidate: 60,
    };

  } catch (error) {
    const isTimeout = error.code === 'ECONNABORTED';

    return {
      props: {
        news: [],
        activities: [],
        timeoutError: isTimeout,
      },
      revalidate: 60,
    };
  }
}

