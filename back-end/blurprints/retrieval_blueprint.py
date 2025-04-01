import os
import time
import requests
import threading
from queue import Queue
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import pdfplumber
from pathlib import Path
from io import BytesIO
from . import paper_blueprint
from google.api.resource_pb2 import resource
import json
from config import Config

from fastapi.openapi.models import APIKey
from langchain_openai import ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain.chains import ConversationalRetrievalChain
from langchain_community.embeddings import OpenAIEmbeddings
from langchain.memory import ConversationBufferWindowMemory
from concurrent.futures import ThreadPoolExecutor, as_completed
from langchain_community.document_loaders import AsyncHtmlLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_transformers import MarkdownifyTransformer
from langchain.schema import Document
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# from langchain_core.runnables import RunnablePassthrough


from flask import Blueprint, request, stream_with_context, current_app
from flask import Response as FlaskResponse
from models.responses import Response
retrieval_blueprint = Blueprint('retrieval', __name__)

scrapying_status = {
    'status': 'not start',
    'start_time': '',
    'end_time': ''
}
paper_status = {
    'status': 'not start',
    'start_time': '',
    'end_time': '',
    'total_documents': 0,
    'total_batches': 0,
    'current_batch': 0,
    'processed_documents': 0
}
embedding = OpenAIEmbeddings(model='text-embedding-3-small', openai_api_key=Config.OPENAI_KEY)
llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0, api_key=Config.OPENAI_KEY)


class UserMemoryManager:
    def __init__(self, retriever, llm, memory_window=5, inactive_time=36):
        self.retriever = retriever
        self.llm = llm
        self.memory_window = memory_window
        self.inactive_time = inactive_time
        self.user_memories = {}
        self.last_activity = {}
        self.lock = threading.Lock()

    def get_chain_for_user(self, user_id):
        with self.lock:
            if user_id not in self.user_memories:
                memory = ConversationBufferWindowMemory(
                    memory_key="chat_history",
                    return_messages=True,
                    output_key='answer'
                )
                self.user_memories[user_id] = memory
            else:
                memory = self.user_memories[user_id]

            self.last_activity[user_id] = datetime.now()

            return ConversationalRetrievalChain.from_llm(
                llm=self.llm,
                retriever=self.retriever,
                memory=memory,
                return_source_documents=True,
            )

    def clean_inactive_memories(self):
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


manager = None
vectorstores = {}

def process_url(url, root_url, visited_urls, html_urls, next_queue):
    if url in visited_urls:
        return

    with visited_urls_lock:
        if url in visited_urls:
            return
        visited_urls.add(url)

    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code != 200:
            return
        if 'text/html' not in resp.headers.get('Content-Type', '').lower():
            return

        with html_urls_lock:
            html_urls.append(url)

        soup = BeautifulSoup(resp.text, 'html.parser')
        all_links = [urljoin(root_url, a.get('href')) for a in soup.find_all('a')]
        all_links = filter(lambda x: x and x.startswith(root_url), all_links)

        for link in all_links:
            next_queue.put(link)

    except requests.RequestException:
        pass


def bfs_website(root_url, max_workers=20):
    visited_urls = set()
    html_urls = []
    global visited_urls_lock, html_urls_lock
    visited_urls_lock = threading.Lock()
    html_urls_lock = threading.Lock()

    queue = Queue()
    queue.put(root_url)

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        while not queue.empty():
            next_queue = Queue()
            futures = []
            for _ in range(queue.qsize()):
                url = queue.get()
                future = executor.submit(process_url, url, root_url, visited_urls, html_urls, next_queue)
                futures.append(future)
            for future in as_completed(futures):
                pass
            queue = next_queue
    return html_urls

def categorize_urls(urls):
    """將 URLs 分類為 project、paper 和 other"""
    projects = []
    papers = []
    others = []
    
    for url in urls:
        if '/project' in url:
            projects.append(url)
        elif '/papers' in url:
            papers.append(url)
        else:
            others.append(url)
            
    return projects, papers, others

