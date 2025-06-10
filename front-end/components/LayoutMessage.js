import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useRef, useEffect, useInsertionEffect } from 'react';
import { BiMessageDetail } from "react-icons/bi";
import { IoMdReturnLeft } from "react-icons/io";
import { motion } from 'framer-motion';
import eventBus from '../utils/eventBus'; // 引入事件總線
import { defaultHttp } from 'utils/http'
import { processDataRoutes } from 'routes/api'
import { marked } from 'marked';
import { Icon } from '@iconify/react'

// FAQ資料結構
const faqData = [
  {
    question: "WIDM實驗室主要研究什麼？",
    answer: "WIDM實驗室主要研究網頁智能與資料探勘，包括自然語言處理、機器學習、深度學習、知識圖譜和對話式AI等領域。"
  },
  {
    question: "如何加入WIDM實驗室？",
    answer: "如果您對我們的研究領域感興趣，可以透過以下方式加入：\n1. 直接聯繫教授\n2. 參加實驗室的說明會\n3. 透過學校的招生管道申請"
  },
  {
    question: "實驗室提供哪些資源？",
    answer: "實驗室提供豐富的研究資源，包括：\n1. 高性能計算設備\n2. 研究資料集\n3. 學術交流機會\n4. 產業合作機會"
  },
  {
    question: "實驗室的研究生需要具備什麼條件？",
    answer: "我們期望研究生具備：\n1. 扎實的程式設計能力\n2. 良好的數學基礎\n3. 對AI和資料科學的熱情\n4. 良好的英文能力"
  },
  {
    question: "WIDM實驗室申請流程與注意事項？",
    answer: `請仔細閱讀WIDM LAB的研究領域與近期發表論文，確保您的研究方向與本實驗室一致。請將個人履歷（CV）、成績單與簡短研究計畫寄給張教授（<a href=\"mailto:chiahui@g.ncu.edu.tw\" class=\"text-blue-600 underline\">chiahui@g.ncu.edu.tw</a>），以安排面談。曾修習張教授課程者將優先考慮。`
  }
];

