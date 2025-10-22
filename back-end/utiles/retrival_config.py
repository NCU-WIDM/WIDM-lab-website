# -*- coding: utf-8 -*-
"""
檢索配置管理
"""

import os
from typing import Dict, Any
from config import Config

class RetrievalConfig:
    """檢索配置類別"""
    
    # 默認檢索模式
    DEFAULT_MODE = 'original'
    
    # 檢索模式配置
    RETRIEVAL_MODES = {
        'original': {
            'name': '原方法',
            'description': '網頁爬蟲 + 向量檢索 + RAG',
            'enabled': True
        },
        'knowledge_graph': {
            'name': '知識圖譜方法',
            'description': '結構化知識檢索',
            'enabled': True
        }
    }
    
    # 知識圖譜配置
    KG_CONFIG = {
        'taxonomy_path': '/app/taxonomy_KG2_total_parts_all.json',
        'es_host': 'http://elasticsearch:9200',
        'es_username': 'elastic',
        'es_password': 'fHNrDIW_yE8Zc-6w4_Xs',
        'es_verify_certs': False,
        'st_model_name': 'paraphrase-multilingual-mpnet-base-v2',
        'index_name': 'kg_taxonomy_index',
        'vector_dims': 768,
        'batch_size': 64,
        'chunk_size': 1000,
        'default_top_n': 10,
        'vector_search_weight': 0.7,
        'structured_search_weight': 0.3
    }
    
    # OpenAI 配置
    OPENAI_CONFIG = {
        'api_key': Config.OPENAI_KEY,
        'model': 'gpt-4o',
        'max_tokens': 4096
    }
    
    @classmethod
    def get_mode_config(cls, mode: str) -> Dict[str, Any]:
        """獲取指定模式的配置"""
        return cls.RETRIEVAL_MODES.get(mode, {})
    
    @classmethod
    def is_mode_enabled(cls, mode: str) -> bool:
        """檢查模式是否啟用"""
        config = cls.get_mode_config(mode)
        return config.get('enabled', False)
    
    @classmethod
    def get_enabled_modes(cls) -> Dict[str, str]:
        """獲取所有啟用的模式"""
        return {
            mode: config['name'] 
            for mode, config in cls.RETRIEVAL_MODES.items() 
            if config.get('enabled', False)
        }
    
    @classmethod
    def validate_config(cls) -> bool:
        """驗證配置是否有效"""
        # 檢查知識圖譜檔案
        taxonomy_path = cls.KG_CONFIG['taxonomy_path']
        if not os.path.exists(taxonomy_path):
            print(f"警告: 知識圖譜檔案不存在: {taxonomy_path}")
            return False
        
        # 檢查 OpenAI API Key
        if not cls.OPENAI_CONFIG['api_key']:
            print("警告: OpenAI API Key 未設定")
            return False
        
        return True