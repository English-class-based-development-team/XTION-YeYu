# -*- coding: utf-8 -*-
"""
FAISS 向量存储管理
管理全局和用户私有的 FAISS 索引
"""

import os
import json
from typing import List, Dict, Optional, Tuple
from datetime import datetime

import numpy as np
import faiss

try:
    from . import config
    from .embedding_service import get_embedding_service
except ImportError:
    import config
    from embedding_service import get_embedding_service


class VectorStore:
    def __init__(self, index_path: str, dimension: int):
        self.index_path = index_path
        self.dimension = dimension
        self.index: Optional[faiss.Index] = None
        self.metadata: List[Dict] = []
        self.meta_path = f"{index_path}.meta.json"
        self._load_or_create_index()

    def _load_or_create_index(self):
        index_file = f"{self.index_path}.index"
        if os.path.exists(index_file) and os.path.exists(self.meta_path):
            try:
                self.index = faiss.read_index(index_file)
                with open(self.meta_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                return
            except Exception as e:
                print(f"加载索引失败，将创建新索引: {e}")

        # 默认使用内积（配合 L2 归一化实现余弦相似度）
        self.index = faiss.IndexFlatIP(self.dimension)
        self.metadata = []

    def _maybe_adjust_dimension(self, new_dim: int):
        """当传入向量维度与索引维度不一致时的处理。

        - 如果索引为空（未存任何向量且无元数据），则重建索引为新维度；
        - 否则抛出异常，避免破坏已建立的索引结构。
        """
        if new_dim != self.dimension:
            if (self.index is None) or (self.index.ntotal == 0 and len(self.metadata) == 0):
                # 重建索引为新维度
                self.dimension = new_dim
                self.index = faiss.IndexFlatIP(self.dimension)
                return
            raise ValueError(f"向量维度 {new_dim} 与索引维度 {self.dimension} 不一致")

    def add_vector(
        self,
        vector: np.ndarray,
        user_id: str,
        username: str,
        timestamp: str,
        emotion_tag: str,
        emotion_intensity: int,
        content: str,
    ) -> int:
        vec = np.asarray(vector, dtype=np.float32).reshape(1, -1)
        # 动态校正维度（仅当索引为空时允许重建）
        self._maybe_adjust_dimension(vec.shape[1])
        faiss.normalize_L2(vec)
        self.index.add(vec)
        vid = len(self.metadata)
        self.metadata.append(
            {
                "id": vid,
                "user_id": user_id,
                "username": username,
                "timestamp": timestamp,
                "emotion_tag": emotion_tag,
                "emotion_intensity": emotion_intensity,
                "content": content,
            }
        )
        return vid

    def add_vectors_batch(self, vectors: np.ndarray, posts: List[Dict]) -> List[int]:
        vecs = np.asarray(vectors, dtype=np.float32)
        if vecs.ndim == 1:
            vecs = vecs.reshape(1, -1)
        # 动态校正维度（仅当索引为空时允许重建）
        self._maybe_adjust_dimension(vecs.shape[1])
        faiss.normalize_L2(vecs)
        self.index.add(vecs)
        ids: List[int] = []
        for p in posts:
            vid = len(self.metadata)
            ids.append(vid)
            self.metadata.append(
                {
                    "id": vid,
                    "user_id": p["user_id"],
                    "username": p["username"],
                    "timestamp": p["timestamp"],
                    "emotion_tag": p["emotion_tag"],
                    "emotion_intensity": p["emotion_intensity"],
                    "content": p["content"],
                }
            )
        return ids

    def search(self, query_vector: np.ndarray, k: int = 5, filter_user_id: Optional[str] = None) -> List[Dict]:
        if self.index.ntotal == 0:
            return []
        q = np.asarray(query_vector, dtype=np.float32).reshape(1, -1)
        faiss.normalize_L2(q)
        search_k = min(k * 10, self.index.ntotal) if filter_user_id else k
        distances, indices = self.index.search(q, search_k)
        results: List[Dict] = []
        for i, idx in enumerate(indices[0]):
            if idx < 0:
                continue
            meta = self.metadata[idx]
            if filter_user_id and meta["user_id"] != filter_user_id:
                continue
            r = dict(meta)
            r["similarity"] = float(distances[0][i])
            results.append(r)
            if len(results) >= k:
                break
        return results

    def save(self):
        os.makedirs(os.path.dirname(self.index_path) or ".", exist_ok=True)
        index_file = f"{self.index_path}.index"
        faiss.write_index(self.index, index_file)
        with open(self.meta_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, ensure_ascii=False, indent=2)

    def get_stats(self) -> Dict:
        return {
            "total_vectors": int(self.index.ntotal) if self.index else 0,
            "dimension": int(self.dimension),
            "index_path": self.index_path,
            "metadata_count": len(self.metadata),
        }


class VectorStoreManager:
    def __init__(self, base_path: str = None, dimension: int = 768):
        self.base_path = base_path or config.VECTOR_DB_PATH
        # 如果未提供或提供非法维度，尝试从嵌入服务获取；失败则回退 768
        if not isinstance(dimension, int) or dimension <= 0:
            try:
                detected = get_embedding_service().get_embedding_dimension()
                self.dimension = int(detected) if detected and detected > 0 else 768
            except Exception:
                self.dimension = 768
        else:
            self.dimension = dimension
        os.makedirs(self.base_path, exist_ok=True)
        self.global_store = VectorStore(os.path.join(self.base_path, "global"), self.dimension)
        self.user_stores: Dict[str, VectorStore] = {}
        self.embedding_service = get_embedding_service()

    def get_user_store(self, user_id: str) -> VectorStore:
        if user_id not in self.user_stores:
            self.user_stores[user_id] = VectorStore(os.path.join(self.base_path, f"user_{user_id}"), self.dimension)
        return self.user_stores[user_id]

    def add_post_to_global(self, user_id: str, username: str, emotion_tag: str, emotion_intensity: int, content: str, timestamp: str = None) -> int:
        if timestamp is None:
            timestamp = datetime.now().isoformat()
        vector = self.embedding_service.embed_post(emotion_tag, emotion_intensity, content)
        if vector is None:
            raise ValueError("向量化失败")
        vid = self.global_store.add_vector(vector, user_id, username, timestamp, emotion_tag, emotion_intensity, content)
        self.global_store.save()
        return vid

    def add_post_to_user(self, user_id: str, username: str, emotion_tag: str, emotion_intensity: int, content: str, timestamp: str = None) -> int:
        if timestamp is None:
            timestamp = datetime.now().isoformat()
        vector = self.embedding_service.embed_post(emotion_tag, emotion_intensity, content)
        if vector is None:
            raise ValueError("向量化失败")
        store = self.get_user_store(user_id)
        vid = store.add_vector(vector, user_id, username, timestamp, emotion_tag, emotion_intensity, content)
        store.save()
        return vid

    def add_post(self, user_id: str, username: str, emotion_tag: str, emotion_intensity: int, content: str, timestamp: str = None) -> Tuple[int, int]:
        gid = self.add_post_to_global(user_id, username, emotion_tag, emotion_intensity, content, timestamp)
        uid = self.add_post_to_user(user_id, username, emotion_tag, emotion_intensity, content, timestamp)
        return gid, uid

    def search_global(self, emotion_tag: str, emotion_intensity: int, content: str, k: int = 5) -> List[Dict]:
        q = self.embedding_service.embed_post(emotion_tag, emotion_intensity, content)
        if q is None:
            return []
        return self.global_store.search(q, k)

    def search_user(self, user_id: str, emotion_tag: str, emotion_intensity: int, content: str, k: int = 5) -> List[Dict]:
        store = self.get_user_store(user_id)
        if store.index.ntotal == 0:
            return []
        q = self.embedding_service.embed_post(emotion_tag, emotion_intensity, content)
        if q is None:
            return []
        return store.search(q, k)

    def get_stats(self) -> Dict:
        return {
            "global": self.global_store.get_stats(),
            "user_stores": len(self.user_stores),
            "base_path": self.base_path,
        }


_vector_store_manager: Optional[VectorStoreManager] = None


def get_vector_store_manager(dimension: int = None) -> VectorStoreManager:
    global _vector_store_manager
    if _vector_store_manager is None:
        if dimension is None:
            dimension = get_embedding_service().get_embedding_dimension() or 768
        _vector_store_manager = VectorStoreManager(dimension=dimension)
    return _vector_store_manager


