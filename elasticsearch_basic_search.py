# -*- coding: utf-8 -*-
"""
Created on Thu Jan 11 22:43:25 2024

@author: vinsent825
"""

from elasticsearch import Elasticsearch


username = "elastic"
password = "elastic"


# 假設您的Elasticsearch運行在本地的9200端口，並使用HTTPS協議
es = Elasticsearch(
    ["https://localhost:9200"],
    basic_auth=(username, password),
    verify_certs=False  # 繼續禁用SSL證書驗證（僅建議用於測試環境）
)


 


def basic_search(query, fields):
    response = es.search(
        index="news",  # 替换为你的索引名
        query={
            "multi_match": {
                "query": query,
                "fields": fields
            }
        }
    )
    return response

# 帶有權重提升的查詢
def boosted_search(query, fields, boost_field, boost_value):
    response = es.search(
        index="news",
        body={
            "query": {
                "multi_match": {
                    "query": query,
                    "fields": [f"{field}^{boost_value}" if field == boost_field else field for field in fields]
                }
            }
        }
    )
    return response

# 模糊查詢
def fuzzy_search(query, fields, fuzziness):
    response = es.search(
        index="news",
        body={
            "query": {
                "multi_match": {
                    "query": query,
                    "fields": fields,
                    "fuzziness": fuzziness
                }
            }
        }
    )
    return response



# 定義索引的映射（mapping）
index_mapping = {
    "mappings": {
        "properties": {
            "headline": {"type": "text"},
            "short_description": {"type": "text"}
        }
    }
}

# 創建索引（如果不存在）
if not es.indices.exists(index="news"):
    es.indices.create(index="news", body=index_mapping)
    print("索引 'news' 已創建")
else:
    print("索引 'news' 已存在")



# # 删除旧索引（谨慎操作，这将删除索引及其所有数据）
# if es.indices.exists(index="news"):
#     es.indices.delete(index="news")
    
# # 创建新索引
# es.indices.create(index="news", body=index_mapping)

    




# 文章內容的示例
article = {
    "headline": "Breaking News",
    "short_description": "This is a 三明治robbery breaking news article 文章.",
    "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ... (文章內容)"
}

# 添加文章到索引
es.index(index="news", body=article)


es.indices.refresh(index="news")

# 例如：進行基本搜索
# result = basic_search("robbery", ["headline", "short_description"])
result = basic_search("明治", ["headline", "short_description"])
   
print(result)