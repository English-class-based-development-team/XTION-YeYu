"""
CRUD 操作
实现帖子数据的增删改查操作
"""

from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc, text

try:
    from .models import Post
    from .database import get_db_manager
except ImportError:
    from models import Post
    from database import get_db_manager


class PostCRUD:
    """帖子 CRUD 操作类"""
    
    @staticmethod
    def create_post(
        db: Session,
        user_id: str,
        username: str,
        emotion_tag: str,
        emotion_intensity: int,
        content: str,
        timestamp: datetime = None
    ) -> Post:
        """
        创建新帖子
        
        Args:
            db: 数据库会话
            user_id: 用户 ID
            username: 用户名
            emotion_tag: 情感标签
            emotion_intensity: 情绪强度（1-10）
            content: 帖子内容
            timestamp: 发帖时间，默认为当前时间
        
        Returns:
            创建的帖子对象
        """
        if timestamp is None:
            timestamp = datetime.now()
        
        post = Post(
            user_id=user_id,
            username=username,
            timestamp=timestamp,
            emotion_tag=emotion_tag,
            emotion_intensity=emotion_intensity,
            content=content
        )
        
        db.add(post)
        db.commit()
        db.refresh(post)
        
        return post
    
    @staticmethod
    def create_post_in_user_table(
        user_id: str,
        username: str,
        emotion_tag: str,
        emotion_intensity: int,
        content: str,
        timestamp: datetime = None
    ) -> dict:
        """
        在用户私有表中创建帖子
        
        Args:
            user_id: 用户 ID
            username: 用户名
            emotion_tag: 情感标签
            emotion_intensity: 情绪强度（1-10）
            content: 帖子内容
            timestamp: 发帖时间，默认为当前时间
        
        Returns:
            帖子字典
        """
        if timestamp is None:
            timestamp = datetime.now()
        
        db_manager = get_db_manager()
        db_manager.create_user_table(user_id)
        
        # 获取清理后的表名（已通过 _sanitize_user_id 验证，防止 SQL 注入）
        table_name = db_manager.get_user_table_name(user_id)
        
        # 使用原生 SQL 插入（因为是动态表）
        # 注意：table_name 已在 get_user_table_name 中经过清理，只包含安全字符
        db = db_manager.get_session()
        try:
            query = text(f"""
                INSERT INTO {table_name} (user_id, username, timestamp, emotion_tag, emotion_intensity, content)
                VALUES (:user_id, :username, :timestamp, :emotion_tag, :emotion_intensity, :content)
            """)
            
            result = db.execute(query, {
                'user_id': user_id,
                'username': username,
                'timestamp': timestamp,
                'emotion_tag': emotion_tag,
                'emotion_intensity': emotion_intensity,
                'content': content
            })
            db.commit()
            
            return {
                'user_id': user_id,
                'username': username,
                'timestamp': timestamp.isoformat(),
                'emotion_tag': emotion_tag,
                'emotion_intensity': emotion_intensity,
                'content': content
            }
        finally:
            db.close()
    
    @staticmethod
    def get_post_by_id(db: Session, post_id: int) -> Optional[Post]:
        """根据 ID 获取帖子"""
        return db.query(Post).filter(Post.id == post_id).first()
    
    @staticmethod
    def get_posts_by_user(
        db: Session,
        user_id: str,
        limit: int = 100,
        offset: int = 0
    ) -> List[Post]:
        """
        获取用户的所有帖子
        
        Args:
            db: 数据库会话
            user_id: 用户 ID
            limit: 返回数量限制
            offset: 偏移量
        
        Returns:
            帖子列表
        """
        return db.query(Post)\
            .filter(Post.user_id == user_id)\
            .order_by(desc(Post.timestamp))\
            .offset(offset)\
            .limit(limit)\
            .all()
    
    @staticmethod
    def get_user_posts_from_private_table(
        user_id: str,
        limit: int = 100,
        offset: int = 0
    ) -> List[dict]:
        """
        从用户私有表获取帖子
        
        Args:
            user_id: 用户 ID
            limit: 返回数量限制
            offset: 偏移量
        
        Returns:
            帖子字典列表
        """
        db_manager = get_db_manager()
        # 获取清理后的表名（已通过 _sanitize_user_id 验证，防止 SQL 注入）
        table_name = db_manager.get_user_table_name(user_id)
        
        # 检查表是否存在
        if not db_manager.table_exists(table_name):
            return []
        
        db = db_manager.get_session()
        try:
            # 注意：table_name 已在 get_user_table_name 中经过清理，只包含安全字符
            query = text(f"""
                SELECT id, user_id, username, timestamp, emotion_tag, emotion_intensity, content
                FROM {table_name}
                ORDER BY timestamp DESC
                LIMIT :limit OFFSET :offset
            """)
            
            result = db.execute(query, {'limit': limit, 'offset': offset})
            posts = []
            
            for row in result:
                posts.append({
                    'id': row[0],
                    'user_id': row[1],
                    'username': row[2],
                    'timestamp': row[3],
                    'emotion_tag': row[4],
                    'emotion_intensity': row[5],
                    'content': row[6]
                })
            
            return posts
        finally:
            db.close()
    
    @staticmethod
    def get_all_posts(
        db: Session,
        limit: int = 100,
        offset: int = 0
    ) -> List[Post]:
        """
        获取所有帖子（全局）
        
        Args:
            db: 数据库会话
            limit: 返回数量限制
            offset: 偏移量
        
        Returns:
            帖子列表
        """
        return db.query(Post)\
            .order_by(desc(Post.timestamp))\
            .offset(offset)\
            .limit(limit)\
            .all()
    
    @staticmethod
    def get_posts_by_emotion(
        db: Session,
        emotion_tag: str,
        limit: int = 50
    ) -> List[Post]:
        """根据情感标签获取帖子"""
        return db.query(Post)\
            .filter(Post.emotion_tag == emotion_tag)\
            .order_by(desc(Post.timestamp))\
            .limit(limit)\
            .all()
    
    @staticmethod
    def delete_post(db: Session, post_id: int) -> bool:
        """删除帖子"""
        post = db.query(Post).filter(Post.id == post_id).first()
        if post:
            db.delete(post)
            db.commit()
            return True
        return False
    
    @staticmethod
    def update_post(
        db: Session,
        post_id: int,
        **kwargs
    ) -> Optional[Post]:
        """
        更新帖子
        
        Args:
            db: 数据库会话
            post_id: 帖子 ID
            **kwargs: 要更新的字段
        
        Returns:
            更新后的帖子对象
        """
        post = db.query(Post).filter(Post.id == post_id).first()
        if post:
            for key, value in kwargs.items():
                if hasattr(post, key):
                    setattr(post, key, value)
            db.commit()
            db.refresh(post)
            return post
        return None


