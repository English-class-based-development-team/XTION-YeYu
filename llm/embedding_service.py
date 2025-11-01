# -*- coding: utf-8 -*-
"""
向量化服务
使用 SiliconFlow Embedding API 将文本转换为向量
"""

import requests
import numpy as np
from typing import List, Dict

try:
    from . import config
except ImportError:
    import config


class EmbeddingService:
    """向量化服务类"""

    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or config.SILICONFLOW_API_KEY
        self.model = model or config.EMBEDDING_MODEL
        self.api_url = config.SILICONFLOW_EMBEDDING_URL

    def embed_text(self, text: str) -> np.ndarray:
        result = self.embed_texts([text])
        return result[0] if result else None

    def embed_texts(self, texts: List[str]) -> List[np.ndarray]:
        if not texts:
            return []

        payload = {
            "model": self.model,
            "input": texts
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        try:
            resp = requests.post(self.api_url, json=payload, headers=headers, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            embeddings: List[np.ndarray] = []
            for item in data.get("data", []):
                emb = np.asarray(item["embedding"], dtype=np.float32)
                embeddings.append(emb)
            return embeddings
        except requests.exceptions.RequestException as e:
            print(f"向量化请求失败: {e}")
            return []
        except (KeyError, TypeError, ValueError) as e:
            print(f"向量化响应解析错误: {e}")
            return []

    def embed_post(self, emotion_tag: str, emotion_intensity: int, content: str) -> np.ndarray:
        combined = f"[{emotion_tag}] 强度:{emotion_intensity} {content}"
        return self.embed_text(combined)

    def embed_posts_batch(self, posts: List[Dict]) -> List[np.ndarray]:
        combined_texts: List[str] = []
        for p in posts:
            combined_texts.append(f"[{p['emotion_tag']}] 强度:{p['emotion_intensity']} {p['content']}")
        return self.embed_texts(combined_texts)

    def get_embedding_dimension(self) -> int:
        test = self.embed_text("测试")
        return int(test.shape[0]) if isinstance(test, np.ndarray) else 0


_embedding_service = None


def get_embedding_service() -> EmbeddingService:
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service


