# -*- coding: utf-8 -*-
"""
知識圖譜檢索模組
"""

import logging
import re
import json
import requests
import numpy as np
import math
import unicodedata
from typing import List, Dict, Any, Tuple
from functools import lru_cache
from pathlib import Path
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from config import Config

# 抑制警告
# warnings.filterwarnings("ignore", category=UserWarning, module='elasticsearch')
# warnings.simplefilter('ignore', warnings.InsecureRequestWarning)

class KnowledgeGraphRetrieval:
    """知識圖譜檢索類別"""
    
    def __init__(self, taxonomy_path: str, es_client=None, st_model=None):
        self.taxonomy_path = Path(taxonomy_path)
        self.es_client = es_client
        self.st_model = st_model
        self.taxonomy_data = None
        self.index_name = "kg_taxonomy_index"
        
        # 載入知識圖譜
        self._load_taxonomy()
        
        # 初始化向量索引
        if self.es_client and self.st_model:
            self._initialize_vector_index()
    
    def _load_taxonomy(self):
        """載入知識圖譜資料"""
        try:
            with open(self.taxonomy_path, "r", encoding="utf-8") as f:
                self.taxonomy_data = json.load(f)
            logging.info(f"成功載入知識圖譜: {self.taxonomy_path}")
        except Exception as e:
            logging.error(f"載入知識圖譜失敗: {e}")
            self.taxonomy_data = {}
    
    def search_knowledge_graph(self, user_query: str, top_n: int = 10) -> List[Dict[str, Any]]:
        """搜尋知識圖譜"""
        if not self.es_client or not self.st_model:
            logging.warning("缺少 Elasticsearch 客戶端或 SentenceTransformer 模型")
            return []
        
        try:
            # 1. 生成三元組
            triple_text = self.generate_triples_from_query(user_query)
            if not triple_text:
                return []
            
            # 2. 正規化三元組文本
            normalized_triple_text = self.normalize_triple_text(triple_text)
            if normalized_triple_text == "格式不符":
                logging.warning("三元組格式不符，嘗試直接解析原始文本")
                normalized_triple_text = triple_text
            
            # 3. 解析三元組
            results_list, triple_map_dict = self.parse_triples(normalized_triple_text)
            
            # 逐個處理三元組
            filter_final_results = []
            struct_final_results = []
            for triple_info in results_list:
                
                fileter_results, struct_results = self._process_triple_with_taxonomy_vectors(triple_info, self.taxonomy_data, top_n)
                filter_final_results.extend(fileter_results)

                for i, m in enumerate(struct_results, 1):
                    struct_final_results.append(f"Triple #{i} | completeness={m['completeness']:.1%}\n")
                    struct_final_results.append(f"  path : {m['path']}\n")
            
            print(f"\n🔍 知識圖譜檢索結果: {struct_final_results}")
               
            return struct_final_results
            
        except Exception as e:
            logging.error(f"知識圖譜搜尋失敗: {e}")
            return []
    
    def normalize_triple_text(self, text: str) -> str:
        """將格式化後的三元組文本轉換回標準格式"""
        # 正規化的模式
        pattern = r"'#### \*\*(.*?)\*\*'  '(.*?)'  '- \*\*entity 參數\*\*：(.*?)'  '  - (.*?) -> (.*?)'  '  - (.*?) -> (.*?)'  '  - relationship_name : (.*?)'"
        
        # 使用正則表達式匹配並提取資料
        match = re.search(pattern, text)
        
        if match:
            # 提取的部分
            title = match.group(1)
            subject = match.group(2)
            entity_params = match.group(3)
            param1_title, param1_value = match.group(4), match.group(5)
            param2_title, param2_value = match.group(6), match.group(7)
            relationship = match.group(8)
            
            # 格式化並輸出
            formatted_text = f""" 
            #### **{title}**
            ({subject})
            - **entity 參數**：  
            - {param1_title} -> {param1_value}  
            - {param2_title} -> {param2_value}  
            - relationship_name : {relationship}
            """
            
            return formatted_text
        else:
            return "格式不符"
    
    def generate_triples_from_query(self, user_query: str) -> str:
        """從使用者查詢生成三元組"""
        api_key = Config.OPENAI_KEY
        
        prompt1 = f"""
        #不要省略任何細節,轉換user_query為三元組 , 你要遵守MECE原則，例如A&B一起的合併情境要分開撰寫,無法完整表達語義的就新增出三元組,
        # 各個主角要有各自獨立的節點,各自帶開三元組故事的發展,不要融合一起講述
        # 或視情況,不適合三元組分割的,就保留長文本敘述 
        # 不要更動原文的稱謂naming(包括entity, relation), 不要丟棄細節資訊, 
        # 文本所提參考參數需保留完整名稱與數值，例如"LB直線度","1.55±0.1"
        #(依照User問句的語言回答繁體中文或英文)
        #  template範例:
        #    ("4505B0005W300", "機種", "P104ZZD-DF3")
        #    ("4505B0005W300", "螢幕尺寸", "104")
        #    ("4505B0005W300", "供應商","兆紀")
        #    ("4505B0005W300","application","Tablet" )
        #    ("4505B0005W300","CG貼合","TID" )
        
        將以下文本轉換為三元組:
        {user_query}
        
        #你只能依據user_query做三元組拆解,不要添加你的意見或試圖回答
        嚴格遵守:你的任務是拆解問局為三元組,不要做任何知識回答 , 例如木柵動物園的明星動物是? 你的任務是  '木柵動物園 明星動物 為' , '動物園 在 木柵' , '動物園 明星 動物' , 不要從你知識庫回答任何訊息
        """
        
        gpt4_input = {
            "model": "gpt-4o",
            "messages": [{"role": "user", "content": prompt1}],
            "max_tokens": 4096
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        try:
            gpt4_response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=gpt4_input)
            gpt4_output = gpt4_response.json()['choices'][0]['message']['content']
            print(f"user query拆解為三元組的初步結果: {gpt4_output}", flush=True)
            
            # 進一步細化三元組
            prompt2 = f"""
            Ontology_list = 
             ## 【實驗室資訊】
            - lab_name  
            - lab_contact_address  
            - lab_contact_phone  
            - lab_research_fields  
            - lab_recruitment_requirements  
            - lab_supervisor_name  
            - lab_activities  
            - lab_event_dates  
            - lab_event_types  
            - lab_members  
            
            ## 【專案與系統資訊】
            - project_name  
            - project_purpose  
            - project_technical_features  
            - project_backend_architecture  
            - project_user_experience_features  
            - project_search_method  
            - project_display_modes  
            - project_functions  
            - project_system_features  
            - project_development_team  
            - project_user_input_methods  
            - project_personalization_features  
            - project_user_benefits  
            - project_business_value  
            - project_dataset_name  
            - project_used_models  
            - project_applied_domains  
            - project_prediction_targets  
            - project_key_components  
            - project_evaluation_method  
            - project_prompting_techniques  
            - project_baseline_methods  
            - project_accuracy_results  
            - project_limitations  
            - project_future_work  
            - project_component_modules  
            - project_human_evaluation_scores  
            - project_llm_based_evaluation_scores  
            - project_multi_task_definitions  
            - project_training_optimization_techniques  
            - project_training_resource_saving_rate  
            - project_performance_improvement_rate  
            - project_learning_strategy  
            - project_conversational_goals  
            - project_target_learners  
            - project_fact_verification_scope  
            - project_knowledge_structure_used  
            - project_training_stages  
            - project_labeling_strategy  
            - project_feedback_system_used  
            - project_adaptive_exploration_mechanism  
            - project_task_type_comparison  
            - project_task_model_preference  
            - project_temporal_split_strategy  
            - project_cross_lingual_support  
            - project_technical_outcomes  
            - project_execution_metrics  
            - project_task_design_challenges  
            - project_algorithm_composition  
            - project_statistical_significance_value  
            - project_html_structure_features_used  
            - project_zero_shot_test_languages  
            - project_multilingual_embedding_used  
            - project_auxiliary_tasks_defined  
            - project_cross_validation_consistency  
            - project_attention_mechanism_used  
            - project_pointer_network_used  
            - project_phoneme_features_used  
            - project_asr_error_sources  
            - project_event_location_disambiguation  
            - project_event_title_entity_resolution  
            - project_distant_supervision_used  
            - project_temporal_expression_resolution  
            - project_sequential_pattern_mining_applied  
            
            ## 【聊天機器人互動資訊】
            - chatbot_name  
            - chatbot_user_type  
            - chatbot_session_id  
            - chatbot_visit_count  
            - chatbot_message_count  
            - chatbot_status  
            - chatbot_dialogue_stage  
            - chatbot_popular_queries  
            - chatbot_classified_query_location  
            - chatbot_classified_query_time  
            - chatbot_classified_query_target  
            - chatbot_classified_query_type  
            - chatbot_classified_query_intent  
            
            ## 【指導教授與學術經歷】
            - advisor_name  
            - advisor_affiliation  
            - advisor_position  
            - advisor_research_fields  
            - advisor_education_background  
            - advisor_publication_count  
            - advisor_publication_venues  
            - advisor_professional_roles  
            - advisor_conference_roles  
            - advisor_association_roles  
            - advisor_presidency_period  
            
            ## 【實驗室成員資訊】
            - member_name  
            - member_program  
            - member_research_fields  
            - member_projects  
            - member_roles  
            - member_affiliated_lab  
            
            ## 【實驗室新聞與公告資訊】
            - news_title  
            - news_type  
            - news_publish_date  
            - news_related_members  
            - news_description  
            - news_award_title  
            - news_award_category  
            - news_award_result  
            - news_award_level  
            - news_award_status  
            - news_award_organizer  
            - news_award_background  
            - news_award_evolution  
            - news_award_individual_recipients  
            - news_related_project_name  
            - news_competition_project_name  
            - news_project_nickname  
            - news_academic_competition_name  
            - news_competition_department  
            - news_team_participants  
            - news_advisor_award_students  
            - news_internship_program_name  
            - news_internship_focus_topics  
            - news_selection_result  
            - news_visit_location  
            - news_conference_name  
            - news_conference_website  
            - news_conference_participant_names  
            - news_conference_paper_title  
            - news_conference_award_name  
            - news_proposal_name  
            - news_proposal_challenges  
            - news_proposal_regulation_alignment  
            - news_proposal_compliance_theme  
            - news_proposal_policy_suggestion  
            - news_member_name  
            - news_member_affiliation  
            - news_member_role  
            - news_lab_event_type  
            - news_event_title  
            - news_event_format  
            - news_event_change_reason  
            - news_event_appreciation  
            - news_event_expectation  
            - news_event_roles  
            - news_visual_structure_description  
            - news_visual_color_meaning  
            
            ## 【實驗室徵才資訊】
            - recruitment_job_title  
            - recruitment_job_description  
            - recruitment_required_skills  
            - recruitment_salary  
            - recruitment_work_schedule  
            - recruitment_work_location  
            - recruitment_application_method  
            - recruitment_deadline  
            - recruitment_contact_person  
            - recruitment_contact_info  
            - recruitment_notes  
            - recruitment_announcement_date  
            
            ## 【實驗室出版資訊】
            - publication_title  
            - publication_type  
            - publication_authors  
            - publication_year  
            - publication_venue  
            - publication_topic_tags  
            - publication_used_methodology  
            - publication_project_relation  
            - publication_summary  
            - publication_dataset_used  
            - publication_model_type  
            - publication_prompting_method  
            - publication_evaluation_result  
            - publication_limitation  
            - publication_future_direction  
            - publication_human_evaluation_metric  
            - publication_automatic_evaluation_metric  
            - publication_task_definitions  
            - publication_author_affiliations  
            - publication_updated_date  
            - publication_target_users  
            - publication_learning_outcomes  
            - publication_reinforcement_learning_design  
            - publication_fact_checking_metrics  
            - publication_training_phases  
            - publication_feedback_design  
            - publication_annotation_strategy  
            - publication_task_model_comparison  
            - publication_temporal_split_method  
            - publication_cross_lingual_features  
            - publication_application_results  
            - publication_execution_cost  
            - publication_data_volume  
            - publication_statistical_validation  
            - publication_html_based_features  
            - publication_zero_shot_languages  
            - publication_auxiliary_tasks  
            - publication_cross_language_consistency  
            - publication_asr_correction_methods  
            - publication_event_extraction_methods  
            - publication_location_entity_disambiguation  
            - publication_temporal_expression_resolution  
            - publication_distant_supervision_approach  
            - publication_sequential_pattern_techniques  
            
            你只能從這些欄位挑選, 不能自已生成, 請你直接回答
            你建議新增的部分, 請你盡量從現有欄位挑選
            
            輸出範例:
            #### **第一條三元組**
            (碩士班新生, 還有, 多少名額?)
            - **entity 參數**：  
              - recruitment_job_title -> 碩士班新生  
              - recruitment_notes -> 還有多少名額?  
              - relationship_name : 還有
            
            將以下三元組進一步細分:
            {gpt4_output}
            
            請注意, 不用解釋, 不用說明, 你只要照我的要求輸出為下列格式
            #### **第一條三元組**
            (碩士班新生, 還有, 多少名額?)
            - **entity 參數**：  
              - recruitment_job_title -> 碩士班新生  
              - recruitment_notes -> 還有多少名額?  
              - relationship_name : 還有
            """
            
            gpt4_input_refined = {
                "model": "gpt-4o",
                "messages": [{"role": "user", "content": prompt2}],
                "max_tokens": 4096
            }
            
            gpt4_response_refined = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=gpt4_input_refined)
            gpt4_output_refined = gpt4_response_refined.json()['choices'][0]['message']['content']
            
            print(f"user query拆解為三元組的細化結果: {gpt4_output_refined}", flush=True)
            
            # Format the final output (與原始文字檔保持一致)
            all_parameters = gpt4_output_refined.split('\n')
            formatted_results = "  ".join([f"'{item}'" for item in all_parameters if item.strip()])
            
            print(f"格式化後的結果: {formatted_results}", flush=True)
            return formatted_results
            
        except Exception as e:
            logging.error(f"生成三元組失敗: {e}")
            return ""
    
    def parse_triples(self, text: str) -> Tuple[List[Dict], Dict]:
        """解析三元組文本"""
        results_list = []
        triple_dict = {}
        
        sections = re.split(r'\n?####\s*[\'"*]*([^\'"\n*]+)[\'"*]*\s*\n', text)
        
        blocks = []
        for i in range(1, len(sections), 2):
            if i < len(sections) - 1:
                title = sections[i].strip()
                content = sections[i + 1]
                blocks.append((title, content))
        
        if not blocks:
            blocks = [("未知三元組", text)]
        
        for triple_id, block_text in blocks:
            triple_info = {
                "triple_id": triple_id,
                "original_triple": "",
                "field_names": [],
                "entities": {},
                "relation": "",
                "original_relation": ""
            }
            
            processed_block = self.preprocess_text(block_text)
            
            start_idx = processed_block.find('(')
            if start_idx == -1:
                continue
            
            remaining_text = processed_block[start_idx:]
            match = re.search(r'\)(?=\s*(?:-|\n|$))', remaining_text)
            if match:
                end_idx = start_idx + match.start() + 1
                raw_content = processed_block[start_idx+1:end_idx-1]
            else:
                continue
            
            parts = self.safe_split_commas(raw_content, maxsplit=2)
            
            if len(parts) == 3:
                entity = parts[0].strip().strip("'\"")
                relation = parts[1].strip().strip("'\"")
                target = parts[2].strip().strip("'\"")
                
                entity = entity.replace("\\", "")
                
                triple_info["original_triple"] = f"({entity}, {relation}, {target})"
                triple_info["original_relation"] = relation
                
                is_numeric_relation = re.match(r'^\d+(\.\d+)?$', relation.strip())
                
                param_match = re.search(
                    r'[-•－]\s*\*\*entity\s+參數\*\*\s*[:：]\s*\n((?:\s*-[^\n]+\n?)*)',
                    block_text, re.MULTILINE
                )
                
                if param_match:
                    param_lines = param_match.group(1)
                    for line in param_lines.split('\n'):
                        line = line.strip()
                        if not line:
                            continue
                        
                        match_param = re.match(r'^-\s*([a-zA-Z0-9_]+)\s*(?:->|:)\s*(.+)$', line)
                        if match_param:
                            param_name = match_param.group(1).strip()
                            param_value = match_param.group(2).strip()
                            
                            if param_name.lower() == "relationship_name":
                                if re.match(r'^\d+(\.\d+)?$', param_value.strip()):
                                    triple_info["relation"] = "是"
                                else:
                                    triple_info["relation"] = param_value
                            else:
                                unique_name = param_name
                                counter = 1
                                while unique_name in triple_info["entities"]:
                                    counter += 1
                                    unique_name = f"{param_name}_{counter}"
                                
                                triple_info["entities"][unique_name] = param_value
                                triple_info["field_names"].append(unique_name)
                
                if "relation" not in triple_info or not triple_info["relation"]:
                    triple_info["relation"] = "是" if is_numeric_relation else relation
                
                dict_entry = {
                    "field_names": triple_info["field_names"],
                    "entities": triple_info["entities"],
                    "relation": triple_info["relation"]
                }
                
                compact_key_original = self.normalize_string(self.compact_concat(entity, relation, target))
                triple_dict[compact_key_original] = dict_entry
                
                if is_numeric_relation:
                    compact_key_is = self.normalize_string(self.compact_concat(entity, "是", target))
                    triple_dict[compact_key_is] = dict_entry
                
                results_list.append(triple_info)
        
        return results_list, triple_dict
    
    def preprocess_text(self, text: str) -> str:
        """文本預處理"""
        replacements = {
            '–': '-', '—': '-', '‒': '-', '―': '-', '－': '-',
            '•': '-', '·': '-', '∙': '-', '▪': '-', '▫': '-',
            '→': '->', '⇒': '->', '－>': '->', '➔': '->', '⟶': '->',
            '：': ':', '；': ';', '，': ',', '。': '.', '！': '!', '？': '?',
            '（': '(', '）': ')', '【': '[', '】': ']', '｛': '{', '｝': '}',
            ''': "'", ''': "'", '"': '"', '"': '"',
            '％': '%', '＋': '+', '－': '-', '×': '*', '÷': '/', '＝': '=',
            'µm': 'um', 'μm': 'um', 'µ': 'u', 'μ': 'u',
            '\u00A0': ' ', '\u2003': ' ', '\u2002': ' ', '\u2009': ' ',
            '\u200B': '', '\uFEFF': '', '\u3000': ' ',
        }
        
        for old, new in replacements.items():
            text = text.replace(old, new)
        
        text = re.sub(r'[ \t\r\f\v]+', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r'[''‵′]', "'", text)
        text = re.sub(r'[""]', '"', text)
        
        return text
    
    def normalize_string(self, s: str) -> str:
        """字串正規化"""
        s = self.preprocess_text(s)
        s = s.strip()
        s = unicodedata.normalize("NFKC", s)
        s = re.sub(r'^["\']+(.*?)["\']$', r'\1', s)
        s = re.sub(r'^["\']+(.*?)["\']$', r'\1', s)
        s = re.sub(r'["\'\s]+$', '', s)
        
        while re.search(r'\([^()]*\)', s):
            inner = re.search(r'\(([^()]*)\)', s)
            if inner and inner.group(1).strip():
                s = s.replace(inner.group(0), inner.group(1))
            else:
                s = s.replace(inner.group(0), '')
        
        s = s.replace('(', '').replace(')', '')
        s = re.sub(r'[,;:\.]+$', '', s)
        s = re.sub(r'[）\)][^\s]*[\'"]?$', '', s)
        s = s.replace("′", "'")
        s = s.replace("\\'", "'")
        
        return s.strip()
    
    def compact_concat(self, *args) -> str:
        """合併多段文字為單一 key"""
        parts = []
        for text in args:
            text = self.preprocess_text(text)
            text = text.replace("\\", "")
            text = re.sub(r'^["\s]+|["\s]+$', '', text)
            text = re.sub(r'[,;:\.]+$', '', text)
            text = re.sub(r'\s+', '', text)
            text = re.sub(r'[''"]', '', text)
            text = text.replace('_', '').replace('/', '')
            text = text.replace('\\', '').replace('|', '').replace('~', '')
            text = re.sub(r'[\(\)\[\]\{\}<>（）【】｛｝〔〕〈〉《》]', '', text)
            text = re.sub(r'\.(_|\s*)', '', text)
            text = text.replace("'", "")
            parts.append(text)
        return ''.join(parts)
    
    def safe_split_commas(self, s: str, maxsplit: int = 2) -> list:
        """安全分割逗號"""
        pieces, buf = [], []
        in_sgl = in_dbl = False
        bracket_level = 0
        splits = 0
        
        def push():
            pieces.append(''.join(buf).strip().strip('\'"'))
            buf.clear()
        
        for i, ch in enumerate(s):
            if not in_sgl and not in_dbl:
                if ch in '([{<':
                    bracket_level += 1
                elif ch in ')]}>':
                    bracket_level = max(bracket_level - 1, 0)
            
            if ch in "\"'":
                if (not in_sgl and not in_dbl and
                    (i == 0 or s[i-1].isspace() or s[i-1] == ',')):
                    if ch == "'":
                        in_sgl = True
                    else:
                        in_dbl = True
                    continue
                elif (in_sgl and ch == "'" or in_dbl and ch == '"'):
                    nxt = s[i+1] if i+1 < len(s) else ''
                    if nxt == ',' or nxt.isspace() or nxt == '':
                        in_sgl = in_dbl = False
                        continue
            
            if (ch == ',' and not in_sgl and not in_dbl and
                    bracket_level == 0 and
                    (maxsplit == 0 or splits < maxsplit)):
                push()
                splits += 1
                continue
            
            buf.append(ch)
        
        if buf:
            push()
        
        if maxsplit == 2 and len(pieces) != 3:
            pieces = [p.strip().strip('\'"') for p in s.split(',', 2)]
        
        return pieces
    
    def _vector_search(self, triple_info: Dict[str, Any], top_n: int = 10) -> List[Dict[str, Any]]:
        """向量搜尋"""
        query_text = self._format_triple_to_sentence(triple_info)
        query_vector = self.encode_cached(query_text).tolist()
        
        response = self.es_client.search(
            index=self.index_name,
            body={
                "query": {
                    "script_score": {
                        "query": {"match_all": {}},
                        "script": {
                            "source": "cosineSimilarity(params.query_vector, 'entity_vector')",
                            "params": {"query_vector": query_vector}
                        }
                    }
                },
                "size": top_n * 2
            }
        )
        
        filtered_query_keys = set(k for k in triple_info["entities"].keys() 
                                 if k.lower() not in ["model", "part_number", "relationship_name"])
        
        results = []
        for hit in response['hits']['hits']:
            source = hit['_source']
            es_score = hit['_score']
            candidate_entity_info = source.get('entity_info', {})
            filtered_candidate_text = self._filter_candidate_text(candidate_entity_info)
            
            # 計算編輯距離
            ld = self._levenshtein_distance(query_text.lower(), filtered_candidate_text.lower())
            max_len = max(len(query_text), len(filtered_candidate_text))
            text_sim = 1.0 - (ld / max_len) if max_len > 0 else 0.0
            
            # 計算欄位覆蓋率
            candidate_keys = set(k for k in candidate_entity_info.keys() 
                               if k.lower() not in ["model", "part_number", "relationship_name"])
            common_ratio = len(filtered_query_keys.intersection(candidate_keys)) / (len(filtered_query_keys) if filtered_query_keys else 1)
            bonus = 0.1 * common_ratio * es_score
            
            # 綜合分數
            combined_score = (0.7 * es_score) + (0.3 * (text_sim * es_score)) + bonus
            
            results.append({
                "entity_text": source.get('entity_text', ''),
                "entity_info": candidate_entity_info,
                "path": source.get("path", "").strip().lower(),
                "es_score": es_score,
                "edit_distance": ld,
                "text_similarity": text_sim,
                "combined_score": combined_score,
                "search_type": "vector"
            })
        
        # 去重並排序
        results.sort(key=lambda d: d["combined_score"], reverse=True)
        deduped = self._deduplicate_coverage_candidates(results, score_key="combined_score")
        
        return deduped[:top_n]
    
    def _structured_search(self, triple_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """結構化搜尋"""
        field_values = triple_info["entities"].copy()
        field_values["relationship_name"] = triple_info["relation"]
        
        results = []
        
        def check_node(node, path="", matched_field_names=None, matched_field_values=None):
            if matched_field_names is None:
                matched_field_names = set()
            if matched_field_values is None:
                matched_field_values = set()
            
            local_field_names = set(matched_field_names)
            local_field_values = set(matched_field_values)
            
            node_name = node.get("name", "")
            if isinstance(node_name, str):
                parts = node_name.split(" ", 1)
                if len(parts) == 2:
                    field_name, field_value = parts
                    field_name = field_name.strip()
                    field_value = field_value.strip()
                    for k, v in field_values.items():
                        if k in ["model", "part_number", "relationship_name"]:
                            continue
                        if k == field_name:
                            local_field_names.add(k)
                            if str(v) == str(field_value):
                                local_field_values.add(k)
                            break
            
            if node.get("children"):
                for child_key, child_node in node.get("children", {}).items():
                    child_path = f"{path} > {child_key}" if path else child_key
                    check_node(child_node, child_path, local_field_names, local_field_values)
            else:
                field_name_match_count = len(local_field_names)
                field_value_match_count = len(local_field_values)
                relevant_field_count = len([f for f in field_values if f not in ["model", "part_number", "relationship_name"]])
                completeness = (field_value_match_count / relevant_field_count) if relevant_field_count else 0
                
                if field_name_match_count > 0:
                    results.append({
                        "path": path,
                        "entity_info": {"completeness": completeness},
                        "score": completeness,
                        "search_type": "structured",
                        "field_name_match_count": field_name_match_count,
                        "field_value_match_count": field_value_match_count
                    })
        
        roots = self.taxonomy_data.get("roots", self.taxonomy_data)
        for root_key, root_node in roots.items():
            check_node(root_node, path=root_key)
        
        return results
    
    def _format_triple_to_sentence(self, triple_info: Dict[str, Any]) -> str:
        """將三元組格式化為句子"""
        field_texts = []
        for field, value in triple_info["entities"].items():
            if field.lower() in ["model", "part_number", "relationship_name"]:
                continue
            field_texts.append(f"{field}: {value}")
        return " | ".join(field_texts)
    


    def _combine_results(self, vector_results: List[Dict], struct_results: List[Dict], top_n: int, triple_info: Dict = None) -> List[Dict]:
        """合併向量搜尋和結構化搜尋結果"""
        # 先進行細篩
        if vector_results and triple_info:
            # Part 1: 欄位名+β/α 細篩
            part1_all = self._fine_filter_core_fields_part1(
                triple_info=triple_info,
                coarse_results=vector_results,
                top_n=None
            )
            
            # Part 2: 欄位值 mix 推擠
            mix_results = self._fine_filter_core_fields_part2(
                query_triple=triple_info,
                coarse_results=part1_all,
                top_n=top_n,
                w_part1=0.6, w_value=0.4
            )
            
            return mix_results
        
        # 如果沒有向量結果或三元組資訊，直接合併
        combined = []
        for result in vector_results:
            combined.append({
                **result,
                "combined_score": result.get("combined_score", result.get("score", 0))
            })
        
        for result in struct_results:
            combined.append({
                **result,
                "combined_score": result["score"] * 0.3
            })
        
        return combined
    
    def _levenshtein_distance(self, a: str, b: str) -> int:
        """計算編輯距離"""
        n, m = len(a), len(b)
        if n > m:
            a, b = b, a
            n, m = m, n
        current_row = list(range(n + 1))
        for i in range(1, m + 1):
            previous_row, current_row = current_row, [i] + [0] * n
            for j in range(1, n + 1):
                add = previous_row[j] + 1
                delete = current_row[j - 1] + 1
                change = previous_row[j - 1]
                if a[j - 1] != b[i - 1]:
                    change += 1
                current_row[j] = min(add, delete, change)
        return current_row[n]
    
    def _filter_candidate_text(self, entity_info):
        """從候選結果的 entity_info 過濾文本"""
        filtered_fields = [f"{k}: {v}" for k, v in entity_info.items() 
                          if k.lower() not in ["model", "part_number", "relationship_name"]]
        return " | ".join(filtered_fields)
    
    def _deduplicate_and_sort(self, results: List[Dict], top_n: int) -> List[Dict]:
        """去重並排序結果"""
        seen_paths = set()
        unique_results = []
        
        for result in results:
            path = result.get("path", "")
            if path not in seen_paths:
                seen_paths.add(path)
                unique_results.append(result)
        
        unique_results.sort(key=lambda x: x.get("combined_score", 0), reverse=True)
        return unique_results[:top_n]
    
    @lru_cache(maxsize=100_000)
    def encode_cached(self, text: str):
        """向量編碼快取"""
        return self.st_model.encode(text, show_progress_bar=False)
    
    def _initialize_vector_index(self):
        """初始化向量索引"""
        if not self.es_client or not self.st_model:
            logging.warning("缺少 Elasticsearch 客戶端或 SentenceTransformer 模型，跳過向量索引初始化")
            return
            
        try:
            # 檢查是否需要重建索引
            rebuild_needed = self._check_rebuild_needed()
            
            if rebuild_needed:
                logging.info("重建知識圖譜向量索引...")
                self._build_vector_index()
            else:
                logging.info("使用現有向量索引")
        except Exception as e:
            logging.error(f"初始化向量索引失敗: {e}")

    def _check_rebuild_needed(self) -> bool:
        """檢查是否需要重建索引"""
        import os
        
        if not self.es_client.indices.exists(index=self.index_name):
            return True
            
        # 檢查檔案修改時間
        json_mtime = os.path.getmtime(self.taxonomy_path)
        info = self.es_client.indices.get(index=self.index_name)
        idx_create_ms = int(info[self.index_name]["settings"]["index"]["creation_date"])
        idx_create_sec = idx_create_ms / 1000
        
        return json_mtime > idx_create_sec

    def _build_vector_index(self):
        """建立向量索引"""
        # 提取葉節點
        all_leaves = self._extract_entity_leaves()
        
        # 準備實體文本
        entity_texts, leaves_to_encode = self._prepare_entity_texts(all_leaves)
        
        if not entity_texts:
            logging.warning("沒有找到可編碼的實體")
            return
        
        # 編碼向量
        vectors = self.st_model.encode(
            entity_texts,
            batch_size=64,
            convert_to_numpy=True,
            show_progress_bar=True
        )
        
        # 重建索引
        self.es_client.indices.delete(index=self.index_name, ignore_unavailable=True)
        self.es_client.indices.create(
            index=self.index_name,
            mappings={
                "properties": {
                    "entity_vector": {
                        "type": "dense_vector",
                        "dims": 768,
                        "index": True,
                        "similarity": "cosine"
                    }
                }
            }
        )
        
        # 批次寫入
        operations = []
        for vec, leaf, text in zip(vectors, leaves_to_encode, entity_texts):
            operations.append({"index": {"_index": self.index_name}})
            operations.append({
                "entity_text": text,
                "entity_vector": vec.tolist(),
                "entity_info": leaf["entity_info"],
                "path": leaf["path"]
            })
        
        # 分批寫入
        chunk_size = 1000
        for i in range(0, len(operations), chunk_size):
            self.es_client.bulk(body=operations[i:i + chunk_size], refresh=False)
        
        self.es_client.indices.refresh(index=self.index_name)
        logging.info(f"向量索引建立完成，共寫入 {len(leaves_to_encode)} 筆實體")

    def _extract_entity_leaves(self) -> List[Dict[str, Any]]:
        """提取知識圖譜的葉節點"""
        all_leaves = []
        
        def extract_entity_info_from_node(node):
            """從節點提取實體信息"""
            result = {}
            valid_structure = False
            if "name" in node:
                name_parts = node["name"].split(" ", 1)
                if len(name_parts) == 2:
                    field_name, field_value = name_parts
                    result[field_name] = field_value
                    if not field_name.startswith("entity_name") and not field_name.startswith("relationship_name"):
                        valid_structure = True
            if "relationship_name" in node:
                result["relationship_name"] = node["relationship_name"]
            has_valid_children = False
            child_info = {}
            for child_key, child_node in node.get("children", {}).items():
                child_result = extract_entity_info_from_node(child_node)
                if child_result:
                    child_info.update(child_result)
                    has_valid_children = True
            result.update(child_info)
            for tag in node.get("tags", []):
                if tag.startswith("target "):
                    target_value = tag.replace("target ", "", 1)
                    result["target"] = target_value
            if valid_structure or has_valid_children:
                return result
            if all(k.startswith(("entity_name", "relationship_name")) for k in result.keys()):
                return {}
            return result
        
        def find_entity_leaves(node, cur_path: str = "", acc_info: Dict[str, str] = None):
            if acc_info is None:
                acc_info = {}
            node_name = node.get("name", "").strip()
            path_here = f"{cur_path} > {node_name}" if cur_path else node_name
            
            merged_info = {**acc_info, **extract_entity_info_from_node(node)}
            children = node.get("children", {})
            if not children:
                # 至少要有 1 個意義欄位才算可用
                meaningful = [k for k in merged_info
                            if not k.lower().startswith(("entity_name", "relationship_name"))]
                if len(meaningful) >= 1:
                    all_leaves.append({"path": path_here, "entity_info": merged_info})
                return
            for _, ch in children.items():
                find_entity_leaves(ch, path_here, merged_info)
        
        roots = self.taxonomy_data.get("roots", self.taxonomy_data)
        for root_key, root_node in roots.items():
            find_entity_leaves(root_node, root_key)
        
        return all_leaves

    def _prepare_entity_texts(self, all_leaves: List[Dict[str, Any]]) -> Tuple[List[str], List[Dict[str, Any]]]:
        """準備實體文本"""
        entity_texts, leaves_to_encode = [], []
        for leaf in all_leaves:
            info = leaf["entity_info"]
            # 組合關鍵欄位文字
            field_texts = [f"{k}: {v}" for k, v in info.items()
                        if k.lower() not in ("relationship_name",) and
                            not k.lower().startswith("entity_name")]
            if "relationship_name" in info:
                field_texts.append(f"relationship_name: {info['relationship_name']}")
            if "target" in info:
                field_texts.append(f"target: {info['target']}")
            
            if len(field_texts) < 2:
                continue  # 太少資訊，索性跳過
            text = " | ".join(field_texts)
            entity_texts.append(text)
            leaves_to_encode.append(leaf)
        
        return entity_texts, leaves_to_encode


    # ========== 原方法的核心函數 ==========
    
    def _process_triple_with_taxonomy_vectors(self, triple_info: Dict[str, Any], taxonomy_data: Dict[str, Any], top_n: int = 10) -> List[Dict[str, Any]]:
        """主流程：結合粗篩與細篩"""
        print(f"\n=== 處理三元組: {triple_info.get('original_triple', 'N/A')} ===")
        print("\n三元組句子表示:", self._format_triple_to_sentence(triple_info))

        # 1) 粗篩拿更多筆
        print("\n[粗篩] 執行向量相似度匹配...")
        coarse_results = self._search_taxonomy_vector_similarity_with_edit_distance(
            triple_info,
            top_n=50,          # 改 50
            re_rank_top_k=100  # 改 100
        )
        
        # self._display_vector_results_with_edit_distance(coarse_results, top_n=20)

        # 2) Part 1: 既有的欄位名+β/α 細篩，先全部回來
        print("\n[細篩 Part 1] 核心欄位比對...")
        part1_all = self._fine_filter_core_fields_part1(    # 原本的細篩函式
            triple_info,
            coarse_results,
            top_n=None                       # None = 全部都回來
        )

        # 3) Part 2: 欄位值 mix 推擠
        print("\n[細篩 Part 2] 參數值相似度推擠...")
        mix_results = self._fine_filter_core_fields_part2(
            query_triple=triple_info,
            coarse_results=part1_all,      # 接 Part 1 的輸出
            top_n=20,                       # 最後要 Top 20
            w_part1=0.6, w_value=0.4        # 權重可再微調
        )

        # 4) 印出最終 mix 結果
        # print(f"\n=== Mix 後排名 Top {len(mix_results)} ===")
        # for i, res in enumerate(mix_results, start=1):
        #     print(f"\nMix 匹配 #{i} [mix_score={res['mix_score']:.4f}]:")
        #     print(f"  - 實體文本: {res['entity_text']}")
        #     print(f"  - 路徑: {res['path']}")
        #     print("  - 實體信息:")
        #     for field, value in res["entity_info"].items():
        #         print(f"    * {field}: {value}")
        
        print("\n[結構化比對] taxonomy tree …")
        struct_matches = self._match_triple_to_taxonomy(triple_info)
        top_struct = (struct_matches["full_matches"] +
                      struct_matches["partial_matches"])[:20]
        for i, m in enumerate(top_struct, 1):
            print(f"Triple #{i} | completeness={m['completeness']:.1%}")
            print("  path :", m['path'])
        
        return mix_results, top_struct

    def _search_taxonomy_vector_similarity_with_edit_distance(self, triple_info: Dict[str, Any], top_n: int = 50, re_rank_top_k: int = 100) -> List[Dict[str, Any]]:
        """使用向量相似度和編輯距離搜尋 - 完全按照原方法"""
        query_text = self._format_triple_to_sentence(triple_info)
       
        query_vector = self.encode_cached(query_text).tolist()  
        query_clause = {"match_all": {}}  # 原方法中沒有 branch_filter
        
        response = self.es_client.search(
            index="kg_taxonomy_index",
            body={
                "query": {
                    "script_score": {
                        "query": query_clause,
                        "script": {
                            "source": "cosineSimilarity(params.query_vector, 'entity_vector')",
                            "params": {"query_vector": query_vector}
                        }
                    }
                },
                "size": re_rank_top_k
            }
        )
        
        filtered_query_keys = set(k for k in triple_info["entities"].keys() 
                                 if k.lower() not in ["model", "part_number", "relationship_name"])
        hits = response['hits']['hits']
        re_ranked = []
        
        for hit in hits:
            source = hit['_source']
            es_score = hit['_score']
            candidate_entity_info = source.get('entity_info', {})
            filtered_candidate_text = self._filter_candidate_text(candidate_entity_info)
            ld = self._levenshtein_distance(query_text.lower(), filtered_candidate_text.lower())
            max_len = max(len(query_text), len(filtered_candidate_text))
            text_sim = 1.0 - (ld / max_len) if max_len > 0 else 0.0
            candidate_keys = set(k for k in candidate_entity_info.keys() 
                               if k.lower() not in ["model", "part_number", "relationship_name"])
            common_ratio = len(filtered_query_keys.intersection(candidate_keys)) / (len(filtered_query_keys) if filtered_query_keys else 1)
            bonus = 0.1 * common_ratio * es_score
            combined_score = (0.7 * es_score) + (0.3 * (text_sim * es_score)) + bonus
            
            re_ranked.append({
                "entity_text": source.get('entity_text', ''),
                "entity_info": candidate_entity_info,
                "path": source.get("path", "").strip().lower(),
                "es_score": es_score,
                "edit_distance": ld,
                "text_similarity": text_sim,
                "combined_score": combined_score
            })
        
        re_ranked.sort(key=lambda d: d["combined_score"], reverse=True)
        deduped = self._deduplicate_coverage_candidates(re_ranked, score_key="combined_score")
        
        final_list = deduped.copy()
        for candidate in re_ranked:
            if len(final_list) >= top_n:
                break
            if not any(self._is_path_subset(candidate["path"], exist["path"]) for exist in final_list):
                final_list.append(candidate)
        
        final_list.sort(key=lambda d: d["combined_score"], reverse=True)
        return final_list[:top_n]

    def _display_vector_results_with_edit_distance(self, results: List[Dict[str, Any]], top_n: int = 20):
        """顯示向量搜尋結果 - 完全按照原方法"""
        if not results:
            print("未找到相似實體")
            return
        print(f"\n=== 知識圖譜向量相似度 + 編輯距離 結合排名 Top {len(results)} ===")
        for i, result in enumerate(results):
            print(f"\n匹配 #{i+1} [combined_score={result['combined_score']:.4f}] "
                  f"(ES分數={result['es_score']:.4f}, 編輯距離={result['edit_distance']}, "
                  f"文字相似度={result['text_similarity']:.4f}):")
            print(f"  - 實體文本: {result['entity_text']}")
            path = result['path']
            print(f"  - 路徑: {path}")
            print("  - 實體信息:")
            for field, value in result['entity_info'].items():
                print(f"    * {field}: {value}")

    def _fine_filter_core_fields_part1(self, triple_info: Dict[str, Any], coarse_results: List[Dict[str, Any]], top_n: int = 20, alpha: float = 0.6, beta: float = 0.4) -> List[Dict[str, Any]]:
        """細篩 Part 1: 基於欄位覆蓋率的初步細篩 - 完全按照原方法"""
        q_fields = {f: v for f, v in triple_info["entities"].items()
                    if f.lower() not in ["model","part_number","relationship_name"]}
        Q = len(q_fields)

        for cand in coarse_results:
            c_fields = {f: v for f, v in cand["entity_info"].items()
                        if f.lower() not in ["model","part_number","relationship_name"]}

            # ----- 1) 欄位名稱覆蓋率 -----
            common = set(q_fields).intersection(c_fields)
            coverage_score = len(common) / (Q or 1)          # 0‑1

            # ----- 2) 欄位值平均相似度 -----
            if common:
                sims = [self._text_sim(f"{f}:{q_fields[f]}", f"{f}:{c_fields[f]}")
                        for f in common]
                value_score = sum(sims) / len(sims)          # 0‑1
            else:
                value_score = 0.0

            # ----- 3) 路徑深度小獎勳 (對所有候選一致) -----
            depth_bonus = 0.02 * math.log2(len(cand["path"].split(">")) + 1)

            cand["fine_score"] = (
                alpha * coverage_score +
                beta  * value_score   +
                depth_bonus
            )

        return sorted(coarse_results,
                      key=lambda x:(x["fine_score"], x["combined_score"]),
                      reverse=True)[:top_n]

    def _fine_filter_core_fields_part2(self, query_triple: Dict[str, Any], coarse_results: List[Dict[str, Any]], top_n: int = 10, w_part1: float = 0.6, w_value: float = 0.4) -> List[Dict[str, Any]]:
        """細篩 Part 2: 基於參數值的進階細篩 - 完全按照原方法"""
        # -------------------- 先拿 Part 1 分 --------------------
        part1_scored = self._fine_filter_core_fields_part1(   
            query_triple, coarse_results, top_n=None)   

        # -------------------- 準備使用者「值」字典 ----------------
        user_value_dict = {k: v for k, v in query_triple["entities"].items()
                           if k.lower() not in ["model","part_number","relationship_name"]}

        # -------------------- Part 2 逐筆計分 --------------------
        for cand in part1_scored:
            cand_values = {k: v for k, v in cand["entity_info"].items()
                           if k.lower() not in ["model","part_number","relationship_name"]}
            value_score = self._boost_by_param_values(user_value_dict, cand_values)
            cand["mix_score"] = (
                w_part1 * cand["fine_score"] +     # 來自 Part1
                w_value  * value_score
            )

        # -------------------- 回傳最終排名 --------------------
        part1_scored.sort(key=lambda x: x["mix_score"], reverse=True)
        return part1_scored[:top_n]

    def _boost_by_param_values(self, user_params: Dict[str, str], cand_info: Dict[str, str]) -> float:
        """參數值相似度加權 - 完全按照原方法"""
        scores = []
        for q_val in user_params.values():
            # 跟候選所有 value 一一比，取最高分
            best = 0.0
            for c_val in cand_info.values():
                sim = self._value_similarity(str(q_val), str(c_val))
                if sim > best:
                    best = sim
                if best == 1.0:          # 已滿分可 break
                    break
            scores.append(best)

        # 平均分（若沒有值可比就給 0）
        return sum(scores) / len(scores) if scores else 0.0

    def _value_similarity(self, q_val: str, cand_val: str, high: float = 0.8, low: float = 0.2) -> float:
        """單一值相似度計算 - 完全按照原方法"""
        # 1) 部分字串直接滿分
        if q_val in cand_val or cand_val in q_val:
            return 1.0

        cos = self._cosine(
            self.encode_cached(q_val),
            self.encode_cached(cand_val)
        )
        # 線性壓縮到 0‑1；過低/過高直接拉到邊界讓分數更乾脆
        if cos >= high:
            return 1.0
        elif cos <= low:
            return 0.0
        else:
            # 把區間 [low, high] 映射到 [0.3, 0.9]，避免太稀
            return 0.3 + 0.6 * (cos - low) / (high - low)

    def _compute_cosine_similarity(self, vec1, vec2) -> float:
        """計算餘弦相似度 - 完全按照原方法"""
        return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2) + 1e-10)

    def _text_sim(self, a: str, b: str) -> float:
        """文本相似度計算 - 完全按照原方法"""
        cos = self._cosine(self.encode_cached(a), self.encode_cached(b))
        ld = self._levenshtein_distance(a.lower(), b.lower())
        edit = 1.0 - ld / max(len(a), len(b))
        return 0.5 * cos + 0.5 * edit

    def _cosine(self, u, v) -> float:
        """餘弦相似度 - 完全按照原方法"""
        return np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v) + 1e-10)

    def _deduplicate_coverage_candidates(self, candidates: List[Dict[str, Any]], score_key: str = "combined_score") -> List[Dict[str, Any]]:
        """去重候選結果 - 完全按照原方法"""
        final = []
        for candidate in candidates:
            duplicate_found = False
            for i, existing in enumerate(final):
                if self._is_path_subset(candidate["path"], existing["path"]):
                    if candidate[score_key] > existing[score_key]:
                        final[i] = candidate
                    duplicate_found = True
                    break
            if not duplicate_found:
                final.append(candidate)
        final.sort(key=lambda x: x[score_key], reverse=True)
        return final

    def _is_path_subset(self, path1: str, path2: str) -> bool:
        """檢查路徑子集關係 - 完全按照原方法"""
        tokens1 = path1.split(">")
        tokens2 = path2.split(">")
        
        def is_sublist(sub, full):
            sub_len = len(sub)
            full_len = len(full)
            if sub_len > full_len:
                return False
            for i in range(full_len - sub_len + 1):
                if full[i:i+sub_len] == sub:
                    return True
            return False
        
        return is_sublist(tokens1, tokens2) or is_sublist(tokens2, tokens1)

    def _match_triple_to_taxonomy(self, triple_info: Dict[str, Any]) -> Dict[str, Any]:
        """結構化匹配 - 完全照原方法遞迴比對 taxonomy tree"""
        field_values = triple_info["entities"].copy()
        field_values["relationship_name"] = triple_info["relation"]

        all_fields = list(field_values.keys())
        skip_fields = ['model', 'part_number', 'relationship_name']
        priority_fields = [field for field in all_fields if field not in skip_fields]

        results = {
            "full_matches": [],
            "partial_matches": [],
            "field_name_matches": []
        }

        def check_node(node, path="", matched_field_names=None, matched_field_values=None):
            if matched_field_names is None:
                matched_field_names = set()
            if matched_field_values is None:
                matched_field_values = set()

            local_field_names = set(matched_field_names)
            local_field_values = set(matched_field_values)

            node_name = node.get("name", "")
            if isinstance(node_name, str):
                parts = node_name.split(" ", 1)
                if len(parts) == 2:
                    field_name, field_value = parts
                    field_name = field_name.strip()
                    field_value = field_value.strip()
                    for k, v in field_values.items():
                        if k in skip_fields:
                            continue
                        if k == field_name:
                            local_field_names.add(k)
                            if str(v) == str(field_value):
                                local_field_values.add(k)
                            break

            if node.get("children"):
                for child_key, child_node in node.get("children", {}).items():
                    child_path = f"{path} > {child_key}" if path else child_key
                    check_node(child_node, child_path, local_field_names, local_field_values)
            else:
                field_name_match_count = len(local_field_names)
                field_value_match_count = len(local_field_values)
                relevant_field_count = len([f for f in field_values if f not in skip_fields])
                completeness = (field_value_match_count / relevant_field_count) if relevant_field_count else 0
                if field_name_match_count > 0:
                    match_info = {
                        "path": path,
                        "node": node,
                        "field_name_match_count": field_name_match_count,
                        "field_value_match_count": field_value_match_count,
                        "completeness": completeness,
                    }
                    if completeness >= 0.9:
                        results["full_matches"].append(match_info)
                    else:
                        results["partial_matches"].append(match_info)

        if "roots" in self.taxonomy_data:
            for root_key, root_node in self.taxonomy_data["roots"].items():
                check_node(root_node, path=root_key)
        else:
            for key, node in self.taxonomy_data.items():
                check_node(node, path=key)

        results["full_matches"].sort(
            key=lambda x: (x["field_name_match_count"], x["field_value_match_count"]),
            reverse=True
        )
        results["partial_matches"].sort(
            key=lambda x: (x["field_name_match_count"], x["field_value_match_count"]),
            reverse=True
        )

        return results