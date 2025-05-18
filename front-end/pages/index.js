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
  const leftRef = useRef(null);
  const rightRef = useRef(null);

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

  useEffect(() => {
    function syncHeight() {
      if (leftRef.current && rightRef.current) {
        rightRef.current.style.minHeight = leftRef.current.offsetHeight + 'px';
      }
    }
    syncHeight();
    window.addEventListener('resize', syncHeight);
    return () => window.removeEventListener('resize', syncHeight);
  }, []);

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
        <div className="flex flex-col md:flex-row gap-4 mt-3 items-stretch">
          {/* LAB INFO */}
          <div className="w-full md:w-2/3">
            <h1 className="pb-2 text-2xl font-bold leading-8 tracking-tight text-gray-900 dark:text-gray-100 sm:text-xl sm:leading-7 md:text-2xl md:leading-8">
              Hello, Here's &nbsp;
              <span className="text-primary-color-500 dark:text-primary-color-dark-500">WIDM</span>
            </h1>
            <div className="w-full mb-4" ref={leftRef}>
              <RoughNotation
                type="box"
                show={true}
                color="#FF0000"
                animationDelay={300}
                animationDuration={3000}
                padding={8}
                strokeWidth={1}
              >
                <p className="text-base leading-relaxed">{labinfo}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Tag text={'#Natural Language Processing'} />
                  <Tag text={'#Machine Learning'} />
                  <Tag text={'#Data Mining'} />
                  <Tag text={'#Conversational Agents'} />
                  <Tag text={'#knowledge graphs'} />
                </div>
              </RoughNotation>
            </div>
          </div>
          {/* NEWS */}
          <div className="w-full md:w-1/3">
            <h1 className="pb-2 text-2xl font-bold leading-8 tracking-tight text-gray-900 dark:text-gray-100 sm:text-xl sm:leading-7 md:text-2xl md:leading-8">
              News
            </h1>
            <div
              className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 flex flex-col"
              ref={rightRef}
            >
              <div className="flex-1 space-y-0.5">
                {news && news.length > 0 ? (
                  news.map((item) => {
                    const [isTextTruncated, setIsTextTruncated] = useState(false);
                    const textRef = useRef(null);

                    useEffect(() => {
                      const checkTruncation = () => {
                        if (textRef.current) {
                          const isTruncated = textRef.current.scrollWidth > textRef.current.clientWidth;
                          setIsTextTruncated(isTruncated);
                        }
                      };

                      checkTruncation();
                      window.addEventListener('resize', checkTruncation);

                      return () => {
                        window.removeEventListener('resize', checkTruncation);
                      };
                    }, [item.title, item.sub_title]);

                    return (
                      <Link href={`/news/${item.id}`} key={item.uniqueId}>
                        <div className="group cursor-pointer border-b border-gray-200 dark:border-gray-700 pb-0.5">
                          <div className="overflow-hidden">
                            <span 
                              ref={textRef}
                              className={`block whitespace-nowrap transition-all duration-600 ease-in-out
                                ${isTextTruncated ? 'overflow-hidden text-ellipsis group-hover:overflow-visible group-hover:animate-scrolling' : ''}`}
                            >
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {item.title}
                              </span>
                              {item.sub_title && (
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  : {item.sub_title}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    No news available
                  </div>
                )}
              </div>
              <div className="mt-2 text-right">
                <Link
                  href="/news"
                  className="text-sm text-primary-color-500 dark:text-primary-color-dark-500 hover:underline"
                >
                  More →
                </Link>
              </div>
            </div>
          </div>
        </div>
         
        <hr className="my-3"></hr>
        {/* Prospective Students */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold leading-8 tracking-tight text-gray-900 dark:text-gray-100 sm:text-xl sm:leading-7 md:text-2xl md:leading-8 mb-2">
            Prospective Students
          </h1>
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="prose dark:prose-dark max-w-none">
              <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
                We are looking for motivated students who are interested in:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                <li>Web Intelligence and Data Mining</li>
                <li>Natural Language Processing</li>
                <li>Machine Learning and Deep Learning</li>
                <li>Knowledge Graphs and Semantic Web</li>
                <li>Conversational AI and Chatbots</li>
              </ul>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                If you are interested in joining our lab, please contact Professor for more information.
              </p>
            </div>
          </div>
        </div>
        
        <hr className="my-3"></hr>
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-500">{siteMetadata.labName}</h1>
            <h2 className="text-lg font-semibold mt-3 mb-1 text-gray-700 dark:text-gray-500">位置</h2>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-500">{siteMetadata.address}</p>

            <h2 className="text-lg font-semibold mt-3 mb-1 text-gray-700 dark:text-gray-500">聯絡方式</h2>
            <p className="text-base text-gray-600 dark:text-gray-500">{siteMetadata.contactNumber}</p>
          </div>
          <div className="flex-1">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3616.9695183580543!2d121.18513762950894!3d24.96715169153035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x346823ec9d6d4167%3A0xf1c9f93ab06af735!2z5ZyL56uL5Lit5aSu5aSn5a24IOW3peeoi-S6lOmkqA!5e0!3m2!1szh-TW!2stw!4v1729840297941!5m2!1szh-TW!2stw"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
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
// get news data
export async function getStaticProps() {
  try {

    const [newsResponse, activityResponse] = await Promise.all([
      defaultHttp.get(processDataRoutes.news, { timeout: 10000 }),
      defaultHttp.get(processDataRoutes.activity, { timeout: 10000 })
    ]);

    const newsWithId = newsResponse.data.response.map((news, index) => ({
      ...news,
      uniqueId: `${news.id}-${index}`,
    }));
    const activities = activityResponse.data.response;


    const topNews = newsWithId.length >= 10 
      ? newsWithId.slice(0, 10)  
      : newsWithId.slice(0, newsWithId.length); 

    const topActivities = activities.length >= 3 
      ? activities.slice(0, 8)  
      : activities.slice(0, activities.length); 
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

