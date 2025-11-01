"""
个人信息数据模型定义
定义用户资料、共鸣浏览记录、保存对话、情绪统计的 SQLAlchemy 模型
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Index
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import json

Base = declarative_base()


class UserProfile(Base):
    """
    用户资料模型
    存储用户的基本信息和个性化设置
    """
    __tablename__ = 'user_profiles'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(100), nullable=False, unique=True, index=True)  # 系统内部用户 ID
    wechat_user_id = Column(String(100), nullable=True, index=True)  # 微信用户 ID（可选）
    avatar = Column(String(200), nullable=True)  # 头像（emoji 或 URL）
    nickname = Column(String(100), nullable=False, default="用户")  # 昵称
    greeting = Column(String(200), nullable=True)  # 个性化问候语
    join_date = Column(DateTime, nullable=False, default=datetime.now)  # 加入日期
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'wechat_user_id': self.wechat_user_id,
            'avatar': self.avatar,
            'nickname': self.nickname,
            'greeting': self.greeting,
            'join_date': self.join_date.isoformat() if self.join_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f"<UserProfile(user_id={self.user_id}, nickname={self.nickname})>"


class ResonanceHistory(Base):
    """
    共鸣浏览记录模型
    记录用户查看过的共鸣帖子（最多保留 25 条）
    """
    __tablename__ = 'resonance_history'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(100), nullable=False, index=True)  # 用户 ID
    post_id = Column(Integer, nullable=False)  # 帖子 ID（引用 posts 表）
    viewed_at = Column(DateTime, nullable=False, default=datetime.now, index=True)  # 查看时间
    post_data = Column(Text, nullable=False)  # 帖子数据的 JSON 字符串（六字段）
    
    # 创建复合索引以优化查询
    __table_args__ = (
        Index('idx_user_viewed', 'user_id', 'viewed_at'),
    )
    
    def to_dict(self):
        """转换为字典格式"""
        post_data_dict = json.loads(self.post_data) if isinstance(self.post_data, str) else self.post_data
        return {
            'id': self.id,
            'user_id': self.user_id,
            'post_id': self.post_id,
            'viewed_at': self.viewed_at.isoformat() if self.viewed_at else None,
            'post_data': post_data_dict
        }
    
    def __repr__(self):
        return f"<ResonanceHistory(user_id={self.user_id}, post_id={self.post_id}, viewed_at={self.viewed_at})>"


class SavedConversation(Base):
    """
    保存的对话模型
    用户手动保存的对话记录
    """
    __tablename__ = 'saved_conversations'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(100), nullable=False, index=True)  # 用户 ID
    conversation_id = Column(String(100), nullable=False, unique=True)  # 对话唯一标识
    title = Column(String(200), nullable=False)  # 对话标题
    preview = Column(Text, nullable=True)  # 对话预览（前几句话）
    messages = Column(Text, nullable=False)  # 对话内容的 JSON 字符串
    saved_at = Column(DateTime, nullable=False, default=datetime.now, index=True)  # 保存时间
    
    # 创建复合索引
    __table_args__ = (
        Index('idx_user_saved', 'user_id', 'saved_at'),
    )
    
    def to_dict(self):
        """转换为字典格式"""
        messages_list = json.loads(self.messages) if isinstance(self.messages, str) else self.messages
        return {
            'id': self.id,
            'user_id': self.user_id,
            'conversation_id': self.conversation_id,
            'title': self.title,
            'preview': self.preview,
            'messages': messages_list,
            'saved_at': self.saved_at.isoformat() if self.saved_at else None
        }
    
    def __repr__(self):
        return f"<SavedConversation(user_id={self.user_id}, title={self.title})>"


class EmotionStatistics(Base):
    """
    情绪统计缓存模型
    存储每日计算的用户情绪统计数据（每天零点更新）
    """
    __tablename__ = 'emotion_statistics'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(100), nullable=False, index=True)  # 用户 ID
    date = Column(String(10), nullable=False, index=True)  # 统计日期 YYYY-MM-DD
    emotion_data = Column(Text, nullable=False)  # 情绪数据的 JSON 字符串（7天数据）
    updated_at = Column(DateTime, nullable=False, default=datetime.now)  # 更新时间
    
    # 创建唯一约束：每个用户每天只有一条统计记录
    __table_args__ = (
        Index('idx_user_date', 'user_id', 'date', unique=True),
    )
    
    def to_dict(self):
        """转换为字典格式"""
        emotion_data_dict = json.loads(self.emotion_data) if isinstance(self.emotion_data, str) else self.emotion_data
        return {
            'id': self.id,
            'user_id': self.user_id,
            'date': self.date,
            'emotion_data': emotion_data_dict,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f"<EmotionStatistics(user_id={self.user_id}, date={self.date})>"


if __name__ == "__main__":
    # 测试模型定义
    print("✓ 数据模型定义成功")
    print(f"  - UserProfile: {UserProfile.__tablename__}")
    print(f"  - ResonanceHistory: {ResonanceHistory.__tablename__}")
    print(f"  - SavedConversation: {SavedConversation.__tablename__}")
    print(f"  - EmotionStatistics: {EmotionStatistics.__tablename__}")

