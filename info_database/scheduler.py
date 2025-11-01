"""
定时任务调度器
每天零点自动更新所有用户的情绪统计
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import logging

try:
    from .emotion_statistics_service import EmotionStatisticsService
except ImportError:
    from emotion_statistics_service import EmotionStatisticsService

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EmotionStatsScheduler:
    """情绪统计定时任务调度器"""
    
    def __init__(self):
        """初始化调度器"""
        self.scheduler = BackgroundScheduler()
        self.is_running = False
        logger.info("情绪统计调度器已初始化")
    
    def update_all_emotion_stats(self):
        """
        更新所有用户的情绪统计（定时任务执行的函数）
        每天零点触发
        """
        try:
            logger.info(f"开始执行情绪统计更新任务 - {datetime.now().isoformat()}")
            
            # 调用服务更新所有用户统计
            result = EmotionStatisticsService.update_all_users_stats()
            
            logger.info(f"情绪统计更新完成: {result}")
            logger.info(f"  - 总用户数: {result.get('total', 0)}")
            logger.info(f"  - 成功: {result.get('success', 0)}")
            logger.info(f"  - 失败: {result.get('failed', 0)}")
            
            return result
            
        except Exception as e:
            logger.error(f"情绪统计更新任务失败: {e}")
            import traceback
            traceback.print_exc()
            return {
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def start(self):
        """
        启动定时任务调度器
        配置每天零点执行更新任务
        """
        if self.is_running:
            logger.warning("调度器已在运行中")
            return
        
        # 添加定时任务：每天零点执行
        self.scheduler.add_job(
            self.update_all_emotion_stats,
            trigger=CronTrigger(hour=0, minute=0),  # 每天 00:00
            id='emotion_stats_update',
            name='情绪统计更新任务',
            replace_existing=True
        )
        
        # 启动调度器
        self.scheduler.start()
        self.is_running = True
        
        logger.info("✓ 情绪统计调度器已启动")
        logger.info("  - 执行时间: 每天 00:00")
        logger.info("  - 任务: 更新所有用户的情绪统计")
    
    def stop(self):
        """停止定时任务调度器"""
        if not self.is_running:
            logger.warning("调度器未在运行")
            return
        
        self.scheduler.shutdown()
        self.is_running = False
        logger.info("✓ 情绪统计调度器已停止")
    
    def run_now(self):
        """
        立即执行一次更新任务（用于测试或手动触发）
        
        Returns:
            更新结果
        """
        logger.info("手动触发情绪统计更新...")
        return self.update_all_emotion_stats()
    
    def get_status(self):
        """
        获取调度器状态
        
        Returns:
            状态字典
        """
        jobs = []
        if self.is_running:
            for job in self.scheduler.get_jobs():
                jobs.append({
                    'id': job.id,
                    'name': job.name,
                    'next_run_time': job.next_run_time.isoformat() if job.next_run_time else None,
                    'trigger': str(job.trigger)
                })
        
        return {
            'is_running': self.is_running,
            'jobs': jobs,
            'timestamp': datetime.now().isoformat()
        }


# 全局调度器实例
_scheduler_instance = None


def get_scheduler() -> EmotionStatsScheduler:
    """
    获取全局调度器实例（单例模式）
    
    Returns:
        调度器实例
    """
    global _scheduler_instance
    if _scheduler_instance is None:
        _scheduler_instance = EmotionStatsScheduler()
    return _scheduler_instance


def start_scheduler():
    """启动全局调度器"""
    scheduler = get_scheduler()
    scheduler.start()
    return scheduler


def stop_scheduler():
    """停止全局调度器"""
    scheduler = get_scheduler()
    scheduler.stop()


if __name__ == "__main__":
    # 测试定时任务调度器
    print("测试情绪统计调度器...")
    
    # 创建调度器
    scheduler = EmotionStatsScheduler()
    
    # 获取状态
    status = scheduler.get_status()
    print(f"\n调度器状态: {status}")
    
    # 测试手动执行
    print("\n测试手动执行更新任务...")
    result = scheduler.run_now()
    print(f"执行结果: {result}")
    
    # 启动调度器
    print("\n启动调度器...")
    scheduler.start()
    
    # 再次获取状态
    status = scheduler.get_status()
    print(f"\n调度器状态:")
    print(f"  运行中: {status['is_running']}")
    print(f"  任务数: {len(status['jobs'])}")
    for job in status['jobs']:
        print(f"    - {job['name']}: {job['next_run_time']}")
    
    # 停止调度器
    print("\n停止调度器...")
    scheduler.stop()
    
    print("\n✓ 调度器测试完成！")