export default function LayoutMessage() {
  const [messages, setMessages] = useState([]);
  const nodeRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Failed to parse chatMessages from localStorage', e);
      }
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
    if (isOpen) {
      setTimeout(scrollToBottom, 100); // 延遲滾動操作，確保元素渲染完成
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleIcon = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmitMessage = async (current_text) => {
    const timestamp = new Date().toLocaleString(); // 獲取當前時間
    const newMessage = { sender: 'user', text: current_text };
    const timeMessage = { sender: 'time', text: timestamp };
    const updatedMessages = [...messages, timeMessage, newMessage];
    if (updatedMessages.length > 15) {
      updatedMessages.shift();
      updatedMessages.shift(); // 移除最舊的訊息
    }
    setMessages(updatedMessages);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages)); // 更新 localStorage
    eventBus.emit('refreshMessages'); // 通知其他對話框刷新消息

    setIsLoading(true);
    try {
      const response = await defaultHttp.get(`${processDataRoutes.retrieval}/query`, {
        params: {
          query_string: current_text,
          person_id: "1"
        }
      });
      const responseMessage = { sender: 'api', text: response.data.response.answer };
      const responseSourceLink = response.data.response.source_list;
      const linksource = Array.isArray(responseSourceLink) && responseSourceLink.length > 0
        ? responseSourceLink
            .map((link, index) => {
              const isLastLink = index === responseSourceLink.length - 1;
              return `<a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a>${isLastLink ? '' : '<br>'}`;
            })
            .join('')
        : '';
      const combinedMessage = {
        sender: 'api',
        text: linksource ? `${marked(responseMessage.text)}<br>${linksource}` : responseMessage.text,
      };
      const finalMessages = [
        ...updatedMessages,
        combinedMessage,
      ];

      if (finalMessages.length > 15) {
        finalMessages.shift();
      }
      setMessages(finalMessages || []);
      localStorage.setItem('chatMessages', JSON.stringify(finalMessages));
      eventBus.emit('refreshMessages');
    } catch (error) {
      console.error('Error fetching response:', error);
      const errorMessage = {
        sender: 'api',
        text: '抱歉，我現在無法回應。請稍後再試。',
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      localStorage.setItem('chatMessages', JSON.stringify(finalMessages));
    } finally {
      setIsLoading(false);
    }
  };

  const [text, setText] = useState("");
  const [textareaHeight, setTextareaHeight] = useState('6rem');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      const newHeight = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.style.height = newHeight;
      setTextareaHeight(newHeight);
    }
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
  
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(true);
  useEffect(() => {
    if (showWelcomeBubble) {
      const timer = setTimeout(() => setShowWelcomeBubble(false), 60000);
      return () => clearTimeout(timer);
    }
  }, [showWelcomeBubble]);

  const handleFAQQuestionClick = (question, answer) => {
    const timestamp = new Date().toLocaleString();
    const timeMessage = { sender: 'time', text: timestamp };
    const userMessage = { sender: 'user', text: question };
    const apiMessage = { sender: 'api', text: answer };
    const newMessages = [...messages, timeMessage, userMessage, apiMessage];
    if (newMessages.length > 15) {
      newMessages.shift();
      newMessages.shift();
    }
    setMessages(newMessages);
    localStorage.setItem('chatMessages', JSON.stringify(newMessages));
    eventBus.emit('refreshMessages');
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50">
      <div className="relative">
        {showWelcomeBubble && (
          <div className="absolute right-0 bottom-12">
            <div className="z-10 bg-white text-gray-700 px-8 py-2 rounded-2xl shadow-lg max-w-xs border border-gray-300 dark:border-gray-700">
              <div className="z-0 absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45 shadow-md border-r border-b border-gray-300 dark:border-gray-700"></div>
              <span className="block whitespace-nowrap">有任何問題隨時找我！</span>
            </div>
          </div>
        )}
        <motion.button
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-pink-500 p-2 ring-pink-600 transition-all duration-200 ease-in-out hover:bg-pink-600 hover:ring-2 dark:bg-pink-600 dark:ring-white dark:hover:bg-pink-700"
          type="button"
          aria-label="Message button"
          animate={{
            rotate: isOpen ? 360 : 0,
          }}
          transition={{ duration: 0.1, ease: 'easeIn' }}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
            setShowWelcomeBubble(false);
          }}
        >
          <BiMessageDetail className="text-white text-2xl" />
        </motion.button>
      </div>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog onClose={() => {setIsOpen(false);}} className="fixed inset-0 z-50 flex items-center justify-center sm:items-end sm:justify-end">
          <Transition.Child
            enter="duration-300 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="duration-200 ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black/30" />
          </Transition.Child>
          <Transition.Child
            enter="duration-300 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="relative w-full max-w-[400px] sm:w-[400px] h-[80vh] mx-auto sm:mr-20 mb-8 overflow-hidden rounded-xl bg-zinc-200 shadow-2xl ring-1 ring-black/5 dark:bg-zinc-800">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-2 bg-white border-b border-gray-300 dark:bg-black dark:border-gray-700">
                  <h2 className="text-xl font-bold w-full text-center">WIDM Web Assistant</h2>
                </div>
                <div ref={nodeRef} className="flex-1 w-full overflow-y-auto bg-white dark:bg-black p-4 rounded-md custom-scrollbar">
                  {messages.length === 0 ? (
                    <p className="prose pt-5 text-lg text-gray-600 dark:text-gray-300">
                      歡迎來到聊天窗口，有什麼我可以幫助你的嗎？
                    </p>
                  ) : (
                    messages.map((msg, index) => (
                      <div key={index}>
                        <div className={`flex ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'api' ? 'justify-start' : 'justify-center'}`}>
                          <div
                            className={`inline-block p-2 my-2 rounded-md ${msg.sender === 'user' ? 'bg-blue-100 dark:bg-gradient-to-r dark:from-blue-500 dark:to-purple-600 text-left' :  msg.sender === 'api' ? 'bg-gray-100 dark:bg-gradient-to-r dark:from-green-500 dark:to-blue-600 text-left' : ''}`}
                            style={{ maxWidth: '80%', wordBreak: 'break-word' }}
                          >
                            {msg.sender !== 'time' && (
                              <p className="text-gray-800 dark:text-gray-100">
                                {msg.text === 'loading' ? <Icon icon="svg-spinners:3-dots-bounce" style={{'color': 'black'}} /> : <span dangerouslySetInnerHTML={{ __html: msg.text }} />}
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
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="inline-block p-2 my-2 rounded-md bg-gray-100 dark:bg-gradient-to-r dark:from-green-500 dark:to-blue-600 text-left">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-100 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-blue-100 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-blue-100 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                {/* 訊息輸入區 */}
                <div className="flex items-stretch space-x-1 mb-1 py-1 px-1 bg-gray-200 dark:bg-gray-900 relative">
                  <button
                    onClick={() => setShowFAQ(!showFAQ)}
                    className="flex items-center justify-center px-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <input
                    ref={textareaRef}
                    type="text"
                    className="dark:bg-black border border-gray-300 dark:border-gray-700 rounded-l-md flex-1 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="輸入消息..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onCompositionStart={handleComposition}
                    onCompositionEnd={handleComposition}
                    style={{ minHeight: '2.5rem', maxHeight: '2.5rem' }}
                  />
                  <button
                    className="flex items-center justify-center bg-gray-500 dark:bg-gray-300 text-white dark:text-black font-bold py-2 px-4 rounded-r-md"
                    onClick={handleSubmit}
                    type="button"
                    style={{
                      height: '2.5rem',
                      transition: 'opacity 0.3s ease, box-shadow 1s ease'
                    }}
                  >
                    <IoMdReturnLeft className="text-xl"/>
                  </button>

                  {/* FAQ列表 */}
                  {showFAQ && (
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="max-h-48 overflow-y-auto p-2">
                        {faqData.map((faq, idx) => (
                          <button
                            key={idx}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-150"
                            onClick={() => {
                              handleFAQQuestionClick(faq.question, faq.answer);
                              setShowFAQ(false);
                            }}
                          >
                            {faq.question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
