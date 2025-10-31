"""
数据模型定义
定义发帖数据的 SQLAlchemy 模型（六字段规范）
"""

from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class Post(Base):
    """
    帖子数据模型（六字段规范）
    1. user_id: 用户 ID（唯一）
    2. username: 用户名（可重复）
    3. timestamp: 发帖时间（精确到秒）
    4. emotion_tag: 情感标签
    5. emotion_intensity: 情绪强度（1-10）
    6. content: 用户帖子文字
    """
    __tablename__ = 'posts'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(100), nullable=False, index=True)
    username = Column(String(100), nullable=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.now, index=True)
    emotion_tag = Column(String(50), nullable=False, index=True)
    emotion_intensity = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.username,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'emotion_tag': self.emotion_tag,
            'emotion_intensity': self.emotion_intensity,
            'content': self.content
        }
    
    def __repr__(self):
        return f"<Post(id={self.id}, user={self.username}, emotion={self.emotion_tag}, intensity={self.emotion_intensity})>"

