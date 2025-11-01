"""
个人信息数据库 CRUD 操作
实现用户资料、共鸣浏览记录、保存对话、情绪统计的增删改查
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
import json

try:
    from .info_models import UserProfile, ResonanceHistory, SavedConversation, EmotionStatistics
    from .info_database import get_info_db_manager
except ImportError:
    from info_models import UserProfile, ResonanceHistory, SavedConversation, EmotionStatistics
    from info_database import get_info_db_manager


# ==================== 用户资料 CRUD ====================

class UserProfileCRUD:
    """用户资料 CRUD 操作"""
    
    @staticmethod
    def create_or_update_profile(
        db: Session,
        user_id: str,
        wechat_user_id: Optional[str] = None,
        avatar: Optional[str] = None,
        nickname: Optional[str] = None,
        greeting: Optional[str] = None,
        join_date: Optional[datetime] = None
    ) -> UserProfile:
        """
        创建或更新用户资料
        
        Args:
            db: 数据库会话
            user_id: 用户 ID
            wechat_user_id: 微信用户 ID
            avatar: 头像
            nickname: 昵称
            greeting: 问候语
            join_date: 加入日期
        
        Returns:
            用户资料对象
        """
        # 查找现有资料
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        
        if profile:
            # 更新现有资料
            if wechat_user_id is not None:
                profile.wechat_user_id = wechat_user_id
            if avatar is not None:
                profile.avatar = avatar
            if nickname is not None:
                profile.nickname = nickname
            if greeting is not None:
                profile.greeting = greeting
            profile.updated_at = datetime.now()
        else:
            # 创建新资料
            profile = UserProfile(
                user_id=user_id,
                wechat_user_id=wechat_user_id,
                avatar=avatar or "👤",
                nickname=nickname or "用户",
                greeting=greeting,
                join_date=join_date or datetime.now()
            )
            db.add(profile)
        
        db.commit()
        db.refresh(profile)
        return profile
    
    @staticmethod
    def get_profile(db: Session, user_id: str) -> Optional[UserProfile]:
        """获取用户资料"""
        return db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    @staticmethod
    def get_profile_by_wechat_id(db: Session, wechat_user_id: str) -> Optional[UserProfile]:
        """通过微信用户 ID 获取资料"""
        return db.query(UserProfile).filter(UserProfile.wechat_user_id == wechat_user_id).first()
    
    @staticmethod
    def delete_profile(db: Session, user_id: str) -> bool:
        """删除用户资料"""
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if profile:
            db.delete(profile)
            db.commit()
            return True
        return False
    
    @staticmethod
    def get_all_user_ids(db: Session) -> List[str]:
        """获取所有用户 ID（用于定时任务）"""
        return [profile.user_id for profile in db.query(UserProfile).all()]


# ==================== 共鸣浏览记录 CRUD ====================

class ResonanceHistoryCRUD:
    """共鸣浏览记录 CRUD 操作"""
    
    MAX_HISTORY_COUNT = 25  # 最多保留 25 条记录
    
    @staticmethod
    def add_resonance_record(
        db: Session,
        user_id: str,
        post_id: int,
        post_data: Dict[str, Any]
    ) -> ResonanceHistory:
        """
        添加共鸣浏览记录（自动维护 25 条限制）
        
        Args:
            db: 数据库会话
            user_id: 用户 ID
            post_id: 帖子 ID
            post_data: 帖子数据（六字段字典）
        
        Returns:
            共鸣记录对象
        """
        # 检查当前记录数
        current_count = db.query(func.count(ResonanceHistory.id))\
            .filter(ResonanceHistory.user_id == user_id)\
            .scalar()
        
        # 如果达到上限，删除最旧的记录
        if current_count >= ResonanceHistoryCRUD.MAX_HISTORY_COUNT:
            oldest = db.query(ResonanceHistory)\
                .filter(ResonanceHistory.user_id == user_id)\
                .order_by(ResonanceHistory.viewed_at)\
                .first()
            if oldest:
                db.delete(oldest)
        
        # 添加新记录
        record = ResonanceHistory(
            user_id=user_id,
            post_id=post_id,
            viewed_at=datetime.now(),
            post_data=json.dumps(post_data, ensure_ascii=False)
        )
        
        db.add(record)
        db.commit()
        db.refresh(record)
        return record
    
    @staticmethod
    def get_resonance_history(
        db: Session,
        user_id: str,
        limit: int = 25,
        offset: int = 0
    ) -> List[ResonanceHistory]:
        """
        获取用户的共鸣浏览记录
        
        Args:
            db: 数据库会话
            user_id: 用户 ID
            limit: 返回数量限制
            offset: 偏移量
        
        Returns:
            共鸣记录列表（按时间倒序）
        """
        return db.query(ResonanceHistory)\
            .filter(ResonanceHistory.user_id == user_id)\
            .order_by(desc(ResonanceHistory.viewed_at))\
            .offset(offset)\
            .limit(limit)\
            .all()
    
    @staticmethod
    def get_resonance_count(db: Session, user_id: str) -> int:
        """获取用户共鸣记录总数"""
        return db.query(func.count(ResonanceHistory.id))\
            .filter(ResonanceHistory.user_id == user_id)\
            .scalar()
    
    @staticmethod
    def delete_resonance_record(db: Session, record_id: int) -> bool:
        """删除单条共鸣记录"""
        record = db.query(ResonanceHistory).filter(ResonanceHistory.id == record_id).first()
        if record:
            db.delete(record)
            db.commit()
            return True
        return False
    
    @staticmethod
    def clear_user_resonance_history(db: Session, user_id: str) -> int:
        """清空用户的所有共鸣记录"""
        count = db.query(ResonanceHistory)\
            .filter(ResonanceHistory.user_id == user_id)\
            .delete()
        db.commit()
        return count


# ==================== 保存的对话 CRUD ====================

class SavedConversationCRUD:
    """保存的对话 CRUD 操作"""
    
    @staticmethod
    def save_conversation(
        db: Session,
        user_id: str,
        conversation_id: str,
        title: str,
        messages: List[Dict[str, Any]],
        preview: Optional[str] = None
    ) -> SavedConversation:
        """
        保存对话
        
        Args:
            db: 数据库会话
            user_id: 用户 ID
            conversation_id: 对话 ID
            title: 对话标题
            messages: 对话消息列表
            preview: 对话预览
        
        Returns:
            保存的对话对象
        """
        # 如果未提供预览，自动生成
        if preview is None and messages:
            # 取前两条消息作为预览
            preview_messages = messages[:2]
            preview_texts = [msg.get('content', '') for msg in preview_messages if msg.get('content')]
            preview = ' '.join(preview_texts)[:100]  # 限制 100 字符
        
        # 检查是否已存在
        existing = db.query(SavedConversation)\
            .filter(SavedConversation.conversation_id == conversation_id)\
            .first()
        
        if existing:
            # 更新现有对话
            existing.title = title
            existing.messages = json.dumps(messages, ensure_ascii=False)
            existing.preview = preview
            existing.saved_at = datetime.now()
            db.commit()
            db.refresh(existing)
            return existing
        else:
            # 创建新对话
            conversation = SavedConversation(
                user_id=user_id,
                conversation_id=conversation_id,
                title=title,
                preview=preview,
                messages=json.dumps(messages, ensure_ascii=False),
                saved_at=datetime.now()
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
            return conversation
    
    @staticmethod
    def get_saved_conversations(
        db: Session,
        user_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[SavedConversation]:
        """
        获取用户保存的对话列表
        
        Args:
            db: 数据库会话
            user_id: 用户 ID
            limit: 返回数量限制
            offset: 偏移量
        
        Returns:
            对话列表（按保存时间倒序）
        """
        return db.query(SavedConversation)\
            .filter(SavedConversation.user_id == user_id)\
            .order_by(desc(SavedConversation.saved_at))\
            .offset(offset)\
            .limit(limit)\
            .all()
    
    @staticmethod
    def get_conversation_by_id(db: Session, conversation_id: str) -> Optional[SavedConversation]:
        """根据对话 ID 获取对话"""
        return db.query(SavedConversation)\
            .filter(SavedConversation.conversation_id == conversation_id)\
            .first()
    
    @staticmethod
    def delete_conversation(db: Session, conversation_id: str) -> bool:
        """删除保存的对话"""
        conversation = db.query(SavedConversation)\
            .filter(SavedConversation.conversation_id == conversation_id)\
            .first()
        if conversation:
            db.delete(conversation)
            db.commit()
            return True
        return False
    
    @staticmethod
    def get_conversation_count(db: Session, user_id: str) -> int:
        """获取用户保存的对话总数"""
        return db.query(func.count(SavedConversation.id))\
            .filter(SavedConversation.user_id == user_id)\
            .scalar()


# ==================== 情绪统计 CRUD ====================

class EmotionStatisticsCRUD:
    """情绪统计 CRUD 操作"""
    
    @staticmethod
    def save_statistics(
        db: Session,
        user_id: str,
        date: str,
        emotion_data: Dict[str, Any]
    ) -> EmotionStatistics:
        """
        保存或更新情绪统计数据
        
        Args:
            db: 数据库会话
            user_id: 用户 ID
            date: 日期字符串 (YYYY-MM-DD)
            emotion_data: 情绪数据（7天数据的字典）
        
        Returns:
            情绪统计对象
        """
        # 查找现有统计
        stats = db.query(EmotionStatistics)\
            .filter(
                EmotionStatistics.user_id == user_id,
                EmotionStatistics.date == date
            )\
            .first()
        
        if stats:
            # 更新现有统计
            stats.emotion_data = json.dumps(emotion_data, ensure_ascii=False)
            stats.updated_at = datetime.now()
        else:
            # 创建新统计
            stats = EmotionStatistics(
                user_id=user_id,
                date=date,
                emotion_data=json.dumps(emotion_data, ensure_ascii=False),
                updated_at=datetime.now()
            )
            db.add(stats)
        
        db.commit()
        db.refresh(stats)
        return stats
    
    @staticmethod
    def get_latest_statistics(db: Session, user_id: str) -> Optional[EmotionStatistics]:
        """获取用户最新的情绪统计"""
        return db.query(EmotionStatistics)\
            .filter(EmotionStatistics.user_id == user_id)\
            .order_by(desc(EmotionStatistics.date))\
            .first()
    
    @staticmethod
    def get_statistics_by_date(
        db: Session,
        user_id: str,
        date: str
    ) -> Optional[EmotionStatistics]:
        """获取指定日期的情绪统计"""
        return db.query(EmotionStatistics)\
            .filter(
                EmotionStatistics.user_id == user_id,
                EmotionStatistics.date == date
            )\
            .first()
    
    @staticmethod
    def delete_old_statistics(db: Session, user_id: str, keep_days: int = 30) -> int:
        """
        删除旧的统计数据
        
        Args:
            db: 数据库会话
            user_id: 用户 ID
            keep_days: 保留最近 N 天的数据
        
        Returns:
            删除的记录数
        """
        from datetime import datetime, timedelta
        cutoff_date = (datetime.now() - timedelta(days=keep_days)).strftime('%Y-%m-%d')
        
        count = db.query(EmotionStatistics)\
            .filter(
                EmotionStatistics.user_id == user_id,
                EmotionStatistics.date < cutoff_date
            )\
            .delete()
        db.commit()
        return count


if __name__ == "__main__":
    # 测试 CRUD 操作
    print("测试个人信息 CRUD 操作...")
    
    from info_database import InfoDatabaseManager
    import os
    
    # 使用测试数据库
    test_db_path = "test_info_crud.db"
    
    # 清理旧测试数据库
    if os.path.exists(test_db_path):
        os.remove(test_db_path)
    
    try:
        db_manager = InfoDatabaseManager(test_db_path)
        db = db_manager.get_session()
        
        print("\n1. 测试用户资料 CRUD...")
        profile = UserProfileCRUD.create_or_update_profile(
            db, "test_user_001", 
            wechat_user_id="wx_123",
            nickname="测试用户",
            avatar="😊"
        )
        print(f"✓ 创建用户资料: {profile.nickname}")
        
        retrieved = UserProfileCRUD.get_profile(db, "test_user_001")
        print(f"✓ 查询用户资料: {retrieved.nickname}")
        
        print("\n2. 测试共鸣记录 CRUD（25 条限制）...")
        # 添加 30 条记录，应该只保留最新的 25 条
        for i in range(30):
            post_data = {
                'user_id': f'user_{i}',
                'username': f'用户{i}',
                'timestamp': datetime.now().isoformat(),
                'emotion_tag': 'happy',
                'emotion_intensity': 5,
                'content': f'测试帖子 {i}'
            }
            ResonanceHistoryCRUD.add_resonance_record(
                db, "test_user_001", i, post_data
            )
        
        count = ResonanceHistoryCRUD.get_resonance_count(db, "test_user_001")
        print(f"✓ 共鸣记录数: {count} (应该 <= 25)")
        assert count <= 25, f"共鸣记录数超过限制: {count}"
        
        history = ResonanceHistoryCRUD.get_resonance_history(db, "test_user_001", limit=5)
        print(f"✓ 获取最近 5 条记录: {len(history)} 条")
        
        print("\n3. 测试保存对话 CRUD...")
        messages = [
            {'role': 'user', 'content': '我今天很开心'},
            {'role': 'assistant', 'content': '太好了！发生什么好事了吗？'}
        ]
        conversation = SavedConversationCRUD.save_conversation(
            db, "test_user_001", "conv_001", "关于开心的对话", messages
        )
        print(f"✓ 保存对话: {conversation.title}")
        
        convs = SavedConversationCRUD.get_saved_conversations(db, "test_user_001")
        print(f"✓ 获取保存的对话: {len(convs)} 条")
        
        print("\n4. 测试情绪统计 CRUD...")
        emotion_data = {
            'week_data': [
                {'date': '周一', '平静': 30, '快乐': 20},
                {'date': '周二', '平静': 25, '快乐': 30}
            ]
        }
        stats = EmotionStatisticsCRUD.save_statistics(
            db, "test_user_001", "2025-01-01", emotion_data
        )
        print(f"✓ 保存情绪统计: {stats.date}")
        
        latest = EmotionStatisticsCRUD.get_latest_statistics(db, "test_user_001")
        print(f"✓ 获取最新统计: {latest.date}")
        
        db.close()
        print("\n✓ 所有 CRUD 测试通过！")
        
    finally:
        # 清理测试数据库
        if os.path.exists(test_db_path):
            os.remove(test_db_path)
            print(f"✓ 清理测试数据库: {test_db_path}")

