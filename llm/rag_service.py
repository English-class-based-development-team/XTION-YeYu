"""
RAG 检索服务
提供共鸣推荐和长期记忆功能
"""

from typing import List, Dict, Optional
from datetime import datetime

try:
    from .vector_store import get_vector_store_manager
    from .database import get_db_manager
    from .crud import PostCRUD
except ImportError:
    from vector_store import get_vector_store_manager
    from database import get_db_manager
    from crud import PostCRUD


class RAGService:
    """RAG 检索服务类"""
    
    def __init__(self):
        """初始化 RAG 服务"""
        self.vector_manager = None  # 延迟初始化
        self.db_manager = get_db_manager()
    
    def _ensure_vector_manager(self):
        """确保向量管理器已初始化"""
        if self.vector_manager is None:
            self.vector_manager = get_vector_store_manager()
    
    def index_post(
        self,
        user_id: str,
        username: str,
        emotion_tag: str,
        emotion_intensity: int,
        content: str,
        timestamp: str = None
    ) -> Dict:
        """
        索引帖子（添加到全局和用户私有索引）
        
        Args:
            user_id: 用户 ID
            username: 用户名
            emotion_tag: 情感标签
            emotion_intensity: 情绪强度
            content: 帖子内容
            timestamp: 发帖时间
        
        Returns:
            索引结果
        """
        self._ensure_vector_manager()
        
        if timestamp is None:
            timestamp = datetime.now().isoformat()
        
        try:
            # 添加到向量索引
            global_id, user_id_vec = self.vector_manager.add_post(
                user_id, username, emotion_tag, emotion_intensity, content, timestamp
            )
            
            return {
                'success': True,
                'global_vector_id': global_id,
                'user_vector_id': user_id_vec,
                'message': '索引添加成功'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': '索引添加失败'
            }
    
    def find_resonance_posts(
        self,
        emotion_tag: str,
        emotion_intensity: int,
        content: str,
        limit: int = 5,
        exclude_user_id: str = None
    ) -> List[Dict]:
        """
        查找共鸣帖子（从全局索引搜索）
        
        Args:
            emotion_tag: 情感标签
            emotion_intensity: 情绪强度
            content: 帖子内容
            limit: 返回数量
            exclude_user_id: 排除特定用户（通常是当前用户）
        
        Returns:
            相似帖子列表（完整六字段 + 相似度）
        """
        self._ensure_vector_manager()
        
        try:
            # 从全局索引搜索
            # 如果需要排除用户，搜索更多结果后过滤
            search_limit = limit * 3 if exclude_user_id else limit
            
            results = self.vector_manager.search_global(
                emotion_tag, emotion_intensity, content, k=search_limit
            )
            
            # 过滤排除的用户
            if exclude_user_id:
                results = [r for r in results if r['user_id'] != exclude_user_id]
                results = results[:limit]
            
            return results
            
        except Exception as e:
            print(f"共鸣推荐搜索失败: {e}")
            return []
    
    def find_user_memories(
        self,
        user_id: str,
        emotion_tag: str = None,
        emotion_intensity: int = None,
        content: str = None,
        limit: int = 5,
        offset: int = 0
    ) -> List[Dict]:
        """
        查找用户历史记忆（从用户私有索引搜索）
        
        Args:
            user_id: 用户 ID
            emotion_tag: 情感标签（可选，用于查询）
            emotion_intensity: 情绪强度（可选）
            content: 查询内容（可选）
            limit: 返回数量
            offset: 偏移量，用于顺序访问历史记录
        
        Returns:
            用户历史帖子列表
        """
        self._ensure_vector_manager()
        
        try:
            # 如果提供了查询参数，进行向量搜索
            if emotion_tag and content:
                results = self.vector_manager.search_user(
                    user_id, emotion_tag, emotion_intensity or 5, content, k=limit
                )
                return results
            else:
                # 否则从数据库获取指定范围的帖子（支持 offset）
                db = self.db_manager.get_session()
                try:
                    posts = PostCRUD.get_posts_by_user(db, user_id, limit=limit, offset=offset)
                    return [post.to_dict() for post in posts]
                finally:
                    db.close()
                    
        except Exception as e:
            print(f"用户记忆搜索失败: {e}")
            return []
    
    def get_personalized_greeting_context(
        self,
        user_id: str,
        limit: int = 3
    ) -> List[Dict]:
        """
        获取个性化问候的上下文（最近的用户帖子）
        
        Args:
            user_id: 用户 ID
            limit: 返回数量
        
        Returns:
            用户最近的帖子列表
        """
        return self.find_user_memories(user_id, limit=limit)
    
    def analyze_emotional_trend(
        self,
        user_id: str,
        days: int = 7
    ) -> Dict:
        """
        分析用户情绪趋势
        
        Args:
            user_id: 用户 ID
            days: 分析天数
        
        Returns:
            情绪趋势分析结果
        """
        try:
            # 获取用户最近的帖子
            db = self.db_manager.get_session()
            try:
                posts = PostCRUD.get_posts_by_user(db, user_id, limit=50)
                
                if not posts:
                    return {
                        'trend': 'neutral',
                        'message': '暂无足够数据',
                        'post_count': 0
                    }
                
                # 统计情感分布
                emotion_counts = {}
                intensity_sum = 0
                
                for post in posts:
                    emotion_counts[post.emotion_tag] = emotion_counts.get(post.emotion_tag, 0) + 1
                    intensity_sum += post.emotion_intensity
                
                avg_intensity = intensity_sum / len(posts)
                most_common_emotion = max(emotion_counts, key=emotion_counts.get)
                
                # 判断趋势
                positive_emotions = ['happy', 'excited', 'grateful', 'calm', 'hopeful']
                positive_count = sum(emotion_counts.get(e, 0) for e in positive_emotions)
                positive_ratio = positive_count / len(posts)
                
                if positive_ratio > 0.6:
                    trend = 'positive'
                elif positive_ratio < 0.4:
                    trend = 'negative'
                else:
                    trend = 'neutral'
                
                return {
                    'trend': trend,
                    'avg_intensity': round(avg_intensity, 2),
                    'most_common_emotion': most_common_emotion,
                    'emotion_distribution': emotion_counts,
                    'positive_ratio': round(positive_ratio, 2),
                    'post_count': len(posts)
                }
                
            finally:
                db.close()
                
        except Exception as e:
            print(f"情绪趋势分析失败: {e}")
            return {
                'trend': 'unknown',
                'error': str(e)
            }
    
    def get_similar_users(
        self,
        user_id: str,
        emotion_tag: str,
        emotion_intensity: int,
        content: str,
        limit: int = 5
    ) -> List[str]:
        """
        查找有相似情绪的用户
        
        Args:
            user_id: 当前用户 ID
            emotion_tag: 情感标签
            emotion_intensity: 情绪强度
            content: 内容
            limit: 返回数量
        
        Returns:
            相似用户 ID 列表
        """
        try:
            # 查找共鸣帖子
            resonance_posts = self.find_resonance_posts(
                emotion_tag, emotion_intensity, content,
                limit=limit * 2,
                exclude_user_id=user_id
            )
            
            # 提取唯一用户
            similar_users = []
            seen_users = set()
            
            for post in resonance_posts:
                uid = post['user_id']
                if uid not in seen_users:
                    similar_users.append(uid)
                    seen_users.add(uid)
                    if len(similar_users) >= limit:
                        break
            
            return similar_users
            
        except Exception as e:
            print(f"查找相似用户失败: {e}")
            return []


