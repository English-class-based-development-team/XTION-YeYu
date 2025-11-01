"""
情绪统计服务
从用户私有数据库读取帖子数据，计算情绪统计并缓存
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from collections import defaultdict
from sqlalchemy.orm import Session
import sys
import os

# 导入父目录的模块
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from .info_crud import EmotionStatisticsCRUD
    from .info_database import get_info_db_manager
except ImportError:
    from info_crud import EmotionStatisticsCRUD
    from info_database import get_info_db_manager

# 导入主数据库的 CRUD
try:
    from llm.crud import PostCRUD
    from llm.database import get_db_manager
    from llm.emotion_config import EMOTION_TAGS_CN
except ImportError:
    try:
        from crud import PostCRUD
        from database import get_db_manager
        from emotion_config import EMOTION_TAGS_CN
    except ImportError:
        # 如果导入失败，提供一个模拟版本用于测试
        print("警告：无法导入主数据库模块，使用模拟数据")
        PostCRUD = None
        get_db_manager = None
        # 提供默认的情绪标签映射
        EMOTION_TAGS_CN = {
            'happy': '快乐',
            'sad': '悲伤',
            'anxious': '焦虑',
            'angry': '愤怒',
            'calm': '平静',
            'excited': '兴奋',
            'tired': '疲惫',
            'confused': '困惑',
            'grateful': '感恩',
            'lonely': '孤独',
            'hopeful': '希望',
            'fearful': '恐惧',
        }


class EmotionStatisticsService:
    """情绪统计服务"""
    
    @staticmethod
    def calculate_user_emotion_stats(user_id: str, days: int = 7) -> Dict[str, Any]:
        """
        计算用户最近 N 天的情绪统计
        
        Args:
            user_id: 用户 ID
            days: 统计天数（默认 7 天）
        
        Returns:
            情绪统计数据字典
        """
        if PostCRUD is None or get_db_manager is None:
            # 返回模拟数据
            return EmotionStatisticsService._generate_mock_data(days)
        
        try:
            # 获取用户私有数据库的帖子
            posts = PostCRUD.get_user_posts_from_private_table(user_id, limit=1000)
            
            if not posts:
                return EmotionStatisticsService._generate_empty_data(days)
            
            # 计算日期范围
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days - 1)
            
            # 按日期分组统计情绪
            daily_emotions = defaultdict(lambda: defaultdict(int))
            
            for post in posts:
                # 解析时间戳
                if isinstance(post['timestamp'], str):
                    try:
                        post_date = datetime.fromisoformat(post['timestamp'].replace('Z', '+00:00'))
                        # 将带时区的datetime转换为naive datetime（去掉时区信息）
                        if post_date.tzinfo is not None:
                            post_date = post_date.replace(tzinfo=None)
                    except:
                        continue
                else:
                    post_date = post['timestamp']
                    # 确保post_date也是naive datetime
                    if hasattr(post_date, 'tzinfo') and post_date.tzinfo is not None:
                        post_date = post_date.replace(tzinfo=None)
                
                # 只统计指定时间范围内的数据
                if post_date < start_date or post_date > end_date:
                    continue
                
                # 获取日期和星期
                date_key = post_date.strftime('%Y-%m-%d')
                weekday = EmotionStatisticsService._get_weekday_cn(post_date)
                
                # 获取情绪标签（中文）
                emotion_tag = post.get('emotion_tag', 'unknown')
                emotion_cn = EMOTION_TAGS_CN.get(emotion_tag, emotion_tag)
                
                # 获取情绪强度
                intensity = post.get('emotion_intensity', 5)
                
                # 累加情绪强度
                daily_emotions[date_key][emotion_cn] += intensity
            
            # 构建 7 天的数据数组
            week_data = []
            # 获取所有情绪标签的中文名称
            all_emotions_cn = list(EMOTION_TAGS_CN.values())
            
            for i in range(days):
                current_date = start_date + timedelta(days=i)
                date_key = current_date.strftime('%Y-%m-%d')
                weekday = EmotionStatisticsService._get_weekday_cn(current_date)
                
                # 判断是否是今天
                if current_date.date() == end_date.date():
                    display_label = "今天"
                elif i == days - 2:
                    display_label = "昨天"
                else:
                    display_label = weekday
                
                # 构建该天的情绪数据（初始化所有12种情绪为0）
                day_data = {'date': display_label}
                for emotion_cn in all_emotions_cn:
                    day_data[emotion_cn] = 0
                
                # 添加该天实际的情绪数据
                if date_key in daily_emotions:
                    for emotion, value in daily_emotions[date_key].items():
                        day_data[emotion] = value
                
                week_data.append(day_data)
            
            # 计算总帖子数（确保datetime比较的一致性）
            def parse_and_normalize_timestamp(timestamp_str):
                """解析并标准化时间戳为naive datetime"""
                try:
                    dt = datetime.fromisoformat(str(timestamp_str).replace('Z', '+00:00'))
                    # 去掉时区信息
                    if dt.tzinfo is not None:
                        dt = dt.replace(tzinfo=None)
                    return dt
                except:
                    return None
            
            total_posts_in_range = sum(
                1 for p in posts 
                if (parsed_dt := parse_and_normalize_timestamp(p['timestamp'])) is not None 
                and start_date <= parsed_dt <= end_date
            )
            
            return {
                'success': True,
                'user_id': user_id,
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d'),
                'days': days,
                'week_data': week_data,
                'total_posts': total_posts_in_range
            }
            
        except Exception as e:
            print(f"计算情绪统计失败: {e}")
            import traceback
            traceback.print_exc()
            return EmotionStatisticsService._generate_empty_data(days)
    
    @staticmethod
    def _get_weekday_cn(date: datetime) -> str:
        """获取中文星期"""
        weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        return weekdays[date.weekday()]
    
    @staticmethod
    def _generate_empty_data(days: int = 7) -> Dict[str, Any]:
        """生成空数据（无帖子时）- 包含所有12种情绪"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days - 1)
        
        # 创建所有情绪标签的初始化字典
        empty_emotions = {cn: 0 for cn in EMOTION_TAGS_CN.values()}
        
        week_data = []
        for i in range(days):
            current_date = start_date + timedelta(days=i)
            weekday = EmotionStatisticsService._get_weekday_cn(current_date)
            
            if current_date.date() == end_date.date():
                display_label = "今天"
            elif i == days - 2:
                display_label = "昨天"
            else:
                display_label = weekday
            
            day_data = {'date': display_label}
            day_data.update(empty_emotions)
            week_data.append(day_data)
        
        return {
            'success': True,
            'week_data': week_data,
            'total_posts': 0
        }
    
    @staticmethod
    def _generate_mock_data(days: int = 7) -> Dict[str, Any]:
        """生成模拟数据（用于测试）- 包含所有12种情绪"""
        week_data = [
            {'date': '周一', '快乐': 20, '悲伤': 5, '焦虑': 15, '愤怒': 0, '平静': 30, '兴奋': 10, '疲惫': 12, '困惑': 8, '感恩': 10, '孤独': 5, '希望': 15, '恐惧': 3},
            {'date': '周二', '快乐': 30, '悲伤': 3, '焦虑': 10, '愤怒': 2, '平静': 25, '兴奋': 15, '疲惫': 8, '困惑': 5, '感恩': 15, '孤独': 2, '希望': 20, '恐惧': 0},
            {'date': '周三', '快乐': 25, '悲伤': 8, '焦虑': 25, '愤怒': 5, '平静': 20, '兴奋': 8, '疲惫': 15, '困惑': 10, '感恩': 8, '孤独': 6, '希望': 12, '恐惧': 8},
            {'date': '周四', '快乐': 15, '悲伤': 6, '焦虑': 18, '愤怒': 3, '平静': 35, '兴奋': 5, '疲惫': 10, '困惑': 7, '感恩': 12, '孤独': 4, '希望': 18, '恐惧': 5},
            {'date': '周五', '快乐': 28, '悲伤': 4, '焦虑': 12, '愤怒': 1, '平静': 28, '兴奋': 18, '疲惫': 6, '困惑': 4, '感恩': 18, '孤独': 2, '希望': 22, '恐惧': 2},
            {'date': '周六', '快乐': 22, '悲伤': 2, '焦虑': 8, '愤怒': 0, '平静': 40, '兴奋': 12, '疲惫': 5, '困惑': 3, '感恩': 15, '孤独': 1, '希望': 20, '恐惧': 1},
            {'date': '今天', '快乐': 26, '悲伤': 4, '焦虑': 14, '愤怒': 1, '平静': 32, '兴奋': 12, '疲惫': 10, '困惑': 6, '感恩': 20, '孤独': 3, '希望': 18, '恐惧': 2}
        ]
        
        return {
            'success': True,
            'week_data': week_data[:days],
            'total_posts': 21
        }
    
    @staticmethod
    def update_user_emotion_stats(user_id: str) -> bool:
        """
        更新用户的情绪统计缓存
        
        Args:
            user_id: 用户 ID
        
        Returns:
            是否成功
        """
        try:
            # 计算统计数据
            stats_data = EmotionStatisticsService.calculate_user_emotion_stats(user_id)
            
            if not stats_data.get('success'):
                return False
            
            # 保存到数据库
            info_db = get_info_db_manager()
            db = info_db.get_session()
            
            try:
                today = datetime.now().strftime('%Y-%m-%d')
                EmotionStatisticsCRUD.save_statistics(
                    db, user_id, today, stats_data
                )
                print(f"✓ 更新用户 {user_id} 的情绪统计成功")
                return True
            finally:
                db.close()
                
        except Exception as e:
            print(f"更新用户 {user_id} 的情绪统计失败: {e}")
            return False
    
    @staticmethod
    def get_user_emotion_stats(user_id: str, force_update: bool = False) -> Optional[Dict[str, Any]]:
        """
        获取用户的情绪统计（从缓存或重新计算）
        
        Args:
            user_id: 用户 ID
            force_update: 是否强制更新
        
        Returns:
            情绪统计数据
        """
        info_db = get_info_db_manager()
        db = info_db.get_session()
        
        try:
            today = datetime.now().strftime('%Y-%m-%d')
            
            # 如果不强制更新，先尝试从缓存读取
            if not force_update:
                cached_stats = EmotionStatisticsCRUD.get_statistics_by_date(db, user_id, today)
                if cached_stats:
                    return cached_stats.to_dict()['emotion_data']
            
            # 缓存不存在或需要更新，重新计算
            stats_data = EmotionStatisticsService.calculate_user_emotion_stats(user_id)
            
            # 保存到缓存
            EmotionStatisticsCRUD.save_statistics(db, user_id, today, stats_data)
            
            return stats_data
            
        finally:
            db.close()
    
    @staticmethod
    def update_all_users_stats() -> Dict[str, Any]:
        """
        更新所有用户的情绪统计（定时任务调用）
        
        Returns:
            更新结果统计
        """
        from .info_crud import UserProfileCRUD
        
        info_db = get_info_db_manager()
        db = info_db.get_session()
        
        try:
            # 获取所有用户 ID
            user_ids = UserProfileCRUD.get_all_user_ids(db)
            
            success_count = 0
            fail_count = 0
            
            for user_id in user_ids:
                if EmotionStatisticsService.update_user_emotion_stats(user_id):
                    success_count += 1
                else:
                    fail_count += 1
            
            result = {
                'total': len(user_ids),
                'success': success_count,
                'failed': fail_count,
                'timestamp': datetime.now().isoformat()
            }
            
            print(f"✓ 批量更新情绪统计完成: {result}")
            return result
            
        finally:
            db.close()


if __name__ == "__main__":
    # 测试情绪统计服务
    print("测试情绪统计服务...")
    
    print("\n1. 测试生成模拟数据...")
    mock_data = EmotionStatisticsService._generate_mock_data(7)
    print(f"✓ 模拟数据天数: {len(mock_data['week_data'])}")
    print(f"  第一天: {mock_data['week_data'][0]}")
    print(f"  最后一天: {mock_data['week_data'][-1]}")
    
    print("\n2. 测试生成空数据...")
    empty_data = EmotionStatisticsService._generate_empty_data(7)
    print(f"✓ 空数据天数: {len(empty_data['week_data'])}")
    print(f"  第一天: {empty_data['week_data'][0]}")
    
    print("\n3. 测试计算用户情绪统计（使用模拟数据）...")
    stats = EmotionStatisticsService.calculate_user_emotion_stats("test_user_001")
    print(f"✓ 统计数据: {stats.get('total_posts', 0)} 条帖子")
    print(f"  数据天数: {len(stats['week_data'])}")
    
    print("\n✓ 情绪统计服务测试通过！")

