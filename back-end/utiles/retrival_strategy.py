# -*- coding: utf-8 -*-
"""
檢索策略模組
支持兩種檢索模式：原方法、知識圖譜方法
"""

import logging
import json
from typing import List, Dict, Any, Tuple, Optional
from .kg_retrival import KnowledgeGraphRetrieval
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferWindowMemory
from langchain.chains import ConversationalRetrievalChain
import threading
from datetime import datetime
from . import prompt

class UnifiedMemoryManager:
    """統一的記憶管理器"""
    
    def __init__(self, llm, memory_window=5, inactive_time=600):
        self.llm = llm
        self.memory_window = memory_window
        self.inactive_time = inactive_time
        self.user_memories = {}
        self.last_activity = {}
        self.lock = threading.Lock()

    def get_memory(self, user_id: str, mode: str):
        """獲取用戶在特定模式的記憶"""
        with self.lock:
            if user_id not in self.user_memories:
                self.user_memories[user_id] = {}
            
            if mode not in self.user_memories[user_id]:
                memory = ConversationBufferWindowMemory(
                    memory_key="chat_history",
                    k=self.memory_window,
                    return_messages=True,
                    output_key='answer'
                )
                self.user_memories[user_id][mode] = memory
            
            self.last_activity[user_id] = datetime.now()
            return self.user_memories[user_id][mode]

    def clean_inactive_memories(self):
        """清理不活躍的記憶"""
        with self.lock:
            current_time = datetime.now()
            inactive_users = [
                user_id for user_id, last_active in self.last_activity.items()
                if (current_time - last_active).total_seconds() > self.inactive_time
            ]
            for user_id in inactive_users:
                del self.user_memories[user_id]
                del self.last_activity[user_id]
            return len(inactive_users)

class QueryClassifier:
    """查詢分類器"""
    
    def __init__(self, llm):
        self.llm = llm
    
    def classify_query(self, question: str) -> str:
        """決定查詢類型"""
        prompt_template = PromptTemplate(
            input_variables=["original_query"],
            template=prompt.decide_query_type
        )
        chain = LLMChain(llm=self.llm, prompt=prompt_template)
        result = chain.run(original_query=question).strip().lower()
        print(f"決定查詢類型: {result}", flush=True)
        return result  # 'conversation' or 'retrieval'

class IntentClassifier:
    """意圖分類器"""
    
    def __init__(self, llm):
        self.llm = llm
    
    def classify_intent(self, question: str):
        """分類意圖"""
        print('start classify', flush=True)
        optimize_template = PromptTemplate(
            input_variables=["original_query"],
            template=prompt.classify_intent
        )
        
        optimization_chain = LLMChain(
            llm=self.llm,
            prompt=optimize_template
        )
        
        try:
            optimized_query = optimization_chain.run(original_query=question)
            print(f"原始優化結果: {optimized_query}", flush=True)
            
            try:
                intent_list = json.loads(optimized_query.strip())
                
                if not all(isinstance(x, int) and x in [1, 2, 3] for x in intent_list):
                    print(f"警告：分類結果包含無效值 {intent_list}，使用預設值", flush=True)
                    intent_list = [3]
                    
                result = {
                    'original': question,
                    'intent': intent_list
                }
                
                print("\n查詢優化結果:", flush=True)
                print(f"原始查詢: {result['original']}", flush=True)
                print(f"分類結果: {result['intent']}", flush=True)
                
                return result
                
            except json.JSONDecodeError as e:
                print(f"錯誤：優化結果不是有效的 JSON 格式: {e}", flush=True)
                return {
                    'original': question,
                    'intent': [3]
                }
                
        except Exception as e:
            error_result = {
                'original': question,
                'intent': None,
                'error': str(e)
            }
            print(f"\n查詢優化失敗: {str(e)}", flush=True)
            return error_result

class QueryEnhancer:
    """問題增強器"""
    
    def __init__(self, llm):
        self.llm = llm
    
    def enhance_question(self, question: str, intent: str):
        """增強問題"""
        print('start enhance', flush=True)
        if intent == 'paper':
            prompt_template = prompt.enhance_paper
        elif intent == 'project':
            prompt_template = prompt.enhance_project
        else:
            prompt_template = prompt.enhance_other
        
        optimize_template = PromptTemplate(
            input_variables=["original_query"],
            template=prompt_template
        )
        
        optimization_chain = LLMChain(
            llm=self.llm,
            prompt=optimize_template
        )
        
        try:
            optimized_query = optimization_chain.run(original_query=question)
            print(f"問題增強結果: {optimized_query.strip()}", flush=True)
            
            result = {
                'original': question,
                'optimized': optimized_query.strip()
            }
            
            return result
        except Exception as e:
            print(f"問題增強失敗: {str(e)}", flush=True)
            return {
                'original': question,
                'optimized': question,
                'error': str(e)
            }