# 全局 RAG 服务实例
_rag_service = None


def get_rag_service() -> RAGService:
    """获取全局 RAG 服务实例"""
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service


if __name__ == "__main__":
    # 测试 RAG 服务
    print("测试 RAG 检索服务...")
    
    rag = RAGService()
    
    # 测试索引帖子
    print("\n1. 测试索引帖子...")
    result = rag.index_post(
        user_id="test_user_001",
        username="测试用户1",
        emotion_tag="happy",
        emotion_intensity=8,
        content="今天心情特别好，考试考得很不错！"
    )
    
    if result['success']:
        print(f"✓ 索引添加成功")
        print(f"  全局向量 ID: {result['global_vector_id']}")
        print(f"  用户向量 ID: {result['user_vector_id']}")
    else:
        print(f"✗ 索引添加失败: {result.get('error')}")
    
    # 再添加几个测试帖子
    test_posts = [
        ("test_user_002", "测试用户2", "happy", 7, "拿到offer了，开心！"),
        ("test_user_003", "测试用户3", "sad", 6, "考试没考好，有点难过"),
        ("test_user_001", "测试用户1", "excited", 9, "明天去旅游，超级期待！"),
    ]
    
    for user_id, username, emotion, intensity, content in test_posts:
        rag.index_post(user_id, username, emotion, intensity, content)
    
    print(f"\n✓ 添加了 {len(test_posts)} 条测试帖子")
    
    # 测试共鸣推荐
    print("\n2. 测试共鸣推荐...")
    resonance = rag.find_resonance_posts(
        emotion_tag="happy",
        emotion_intensity=8,
        content="今天考试考得很好",
        limit=3
    )
    
    if resonance:
        print(f"✓ 找到 {len(resonance)} 条共鸣帖子:")
        for i, post in enumerate(resonance, 1):
            print(f"  {i}. [{post['emotion_tag']}] {post['content'][:20]}... (相似度: {post['similarity']:.4f})")
    else:
        print("  ⚠ 未找到共鸣帖子")
    
    # 测试用户记忆
    print("\n3. 测试用户记忆...")
    memories = rag.find_user_memories("test_user_001", limit=5)
    
    if memories:
        print(f"✓ 找到 {len(memories)} 条用户记忆")
        for i, mem in enumerate(memories, 1):
            print(f"  {i}. [{mem['emotion_tag']}] {mem['content'][:20]}...")
    else:
        print("  ⚠ 未找到用户记忆")
    
    print("\n✓ RAG 检索服务测试完成")

