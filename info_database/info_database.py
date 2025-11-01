"""
个人信息数据库管理器
提供数据库初始化、会话管理等功能
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from pathlib import Path

try:
    from .info_models import Base, UserProfile, ResonanceHistory, SavedConversation, EmotionStatistics
except ImportError:
    from info_models import Base, UserProfile, ResonanceHistory, SavedConversation, EmotionStatistics


class InfoDatabaseManager:
    """个人信息数据库管理器"""
    
    def __init__(self, db_path: str = None):
        """
        初始化数据库管理器
        
        Args:
            db_path: 数据库文件路径，默认为 data/info_database.db
        """
        if db_path is None:
            # 默认路径：项目根目录下的 data 文件夹
            current_dir = Path(__file__).parent.parent
            data_dir = current_dir / "data"
            data_dir.mkdir(exist_ok=True)
            db_path = str(data_dir / "info_database.db")
        
        self.db_path = db_path
        self.engine = None
        self.SessionLocal = None
        self._initialize_database()
    
    def _initialize_database(self):
        """初始化数据库和表结构"""
        # 创建数据库引擎
        self.engine = create_engine(
            f'sqlite:///{self.db_path}',
            connect_args={'check_same_thread': False},
            poolclass=StaticPool,
            echo=False  # 设置为 True 可以看到 SQL 语句
        )
        
        # 创建所有表
        Base.metadata.create_all(bind=self.engine)
        
        # 创建会话工厂
        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine
        )
        
        print(f"✓ 个人信息数据库初始化成功: {self.db_path}")
    
    def get_session(self) -> Session:
        """
        获取数据库会话
        
        Returns:
            数据库会话对象
        """
        if self.SessionLocal is None:
            raise RuntimeError("数据库未初始化")
        return self.SessionLocal()
    
    def reset_database(self):
        """重置数据库（删除所有表并重新创建）- 仅用于测试"""
        Base.metadata.drop_all(bind=self.engine)
        Base.metadata.create_all(bind=self.engine)
        print("✓ 数据库已重置")
    
    def close(self):
        """关闭数据库连接"""
        if self.engine:
            self.engine.dispose()
            print("✓ 数据库连接已关闭")
    
    def get_table_info(self):
        """获取数据库表信息"""
        session = self.get_session()
        try:
            from sqlalchemy import inspect
            inspector = inspect(self.engine)
            tables = inspector.get_table_names()
            
            info = {
                'db_path': self.db_path,
                'tables': {}
            }
            
            for table_name in tables:
                columns = inspector.get_columns(table_name)
                info['tables'][table_name] = {
                    'columns': [col['name'] for col in columns],
                    'count': session.execute(f"SELECT COUNT(*) FROM {table_name}").scalar()
                }
            
            return info
        finally:
            session.close()


# 全局单例
_info_db_manager = None


def get_info_db_manager(db_path: str = None) -> InfoDatabaseManager:
    """
    获取全局数据库管理器实例（单例模式）
    
    Args:
        db_path: 数据库文件路径（仅在首次调用时有效）
    
    Returns:
        数据库管理器实例
    """
    global _info_db_manager
    if _info_db_manager is None:
        _info_db_manager = InfoDatabaseManager(db_path)
    return _info_db_manager


if __name__ == "__main__":
    # 测试数据库管理器
    print("测试个人信息数据库管理器...")
    
    # 使用测试数据库
    test_db_path = "test_info_database.db"
    
    # 清理旧的测试数据库
    if os.path.exists(test_db_path):
        os.remove(test_db_path)
    
    try:
        # 初始化数据库
        db_manager = InfoDatabaseManager(test_db_path)
        
        # 获取表信息
        info = db_manager.get_table_info()
        print("\n数据库信息:")
        print(f"  路径: {info['db_path']}")
        print(f"  表数量: {len(info['tables'])}")
        for table_name, table_info in info['tables'].items():
            print(f"    - {table_name}: {len(table_info['columns'])} 列, {table_info['count']} 行")
        
        # 测试会话
        session = db_manager.get_session()
        print("\n✓ 会话创建成功")
        session.close()
        
        # 关闭数据库
        db_manager.close()
        
        print("\n✓ 所有测试通过！")
        
    finally:
        # 清理测试数据库
        if os.path.exists(test_db_path):
            os.remove(test_db_path)
            print(f"✓ 清理测试数据库: {test_db_path}")