class RetrievalStrategy:
    """檢索策略類別"""
    
    def __init__(self, mode='original', kg_retrieval=None, vectorstores=None, llm=None):
        """
        初始化檢索策略
        
        Args:
            mode: 檢索模式 ('original', 'knowledge_graph')
            kg_retrieval: 知識圖譜檢索實例
            vectorstores: 向量存儲字典
            llm: 語言模型
        """
        self.mode = mode
        self.kg_retrieval = kg_retrieval
        self.vectorstores = vectorstores or {}
        self.llm = llm
        
        # 初始化各個組件
        self.memory_manager = UnifiedMemoryManager(llm)
        self.query_classifier = QueryClassifier(llm)
        self.intent_classifier = IntentClassifier(llm)
        self.query_enhancer = QueryEnhancer(llm)
        
        # 檢索模式配置
        self.retrieval_modes = {
            'original': '原方法 - 網頁爬蟲 + 向量檢索',
            'knowledge_graph': '知識圖譜方法 - 結構化知識檢索'
        }
        
        logging.info(f"初始化檢索策略，模式: {self.mode}")

    def chat_with_rag(self, user_id: str, question: str, mode=None):
        """
        聊天檢索增強生成
        
        Args:
            user_id: 用戶ID
            question: 問題
            mode: 檢索模式 ('original', 'knowledge_graph')
        """
        # 如果沒有指定模式，使用當前模式
        if mode is None:
            mode = self.mode
        
        # 設置模式
        self.set_mode(mode)
        
        # 執行搜尋
        return self.search(question, user_id)

    def search(self, query: str, user_id: str) -> Tuple[str, List[str]]:
        """
        執行檢索
        
        Args:
            query: 查詢字串
            user_id: 用戶ID
            
        Returns:
            Tuple[回答, 來源列表]
        """
        # 查詢分類
        query_type = self.query_classifier.classify_query(query)
        
        if query_type == 'conversation':
            return self._handle_conversation(query, user_id), []
        else:
            return self._handle_retrieval(query, user_id)

    def _handle_conversation(self, query: str, user_id: str) -> str:
        """處理對話"""
        memory = self.memory_manager.get_memory(user_id, self.mode)
        
        prompt_template = PromptTemplate(
            input_variables=["question", "chat_history"],
            template=prompt.generate_conversation
        )
        
        conversation_chain = LLMChain(
            llm=self.llm,
            prompt=prompt_template,
            memory=memory,
            output_key='answer'
        )
        
        result = conversation_chain.run(question=query)
        return result

    def _handle_retrieval(self, query: str, user_id: str) -> Tuple[str, List[str]]:
        """處理檢索"""
        if self.mode == 'original':
            return self._original_search(query, user_id)
        elif self.mode == 'knowledge_graph':
            answer = self._kg_search(query, user_id)
            return answer, []  # 知識圖譜模式不返回來源
        else:
            logging.warning(f"未知的檢索模式: {self.mode}，使用原方法")
            return self._original_search(query, user_id)

    def _original_search(self, query: str, user_id: str) -> Tuple[str, List[str]]:
        """原方法檢索"""
        intents = self.intent_classifier.classify_intent(query)
        
        if intents is None or intents.get('intent') is None:
            print("警告：意圖分類失敗，使用預設分類", flush=True)
            intents = {
                'original': query,
                'intent': [3]
            }
        
        retrieve_result = ''
        all_sources = []
        
        for intent in intents['intent']:
            if intent == 1:
                enhance_result = self.query_enhancer.enhance_question(query, 'paper')
                retriever = self.vectorstores['paper'].as_retriever(search_kwargs={"k": 8})
                retrieve_result += '參考paper所得到結果：\n'
            elif intent == 2:
                enhance_result = self.query_enhancer.enhance_question(query, 'project')
                retriever = self.vectorstores['project'].as_retriever(search_kwargs={"k": 8})
                retrieve_result += '參考project所得到結果：\n'
            else:
                enhance_result = self.query_enhancer.enhance_question(query, 'other')
                retriever = self.vectorstores['other'].as_retriever(search_kwargs={"k": 8})
                retrieve_result += '參考other所得到結果：\n'
                
            optimized_question = enhance_result['optimized']
            
            docs = retriever.get_relevant_documents(optimized_question)
            current_sources = [doc.metadata['source'] for doc in docs]
            all_sources.extend(current_sources)
            
            context = "\n".join([doc.page_content for doc in docs])
            retrieve_result += f"相關資訊：{context}\n參考來源：{current_sources}\n\n"
        
        memory = self.memory_manager.get_memory(user_id, self.mode)
        
        full_input = f"question：{query}\ncontext：{context}"
        
        prompt_template = PromptTemplate(
            input_variables=["full_input", "chat_history"],
            template=prompt.generate_result
        )
        
        retrieval_chain = LLMChain(
            llm=self.llm,
            prompt=prompt_template,
            memory=memory,
            output_key='answer'
        )
        
        result = retrieval_chain.run(full_input=full_input)
        
        try:
            result = result.strip()
            if result.startswith('{') and result.endswith('}'):
                response_json = json.loads(result.replace('`','').replace('json',''))
                
                unique_sources = []
                [unique_sources.append(x) for x in response_json['sources'] if x not in unique_sources]
                
                self._log_retrieval(query, intents['intent'], retrieve_result, response_json['answer'], unique_sources)
                return response_json['answer'], unique_sources
            else:
                self._log_retrieval(query, intents['intent'], retrieve_result, result, all_sources)
                return result, all_sources
                
        except json.JSONDecodeError:
            fallback_response = {
                "answer": result,
                "sources": all_sources
            }
            
            self._log_retrieval(query, intents['intent'], retrieve_result, fallback_response['answer'], fallback_response['sources'])
            return fallback_response['answer'], fallback_response['sources']

    def _kg_search(self, query: str, user_id: str) -> str:
        """知識圖譜方法檢索"""
        try:
            if not self.kg_retrieval:
                return "知識圖譜檢索系統未初始化"
            
            logging.info("使用知識圖譜方法檢索")
            
            kg_results = self.kg_retrieval.search_knowledge_graph(query, top_n=20)
            
            if not kg_results:
                return "抱歉，我在知識圖譜中沒有找到相關的資訊。請嘗試用不同的方式描述您的問題，或者詢問其他相關的資訊。"
            
            answer = self._generate_kg_answer_with_memory(query, kg_results, user_id)
            return answer
            
        except Exception as e:
            print(f"知識圖譜檢索失敗: {e}", flush=True)
            return f"檢索錯誤，請聯繫管理員!!!"

    def _generate_kg_answer_with_memory(self, query: str, kg_results: List[Dict], user_id: str) -> str:
        """使用 GPT 生成知識圖譜回答（帶記憶功能）"""
        if not kg_results:
            return "抱歉，我沒有找到相關的資訊。"
        
        print(f"這是交給GPT的query: {query}", flush=True)
        print(f"這是交給GPT的kg_results: {kg_results}", flush=True)
        
        memory = self.memory_manager.get_memory(user_id, self.mode)
        
        prompt_template = PromptTemplate(
            input_variables=["chat_history", "full_input"],
            template=prompt.kg_retrieval_prompt
        )
        
        chain = LLMChain(
            llm=self.llm, 
            prompt=prompt_template,
            memory=memory,
            output_key='answer'
        )
        
        full_input = f"用戶問題: {query}\n搜尋結果: {str(kg_results)}"
        response = chain.run(full_input=full_input)
        
        return response.strip()

    def _log_retrieval(self, query, intents, retrieve_result, response, sources):
        """記錄檢索日誌"""
        # 簡化的日誌記錄，可以根據需要擴展
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "query": query,
            "intents": intents,
            "retrieve_result": retrieve_result,
            "response": response,
            "sources": sources
        }
        print(f"檢索日誌: {log_entry}", flush=True)

    def set_mode(self, mode: str):
        """設置檢索模式"""
        if mode in self.retrieval_modes:
            self.mode = mode
            logging.info(f"檢索模式已切換為: {mode}")
        else:
            logging.warning(f"無效的檢索模式: {mode}")

    def get_available_modes(self) -> Dict[str, str]:
        """獲取可用的檢索模式"""
        return self.retrieval_modes.copy()

    def get_current_mode(self) -> str:
        """獲取當前檢索模式"""
        return self.mode