def scrapying_website():
    global vectorstores
    scrapying_status['status'] = 'pending'
    scrapying_status['start_time'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    try:
        root_url = Config.HOME_PAGE_URL
        urls = bfs_website(root_url)
        
        # 將 URLs 分類
        project_urls, paper_urls, other_urls = categorize_urls(urls)
        
        # 將 URLs 與對應的 collection 配對
        url_collections = {
            'project': project_urls,
            'paper': paper_urls,
            'other': other_urls
        }
        
        # 處理每個類別的 URLs
        for collection_name, collection_urls in url_collections.items():
            if collection_urls:  # 只處理非空的 URL 列表
                loader = AsyncHtmlLoader(collection_urls)
                docs = loader.load()
                md = MarkdownifyTransformer()
                converted_docs = md.transform_documents(docs)
                text_splitter = RecursiveCharacterTextSplitter(chunk_size=1024, chunk_overlap=128)
                splits = text_splitter.split_documents(converted_docs)
                vectorstores[collection_name].add_documents(documents=splits)
                print(f"Processed {len(collection_urls)} URLs for collection: {collection_name}")
        
        # 使用 'other' collection 作為默認的檢索器
        retriever = vectorstores['other'].as_retriever()
        global manager
        manager = UserMemoryManager(retriever, llm, inactive_time=300)
        
    except Exception as e:
        print(e)
        scrapying_status['status'] = 'error'
        return

    scrapying_status['status'] = 'finished'
    scrapying_status['end_time'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
def enhance_question(question,intent):
    print('start enhance', flush=True)
    if intent == 'paper':
        prompt_template = '''你是一個專業的學術查詢優化系統，負責將使用者的查詢轉換為標準化的中文學術問句。

資料範圍：
- 學術論文資訊（中英文）
- 實驗室專案介紹
- 指導教授研究方向和專案
- 實驗室成員資訊
- 研究成果展示

處理流程：

1. 輸入檢查階段：
   - 檢查是否包含錯別字
   - 檢查專有名詞拼寫是否正確
   - 檢查英文論文標題格式是否完整
   - 如發現錯誤，先進行修正

2. 標準化處理：
   - 必須以「請問」開頭
   - 確保句尾有問號
   - 每次只處理一個主題
   - 保持句子結構完整

3. 專有名詞規範：
   - 張嘉惠老師 → 張嘉惠教授(Chia-Hui Chang)
   - 英文論文標題保持原文，加引號
   - 專業術語採用「中文(English)」格式

4. 語法檢查：
   - 確認主謂賓結構完整
   - 檢查量詞使用
   - 確認介詞使用正確
   - 避免贅字重複

我需要幫助您明確以下論文相關資訊：
1. 時間範圍（例如：特定年份、最近幾年）
2. 研究領域或主題（例如：自然語言處理(NLP)、資料探勘(Data Mining)）
3. 論文類型（期刊論文、會議論文）
4. 特定作者或合作單位
5. 其他具體條件（如：引用次數、影響因子）

輸入查詢：{original_query}

請讓我按照上述流程處理您的問題，使其符合標準化格式。如果發現輸入有誤，會先更正再進行標準化處理。最後只輸出一個完整的標準問句。

範例：
原始："找張教授的論文"
標準化："請問張嘉惠教授(Chia-Hui Chang)近期發表的學術論文有哪些？"
'''

    elif intent == 'project':
        prompt_template = '''你是一個專業的學術查詢優化系統，負責將使用者的查詢轉換為標準化的中文學術問句。

資料範圍：
- 學術論文資訊（中英文）
- 實驗室專案介紹
- 指導教授研究方向和專案
- 實驗室成員資訊
- 研究成果展示

處理流程：

1. 輸入檢查階段：
   - 檢查是否包含錯別字
   - 檢查專有名詞拼寫是否正確
   - 檢查英文論文標題格式是否完整
   - 如發現錯誤，先進行修正

2. 標準化處理：
   - 必須以「請問」開頭
   - 確保句尾有問號
   - 每次只處理一個主題
   - 保持句子結構完整

3. 專有名詞規範：
   - 張嘉惠老師 → 張嘉惠教授(Chia-Hui Chang)
   - 英文論文標題保持原文，加引號
   - 專業術語採用「中文(English)」格式

4. 語法檢查：
   - 確認主謂賓結構完整
   - 檢查量詞使用
   - 確認介詞使用正確
   - 避免贅字重複

我需要幫助您明確以下專案相關資訊：
1. 專案名稱或類型
2. 專案階段（進行中、已完成）
3. 技術重點和應用領域
4. 研究目標和預期成果
5. 具體功能或實際應用

輸入查詢：{original_query}

請讓我按照上述流程處理您的問題，使其符合標準化格式。如果發現輸入有誤，會先更正再進行標準化處理。最後只輸出一個完整的標準問句。

範例：
原始："legal ai專案進度"
標準化："請問法律人工智慧(Legal AI)專案目前的研究進展和實際應用成果為何？"
'''

    else:
        prompt_template = '''你是一個專業的學術查詢優化系統，負責將使用者的查詢轉換為標準化的中文學術問句。

資料範圍：
- 學術論文資訊（中英文）
- 實驗室專案介紹
- 指導教授研究方向和專案
- 實驗室成員資訊
- 研究成果展示

處理流程：

1. 輸入檢查階段：
   - 檢查是否包含錯別字
   - 檢查專有名詞拼寫是否正確
   - 檢查英文論文標題格式是否完整
   - 如發現錯誤，先進行修正

2. 標準化處理：
   - 必須以「請問」開頭
   - 確保句尾有問號
   - 每次只處理一個主題
   - 保持句子結構完整

3. 專有名詞規範：
   - 張嘉惠老師 → 張嘉惠教授(Chia-Hui Chang)
   - 英文論文標題保持原文，加引號
   - 專業術語採用「中文(English)」格式

4. 語法檢查：
   - 確認主謂賓結構完整
   - 檢查量詞使用
   - 確認介詞使用正確
   - 避免贅字重複

我需要幫助您明確以下一般資訊：
1. 查詢類型（成員資訊、活動資訊、一般資訊）
2. 時間範圍（如適用）
3. 具體對象或主題
4. 所需資訊的詳細程度
5. 其他相關條件

輸入查詢：{original_query}

請讓我按照上述流程處理您的問題，使其符合標準化格式。如果發現輸入有誤，會先更正再進行標準化處理。最後只輸出一個完整的標準問句。

範例：
原始："實驗室博士生"
標準化："請問網際網路與巨量資料探勘實驗室(WIDM Lab)目前有哪些博士班研究生，以及他們的研究方向？"
'''
     # 創建優化提示模板
    optimize_template = PromptTemplate(
        input_variables=["original_query"],
        template=prompt_template
    )
    
    # 創建優化鏈
    
    optimization_chain = LLMChain(
        llm=llm,
        prompt=optimize_template
    )
    
    try:
        # 執行優化
        optimized_query = optimization_chain.run(original_query=question)
        result = {
            'original': question,
            'optimized': optimized_query.strip()
        }
        
        return result
    except Exception as e:
        error_result = {
            'original': question,
            'optimized': question,
            'error': str(e)
        }
        return error_result

def classify_intent(question):
    print('start classify', flush=True)
     # 創建優化提示模板
    optimize_template = PromptTemplate(
        input_variables=["original_query"],
        template="""你是一個智慧型分類助手，負責將查詢內容分類至最相關的類別。

輸入問題：{original_query}

可用類別：
1. paper：與 WIDM 實驗室成員發表的學術論文相關的查詢
   - 包含：論文題目、作者、發表年份、會議/期刊資訊、研究主題或方向
   - 關鍵詞：論文、發表、研究成果、下載、引用、期刊、會議
   - 範例查詢：
     * "請問實驗室最近發表的 NLP 相關論文有哪些？"
     * "想找 2023 年發表的資料探勘相關論文"
     * "教授近期在哪些期刊發表論文？"

2. project：WIDM 實驗室目前或過去執行的研究專案
   - 包含：Educational Agent、Legal AI、GITM 等專案內容與進度
   - 關鍵詞：專案、計畫、技術、研發、成果、demo、系統
   - 範例查詢：
     * "想了解 WIDM 的 Legal AI 專案內容"
     * "Educational Agent 專案目前進度如何？"
     * "實驗室有做過哪些 AI 相關專案？"

3. other：實驗室一般資訊與其他內容
   - 包含：實驗室簡介、指導教授資訊、成員資訊、最新消息、活動資訊、競賽成果、位置資訊
   - 關鍵詞：成員、消息、活動、競賽、位置、聯絡方式、指導教授
   - 範例查詢：
     * "實驗室目前有哪些博士生？"
     * "如何申請加入實驗室？"
     * "實驗室最近有什麼活動？"

請根據輸入問題，判斷最相關的類別。可以選擇一個或多個類別。

輸出格式要求：
- 必須是合法的 JSON 格式
- 僅包含數字陣列：[1] 或 [2] 或 [3] 或 [1,2] 等
- 數字必須為 1、2 或 3
- 至少要有一個類別

範例輸出：
單一類別：[1]
多個類別：[1,3]
"""
    )
    
    # 創建優化鏈
    
    optimization_chain = LLMChain(
        llm=llm,
        prompt=optimize_template
    )
    
    try:
        # 執行優化
        optimized_query = optimization_chain.run(original_query=question)
        try:
        # 將字串轉換為 Python 列表，確保格式正確
            intent_list = json.loads(optimized_query.strip())
            
            # 驗證結果是否符合要求（只包含 1、2、3）
            if not all(isinstance(x, int) and x in [1, 2, 3] for x in intent_list):
                raise ValueError("分類結果必須只包含 1、2、3")
                
            result = {
                'original': question,
                'intent': intent_list
            }
            
            # 輸出優化結果
            print("\n查詢優化結果:", flush=True)
            print(f"原始查詢: {result['original']}", flush=True)
            print(f"分類結果: {result['intent']}", flush=True)
            
            return result
            
        except json.JSONDecodeError:
            print("錯誤：優化結果不是有效的 JSON 格式", flush=True)
            return None
    except Exception as e:
        error_result = {
            'original': question,
            'intent': None,
            'error': str(e)
        }
        print(f"\n查詢優化失敗: {str(e)}", flush=True)
        return error_result

def chat_with_rag(user_id, question):
    global manager
    chain = manager.get_chain_for_user(user_id)
    intents = classify_intent(question)
    print(intents, flush=True)
    print("Before enhance call", flush=True)
    # enhance_result = enhance_question(question)
    # optimized_question = enhance_result['optimized']
    # print(optimized_question, flush=True)
    
    retrieve_result = ''
    
    for intent in intents['intent']:
        if intent == 1:
            enhance_result = enhance_question(question,'paper')
            retriever = vectorstores['paper'].as_retriever()
            retrieve_result += '參考paper所得到結果：'
        elif intent == 2:
            enhance_result = enhance_question(question,'project')
            retriever = vectorstores['project'].as_retriever()
            retrieve_result += '參考project所得到結果：'
        else:
            enhance_result = enhance_question(question,'other')
            retriever = vectorstores['other'].as_retriever()
            retrieve_result += '參考other所得到結果：'
        optimized_question = enhance_result['optimized']
        manager = UserMemoryManager(retriever, llm, inactive_time=300)
        chain = manager.get_chain_for_user(user_id)
        result = chain({"question": optimized_question})
        
        # 收集當前檢索的來源
        current_sources = [source.metadata['source'] for source in result['source_documents']]
        # all_sources.extend(current_sources)
        
        retrieve_result += f'''回覆：{result["answer"]}
        參考來源：{current_sources}'''
        
        print(f'answer:{result["answer"]}', flush=True)
        print(f"source:{current_sources}", flush=True)

    final_prompt = PromptTemplate(
        template="""基於以下檢索到的資訊，請提供一個完整且連貫的回答。
問題：{question}

檢索到資訊：{context}

請根據以上資訊提供回答。要求：
1. 回答要有條理、邏輯性強
2. 整合所有相關資訊
3. 如果資訊有衝突，請說明並解釋

請提供一個 JSON 格式的回答，格式如下：
{{
    "answer": "你的回答內容",
    "sources": ["來源1", "來源2", ...]  # 按照實際使用的來源順序列出
}}

請確保輸出是有效的 JSON 格式。""",
        input_variables=["question", "context"]
    )
    final_chain = LLMChain(llm=llm, prompt=final_prompt)
    response_text = final_chain.run(
        question=question,
        context=retrieve_result
    )
    
    try:
        response_json = json.loads(response_text)
        # 確保回應包含必要的欄位
        if not all(k in response_json for k in ['answer', 'sources']):
            raise ValueError("回應缺少必要的欄位")
            
        temp = []
        after_list = []
        for link in response_json['sources']:
            if after_list is None:
                temp.append(link.replace('/',''))
                after_list.append(link)
            else:
                if link.replace('/','') not in temp:
                    temp.append(link.replace('/',''))
                    after_list.append(link)
        return response_json['answer'], after_list
        
    except json.JSONDecodeError:
        return {
            'answer': response_text,
            'sources': [source.metadata['source'] for source in result['source_documents']]
        }

# def load_paper():
#     org_paper = paper_blueprint.get_paper_by_uuid()
#     documents = []
    
#     for path, title in org_paper.items():
#         try:
#             with open(path, 'rb') as file:
#                 contents = file.read()
            
#             all_text = ""
#             with pdfplumber.open(BytesIO(contents)) as pdf:
#                 for page in pdf.pages:
#                     extracted_text = page.extract_text() or ""
#                     all_text += extracted_text + "\n"
            
#             doc = Document(
#                 page_content=all_text,
#                 metadata={
#                     "source": title,
#                     "path": str(path),
#                     "type": "pdf"
#                 }
#             )
#             documents.append(doc)
            
#         except Exception as e:
#             print(f"處理 PDF 文件 {title} 時發生錯誤: {str(e)}")
#             continue
#     return documents

# def scrapying_paper():
#     global vectorstore
#     paper = load_paper()
#     paper_status['status'] = 'pending'
#     paper_status['start_time'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

#     try:
#         text_splitter = RecursiveCharacterTextSplitter(chunk_size=1024, chunk_overlap=128)
#         splits = text_splitter.split_documents(paper)
#         vectorstore.add_documents(documents=splits)
#         retriever = vectorstore.as_retriever()
#         global manager
#         manager = UserMemoryManager(retriever, llm, inactive_time=300)
#     except Exception as e:
#         print(e)
#         paper_status['status'] = 'error'
#         return

#     paper_status['status'] = 'finished'
#     paper_status['end_time'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

# def scrapying_paper(batch_size=50):
#     global vectorstore, manager
#     paper_status['status'] = 'pending'
#     paper_status['start_time'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
#     try:
#         # 載入論文
#         papers = load_paper()
#         total_documents = len(papers)
#         total_batches = (total_documents // batch_size) + (1 if total_documents % batch_size != 0 else 0)
        
#         # 更新狀態資訊
#         paper_status.update({
#             'total_documents': total_documents,
#             'total_batches': total_batches,
#             'current_batch': 0,
#             'processed_documents': 0
#         })

#         # 初始化文本分割器
#         text_splitter = RecursiveCharacterTextSplitter(
#             chunk_size=1024, 
#             chunk_overlap=128
#         )
        
#         # 分批處理文檔
#         for i in range(0, total_documents, batch_size):
#             try:
#                 # 取得當前批次的文檔
#                 batch = papers[i:i + batch_size]
#                 current_batch = i // batch_size + 1
                
#                 # 更新處理狀態
#                 paper_status.update({
#                     'current_batch': current_batch,
#                     'status': f'Processing batch {current_batch}/{total_batches}'
#                 })

#                 # 處理當前批次
#                 batch_splits = text_splitter.split_documents(batch)
#                 vectorstore.add_documents(documents=batch_splits)
                
#                 # 更新已處理文檔數
#                 paper_status['processed_documents'] = min(i + batch_size, total_documents)
                
#             except Exception as batch_error:
#                 print(f"Error in batch {current_batch}: {batch_error}")
#                 continue  # 繼續處理下一批
        
#         # 設置檢索器和記憶管理器
#         retriever = vectorstore.as_retriever()
#         manager = UserMemoryManager(retriever, llm, inactive_time=300)
        
#         # 完成處理
#         paper_status['status'] = 'finished'
        
#     except Exception as e:
#         print(f"Error during paper processing: {e}")
#         paper_status['status'] = 'error'
#         paper_status['error_message'] = str(e)
#         return False
    
#     paper_status['end_time'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
#     return True

def get_processing_progress():
    """獲取處理進度"""
    if 'total_documents' not in paper_status or paper_status['total_documents'] == 0:
        progress = 0
    else:
        progress = (paper_status['processed_documents'] / 
                   paper_status['total_documents'] * 100)
    
    return {
        **paper_status,
        'progress_percentage': round(progress, 2)
    }

def periodic_cleanup():
    global manager
    while True:
        time.sleep(60)
        if manager:
            cleaned = manager.clean_inactive_memories()
            print(f"已清理 {cleaned} 個不活躍使用者的記憶")


cleanup_thread = threading.Thread(target=periodic_cleanup, daemon=True)
cleanup_thread.start()


@retrieval_blueprint.route('/start-scrapying', methods=['GET'])
def start_scrapying():
    """
    start scrapying
    ---
    tags:
      - retrieval
    responses:
      200:
        description: start scrapying
        schema:
          id: scrapying_status
          properties:
            description:
              type: string
            response:
              properties:
                status:
                  type: string
                start_time:
                  type: string
                end_time:
                  type: string
      400:
        description: scrapying is pending
    """

    if scrapying_status['status'] == 'pending':
        return Response.client_error('scrapying is pending', {
            'website_status': scrapying_status,
            # 'paper_status': paper_status
        })

    # if vectorstore is None:
    # initialize_vectorstore()

    scrapying_website_thread = threading.Thread(target=scrapying_website)
    scrapying_website_thread.start()

    # scrapying_pdf_thread = threading.Thread(target=scrapying_paper)
    # scrapying_pdf_thread.start()
    return Response.response('start scrapying successful', {
        'website_status': scrapying_status,
        # 'paper_status': paper_status
    })


@retrieval_blueprint.route('/scrapying-status', methods=['GET'])
def check_scrapying_status():
    """
    check the status of scrapying
    ---
    tags:
      - retrieval
    responses:
      200:
        description: scrapying status
        schema:
          id: scrapying_status
          properties:
            description:
              type: string
            response:
              properties:
                status:
                  type: string
                start_time:
                  type: string
                end_time:
                  type: string
    """
    return Response.response('check status successful', scrapying_status)


@retrieval_blueprint.route('/query', methods=['GET'])
def query():
    """
    chat retrieval augmented generation
    ---
    tags:
      - retrieval
    parameters:
      - name: query_string
        in: query
        description: query string
        required: true
        type: string
      - name: person_id
        in: query
        description: person who can multi-turn conversations
        required: true
        type: string
    responses:
      200:
        description: chat retrieval augmented generation
      400:
        description: scrapying is not ready
    """
    if scrapying_status['status'] == 'pending' or scrapying_status['status'] == 'not start':
        return Response.response('scrapying is not ready', {
            'answer': "網頁資訊尚未準備完成，請洽管理員",
            'source_list': []
        })

    if 'query_string' not in request.args or 'person_id' not in request.args:
        return Response.client_error('query_string, person_id is required')
    # print(request.args['person_id'])
    answer, source_list = chat_with_rag(request.args['person_id'], request.args['query_string'])
    
    return Response.response('chat retrieval augmented generation successful', {
        'answer': answer,
        'source_list': source_list
    })

def create_vectorspace():
    global embedding,vectorstores
    collection_names = ['project', 'paper', 'other']
    try:
        for name in collection_names:
            vectorstore = Chroma(
                collection_name=name,
                embedding_function=embedding,
                persist_directory='./statics/chroma_db'
            )
            vectorstores[name] = vectorstore
            print(f"Found existing collection: {name}")
    except:
        for name in collection_names:
            vectorstore = Chroma.from_documents(
                documents=[],  # Start with empty collection
                embedding=embedding,
                collection_name=name,
                persist_directory='./statics/chroma_db'
            )
            vectorstores[name] = vectorstore
            print(f"Created new collection: {name}")
    # try:
    #     # Try to load existing vectorstore
    #     vectorstore = Chroma(
    #         collection_name='info',
    #         embedding_function=embedding,
    #         persist_directory='./statics/chroma_db'
    #     )
    #     print(f"Found existing collection: info")
    # except:
    #     # Create new vectorstore if it doesn't exist
    #     vectorstore = Chroma.from_documents(
    #         documents=[],  # Start with empty collection
    #         embedding=embedding,
    #         collection_name='info',
    #         persist_directory='./statics/chroma_db'
    #     )
    #     print(f"Created new collection: info'")

# def create_vectorspace():
#     global embedding, vectorstore
#     try:
#         # Try to load existing vectorstore with specified collection name
#         vectorstore = Chroma(
#             embedding_function=embedding,
#             persist_directory='./statics/chroma_db'
#         )
#         print(f"Found existing vector db")
#     except:
#         # Create new vectorstore if it doesn't exist
#         vectorstore = Chroma.from_documents(
#             documents=[],  # Start with empty collection
#             embedding=embedding,
#             persist_directory='./statics/chroma_db'
#         )
#         print(f"Created new vector db")
#     return vectorstore

@retrieval_blueprint.route('/initialize', methods=['GET'])
def scrapying():
    if scrapying_status['status'] == 'pending':
        return Response.client_error('scrapying is pending', {
            'website_status': scrapying_status,
            'paper_status': paper_status
        })
    create_vectorspace()
    scrapying_website()
    # scrapying_paper()
    return Response.response('start scrapying successful', {
        'website_status': scrapying_status,
        'paper_status': paper_status
    })