if __name__ == "__main__":
    # 测试 CRUD 操作
    from database import get_db_manager
    
    print("测试 CRUD 操作...")
    
    db_manager = get_db_manager()
    db = db_manager.get_session()
    
    try:
        # 测试创建帖子
        print("\n1. 测试创建帖子...")
        post = PostCRUD.create_post(
            db=db,
            user_id="user_001",
            username="测试用户",
            emotion_tag="happy",
            emotion_intensity=8,
            content="今天心情很好！"
        )
        print(f"✓ 创建成功: {post}")
        
        # 测试查询帖子
        print("\n2. 测试查询帖子...")
        retrieved_post = PostCRUD.get_post_by_id(db, post.id)
        print(f"✓ 查询成功: {retrieved_post.to_dict()}")
        
        # 测试获取用户帖子
        print("\n3. 测试获取用户帖子...")
        user_posts = PostCRUD.get_posts_by_user(db, "user_001")
        print(f"✓ 找到 {len(user_posts)} 条帖子")
        
        # 测试更新帖子
        print("\n4. 测试更新帖子...")
        updated_post = PostCRUD.update_post(
            db, post.id,
            emotion_intensity=9,
            content="今天心情超级好！"
        )
        print(f"✓ 更新成功: {updated_post.to_dict()}")
        
        # 测试删除帖子
        print("\n5. 测试删除帖子...")
        deleted = PostCRUD.delete_post(db, post.id)
        print(f"✓ 删除成功: {deleted}")
        
        print("\n✓ 所有 CRUD 测试通过！")
        
    finally:
        db.close()

