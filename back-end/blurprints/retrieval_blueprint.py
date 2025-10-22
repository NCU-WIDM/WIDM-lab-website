import os
import time
import requests
import threading
from queue import Queue
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from pathlib import Path
from io import BytesIO
import json
from config import Config

from fastapi.openapi.models import APIKey
from langchain_openai import ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OpenAIEmbeddings
from concurrent.futures import ThreadPoolExecutor, as_completed
from langchain_community.document_loaders import AsyncHtmlLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_transformers import MarkdownifyTransformer
from langchain.schema import Document

from flask import Blueprint, request, stream_with_context, current_app
from flask import Response as FlaskResponse
from models.responses import Response
from utiles.kg_retrival import KnowledgeGraphRetrieval
from utiles.retrival_strategy import RetrievalStrategy
from utiles.retrival_config import RetrievalConfig
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer

kg_retrieval = None
retrieval_strategy = None

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
current_log_path = None

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
        
    except Exception as e:
        print(e)
        scrapying_status['status'] = 'error'
        return

    scrapying_status['status'] = 'finished'
    scrapying_status['end_time'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

def create_vectorspace():
    global embedding, vectorstores, kg_retrieval, retrieval_strategy
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
            try:
                vectorstore = Chroma.from_documents(
                    documents=[],  # Start with empty collection
                    embedding=embedding,
                    collection_name=name,
                    persist_directory='./statics/chroma_db'
                )
                vectorstores[name] = vectorstore
                print(f" 創建新集合: {name}")
            except Exception as create_error:
                print(f" 創建集合 {name} 失敗: {create_error}")
    
    print("3. 初始化知識圖譜檢索...")
    kg_init_result = initialize_kg_retrieval()
    if kg_init_result:
        print("向量空間創建完成")
              
    return kg_init_result

def initialize_kg_retrieval():
    """初始化知識圖譜檢索系統"""
    global kg_retrieval, retrieval_strategy
    
    try:
        # 檢查配置是否有效
        if not RetrievalConfig.validate_config():
            print("知識圖譜配置驗證失敗，跳過初始化")
            return False

        # 初始化 Elasticsearch 客戶端
        es_config = RetrievalConfig.KG_CONFIG
        es_client = Elasticsearch(
            [es_config['es_host']],
            basic_auth=(es_config['es_username'], es_config['es_password']),
            verify_certs=es_config['es_verify_certs']
        )
        
        # 初始化 SentenceTransformer 模型
        st_model = SentenceTransformer(es_config['st_model_name'])
        
        # 初始化知識圖譜檢索
        kg_retrieval = KnowledgeGraphRetrieval(
            taxonomy_path=es_config['taxonomy_path'],
            es_client=es_client,
            st_model=st_model
        )
        
        # 初始化檢索策略
        retrieval_strategy = RetrievalStrategy(
            mode=RetrievalConfig.DEFAULT_MODE,
            kg_retrieval=kg_retrieval,
            vectorstores=vectorstores,
            llm=llm
        )
        
        print("知識圖譜檢索系統初始化成功")
        return True
        
    except Exception as e:
        print(f"知識圖譜檢索系統初始化失敗: {e}")
        return False

def periodic_cleanup():
    global retrieval_strategy
    while True:
        time.sleep(60)
        if retrieval_strategy:
            cleaned = retrieval_strategy.memory_manager.clean_inactive_memories()
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
        })

    scrapying_website_thread = threading.Thread(target=scrapying_website)
    scrapying_website_thread.start()

    return Response.response('start scrapying successful', {
        'website_status': scrapying_status,
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
      - name: mode
        in: query
        description: retrieval mode (original, knowledge_graph, hybrid)
        required: false
        type: string
    responses:
      200:
        description: chat retrieval augmented generation
      400:
        description: scrapying is not ready
    """
    scrapying_status['status'] = 'finished'
    if scrapying_status['status'] == 'pending' or scrapying_status['status'] == 'not start':
        return Response.response('scrapying is not ready', {
            'answer': "網頁資訊尚未準備完成，請洽管理員",
            'source_list': []
        })

    if 'query_string' not in request.args or 'person_id' not in request.args:
        return Response.client_error('query_string, person_id is required')

    # 獲取可選的模式參數
    mode = request.args.get('mode')
    
    # 使用檢索策略處理查詢
    if retrieval_strategy:
        if mode:
            retrieval_strategy.set_mode(mode)
        answer, source_list = retrieval_strategy.chat_with_rag(
            request.args['person_id'], 
            request.args['query_string']
        )
    else:
        return Response.client_error('檢索系統未初始化')
    
    return Response.response('chat retrieval augmented generation successful', {
        'answer': answer,
        'source_list': source_list,
        'mode': retrieval_strategy.get_current_mode()
    })

@retrieval_blueprint.route('/initialize', methods=['GET'])
def scrapying():
    if scrapying_status['status'] == 'pending':
        return Response.client_error('scrapying is pending', {
            'website_status': scrapying_status,
            'paper_status': paper_status
        })
    
    print("=== 開始初始化流程 ===")
    
    # 初始化向量空間和知識圖譜檢索
    kg_init_result = create_vectorspace()
    
    if kg_init_result:
        print("知識圖譜檢索系統初始化成功")
    
    # 執行網站爬蟲
    scrapying_website()

    return Response.response('start scrapying successful', {
        'website_status': scrapying_status,
        'paper_status': paper_status,
        'kg_initialization': 'success' if kg_init_result else 'failed'
    })

@retrieval_blueprint.route('/kg-search', methods=['GET'])
def kg_search():
    """
    知識圖譜檢索測試端點
    ---
    tags:
      - retrieval
    parameters:
      - name: query
        in: query
        description: 查詢字串
        required: true
        type: string
    responses:
      200:
        description: 知識圖譜檢索結果
      400:
        description: 查詢參數缺失或檢索失敗
    """
    if 'query' not in request.args:
        return Response.client_error('query parameter is required')
    
    query = request.args['query']
    
    if not kg_retrieval:
        return Response.client_error('知識圖譜檢索系統未初始化')
    
    try:
        results = kg_retrieval.search_knowledge_graph(query, top_n=10)
        summary = kg_retrieval.get_search_results_summary(results)
        
        return Response.response('知識圖譜檢索成功', {
            'query': query,
            'results_count': len(results),
            'summary': summary,
            'detailed_results': results
        })
    except Exception as e:
        return Response.client_error(f'知識圖譜檢索失敗: {str(e)}')

@retrieval_blueprint.route('/retrieval-modes', methods=['GET'])
def get_retrieval_modes():
    """
    獲取可用的檢索模式
    ---
    tags:
      - retrieval
    responses:
      200:
        description: 可用的檢索模式列表
    """
    if retrieval_strategy:
        modes = retrieval_strategy.get_available_modes()
        current_mode = retrieval_strategy.get_current_mode()
    else:
        modes = RetrievalConfig.get_enabled_modes()
        current_mode = RetrievalConfig.DEFAULT_MODE
    
    return Response.response('檢索模式列表', {
        'available_modes': modes,
        'current_mode': current_mode,
        'default_mode': RetrievalConfig.DEFAULT_MODE
    })

@retrieval_blueprint.route('/set-mode', methods=['POST'])
def set_retrieval_mode():
    """
    設置檢索模式
    ---
    tags:
      - retrieval
    parameters:
      - name: mode
        in: form
        description: 檢索模式
        required: true
        type: string
    responses:
      200:
        description: 模式設置成功
      400:
        description: 無效的模式
    """
    if 'mode' not in request.form:
        return Response.client_error('mode parameter is required')
    
    mode = request.form['mode']
    
    if not RetrievalConfig.is_mode_enabled(mode):
        return Response.client_error(f'無效的檢索模式: {mode}')
    
    if retrieval_strategy:
        retrieval_strategy.set_mode(mode)
        return Response.response('檢索模式設置成功', {
            'mode': mode,
            'available_modes': RetrievalConfig.get_enabled_modes()
        })
    else:
        return Response.client_error('檢索策略未初始化')