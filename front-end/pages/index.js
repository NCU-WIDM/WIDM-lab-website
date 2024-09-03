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

export default function Home() {
  const [messages, setMessages] = useState([]);
  const nodeRef = useRef(null);
  const messagesEndRef = useRef(null);

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

  const handleSubmitMessage = async (current_text) => {
    
    const timestamp = new Date().toLocaleString(); // 獲取當前時間
    const newMessage = { sender: 'user', text: current_text };
    const timeMessage = { sender: 'time', text: timestamp };
    const tempMessage = { sender: 'api', text: 'loading' }; // 等待回應的符號...
    const updatedMessages = [...messages, timeMessage, newMessage, tempMessage];
    if (updatedMessages.length > 15) {
      updatedMessages.shift();
      updatedMessages.shift(); // 移除最舊的訊息
    }

    setMessages(updatedMessages);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages)); // 更新 localStorage
    eventBus.emit('refreshMessages'); // 通知其他對話框刷新消息
    // - Response
    const response = await defaultHttp.get(`${processDataRoutes.retrieval}/query`, {
      params: {
        query_string: current_text,
        person_id: "1"
      }
    });
    const responseMessage = { sender: 'api', text: response.data.response.answer };
    const finalMessages = [...updatedMessages.slice(0, -1), responseMessage]; // 排除回覆符號，在新增回覆訊息

    if (finalMessages.length > 15) {
      finalMessages.shift(); // 移除最舊的訊息
    }
    setMessages(finalMessages || []);
    localStorage.setItem('chatMessages', JSON.stringify(finalMessages)); // 更新 localStorage
    eventBus.emit('refreshMessages'); // 通知其他對話框刷新消息
  };

  function AutoResizeTextarea() {
    const [text, setText] = useState("");
    const [textareaHeight, setTextareaHeight] = useState('6rem');
    const [isComposing, setIsComposing] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
      textareaRef.current.style.height = "inherit";
      const newHeight = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.style.height = newHeight;
      setTextareaHeight(newHeight);
    }, [text]);

    const handleSubmit = () => {
      handleSubmitMessage(text);
      setText("");
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && !event.shiftKey && !isComposing) {
        event.preventDefault();
        handleSubmit();
      }
    };

    const handleComposition = (event) => {
      if (event.type === 'compositionstart') {
        setIsComposing(true);
      }
      if (event.type === 'compositionend') {
        setIsComposing(false);
      }
    };

    return (
      <div className="flex items-stretch space-x-2">
        <textarea
          ref={textareaRef}
          className="bg-gray-100 dark:bg-black border border-gray-300 rounded-l-md flex-1 py-4 px-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="輸入消息..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleComposition}
          onCompositionEnd={handleComposition}
          style={{ minHeight: '3rem', maxHeight: '24rem' }}
        />
        <button
          className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-r-md"
          onClick={handleSubmit}
          type="button"
          style={{
            height: textareaHeight,
            opacity: 0.7,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'opacity 0.3s ease, box-shadow 1s ease'
          }}
        >
          <IoMdReturnLeft className="text-xl"/>
        </button>
      </div>
    );
  }

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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:flex-row item-center">
          
          <div className="col-span-1 flex items-center justify-center">
            <div className="grid grid-cols-1 grid-rows-3 gap-8 py-12">
              <div className="my-2 grid items-start gap-8">
                <div className="group relative">
                  <div className="animate-tilt absolute -inset-0.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 opacity-50 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
                  <Link href="/projects">
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
                  <Link href="https://calendar.google.com/calendar/u/3/embed?color=%23668CD9&color=%23D96666&color=%23E0C240&src=g.ncu.edu.tw_q7ilmj1v5cd4agv6p1a4j0kn60@group.calendar.google.com&src=gpq4ghafoa05a1cig7g5kk8alk@group.calendar.google.com&src=rj4ap5ceilcs5cmhro5g3vaslc@group.calendar.google.com&csspa=1" newTab={true}>
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
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        <span className="pr-6 text-gray-900 dark:text-gray-100">
                          Our Schedule!&nbsp;&nbsp;&nbsp;
                        </span                      >
                      </span>
                      <span className="pl-6 text-primary-400 transition duration-200 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                        Check&nbsp;&rarr;
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 xl:col-span-2 content-center">
            <div ref={nodeRef} className="mb-6 w-full max-w-full overflow-y-auto max-h-96 bg-white dark:bg-black p-4 rounded-md custom-scrollbar">
              {messages.length === 0 ? (
                <p className="prose pt-5 text-lg text-gray-600 dark:text-gray-300">
                  {`Welcome to ${siteMetadata.description}. `}
                  在這裏，你有什麼想知道的嗎？ 
                </p>
              ) : (
                messages.map((msg, index) => (
                  <div key={index}>
                    <div className={`flex ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'api' ? 'justify-start' : ''}`}>
                    <div
                      className={`inline-block p-2 my-2 rounded-md ${msg.sender === 'user' ? 'bg-blue-100/70 dark:bg-gradient-to-r dark:from-pink-600 dark:to-purple-600 text-left' :  msg.sender === 'api' ? 'bg-gray-100/70 dark:bg-gradient-to-r dark:from-green-600 dark:to-blue-600 text-left' : ''}`}
                      style={{ maxWidth: '80%', wordBreak: 'break-word' }}
                    >
                        {msg.sender !== 'time' && (
                          <p className="text-gray-800 dark:text-gray-100">
                            {msg.text === 'loading' ? <Icon icon="svg-spinners:3-dots-bounce" style={{'color': 'black'}} /> : msg.text}
                          </p>
                        )}
                      </div>
                    </div>
                    {msg.sender === 'time' && (
                      <div className="flex justify-center">
                        <p className="text-xs text-gray-500 mb-1">{msg.text}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

        </div>

        <div className="hidden mb-2 pt-2 text-lg leading-6 text-slate-600 dark:text-slate-300 md:block">
          你可以透過下面的 {' '} 
          <RoughNotation
            animate="true"
            type="highlight"
            show={true}
            color="#DE1D8D"
            animationDelay={1000}
            animationDuration={2500}
            className="text-slate-200"
          >
            對話框&nbsp;
          </RoughNotation>
          問我任何你想知道關於 WIDM 實驗室的事情！
        </div>
        <AutoResizeTextarea />

        <hr className="border-gray-200 dark:border-gray-700 pb-5 mt-5" />
        <div>
          <h1 className='text-3xl font-extrabold mb-3 text-gray-800 dark:text-gray-500'>{siteMetadata.labName}</h1>
          <h2 className='text-2xl font-semibold mt-5 mb-2 text-gray-700 dark:text-gray-500'>位置</h2>
          <p className='mb-4 text-gray-600 dark:text-gray-500'>{siteMetadata.address}</p>

          <h2 className='text-2xl font-semibold mt-5 mb-2 text-gray-700 dark:text-gray-500'>聯絡方式</h2>
          <p className='text-xl text-gray-600 dark:text-gray-500'>{siteMetadata.contactNumber}</p>
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
