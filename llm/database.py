"""
数据库连接和初始化
管理 SQLite 数据库连接，支持全局表和用户私有表
"""

import os
import re
from sqlalchemy import create_engine, Table, MetaData, inspect
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

try:
    from . import config
    from .models import Base, Post
except ImportError:
    import config
    from models import Base, Post


class DatabaseManager:
    """数据库管理器"""
    
    @staticmethod
    def _sanitize_user_id(user_id: str) -> str:
        """
        清理和验证 user_id，防止 SQL 注入
        只允许字母、数字和下划线
        
        Args:
            user_id: 原始用户 ID
            
        Returns:
            清理后的 user_id
            
        Raises:
            ValueError: 如果 user_id 包含非法字符
        """
        if not user_id:
            raise ValueError("user_id 不能为空")
        
        # 只允许字母、数字和下划线
        if not re.match(r'^[A-Za-z0-9_]+$', user_id):
            raise ValueError(
                f"user_id 包含非法字符，只允许字母、数字和下划线: {user_id}"
            )
        
        # 限制长度以防止过长的表名
        if len(user_id) > 100:
            raise ValueError(f"user_id 过长（最大 100 字符）: {len(user_id)}")
        
        return user_id
    
    def __init__(self, database_path: str = None):
        """
        初始化数据库管理器
        
        Args:
            database_path: 数据库文件路径，默认使用 config 中的配置
        """
        if database_path is None:
            database_path = config.DATABASE_PATH
        
        # 确保数据目录存在
        db_dir = os.path.dirname(database_path)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir)
        
        # 创建数据库引擎
        self.database_path = database_path
        self.engine = create_engine(
            f'sqlite:///{database_path}',
            connect_args={'check_same_thread': False},
            poolclass=StaticPool,
            echo=False  # 设为 True 可查看 SQL 日志
        )
        
        # 创建会话工厂
        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine
        )
        
        # 初始化全局表
        self._init_tables()
    
    def _init_tables(self):
        """初始化数据库表"""
        # 创建全局帖子表
        Base.metadata.create_all(bind=self.engine)
        print(f"✓ 数据库初始化完成: {self.database_path}")
    
    def get_session(self) -> Session:
        """获取数据库会话"""
        return self.SessionLocal()
    
    def create_user_table(self, user_id: str):
        """
        为用户创建私有表
        
        Args:
            user_id: 用户 ID
            
        Raises:
            ValueError: 如果 user_id 包含非法字符
        """
        # 清理 user_id 防止 SQL 注入
        sanitized_user_id = self._sanitize_user_id(user_id)
        table_name = f'user_{sanitized_user_id}_posts'
        
        # 检查表是否已存在
        inspector = inspect(self.engine)
        if table_name in inspector.get_table_names():
            return
        
        # 动态创建用户私有表（结构与全局表相同）
        metadata = MetaData()
        Table(
            table_name,
            metadata,
            *(col.copy() for col in Post.__table__.columns),
            extend_existing=True
        )
        metadata.create_all(self.engine)
        print(f"✓ 创建用户私有表: {table_name}")
    
    def get_user_table_name(self, user_id: str) -> str:
        """
        获取用户私有表名
        
        Args:
            user_id: 用户 ID（可能带或不带 user_ 前缀）
            
        Returns:
            清理后的表名（格式：user_{sanitized_user_id}_posts）
            
        Raises:
            ValueError: 如果 user_id 包含非法字符
        """
        # 清理 user_id 防止 SQL 注入
        sanitized_user_id = self._sanitize_user_id(user_id)
        
        # 如果用户ID已经以 user_ 开头，去掉这个前缀（因为我们会在后面统一添加）
        # 这样可以确保无论前端传入什么格式，生成的表名都一致
        if sanitized_user_id.startswith('user_'):
            sanitized_user_id = sanitized_user_id[5:]  # 去掉 'user_' 前缀
        
        return f'user_{sanitized_user_id}_posts'
    
    def table_exists(self, table_name: str) -> bool:
        """检查表是否存在"""
        inspector = inspect(self.engine)
        return table_name in inspector.get_table_names()
    
    def close(self):
        """关闭数据库连接"""
        self.engine.dispose()


# 全局数据库实例
_db_manager = None


def get_db_manager() -> DatabaseManager:
    """获取全局数据库管理器实例"""
    global _db_manager
    if _db_manager is None:
        _db_manager = DatabaseManager()
    return _db_manager


def get_db() -> Session:
    """
    获取数据库会话（用于依赖注入）
    
    使用方式:
        db = next(get_db())
        try:
            # 数据库操作
            pass
        finally:
            db.close()
    """
    db_manager = get_db_manager()
    db = db_manager.get_session()
    try:
        yield db
    finally:
        db.close()


if __name__ == "__main__":
    # 测试数据库初始化
    print("测试数据库初始化...")
    db_manager = DatabaseManager()
    print(f"数据库路径: {db_manager.database_path}")
    
    # 测试创建用户私有表
    test_user_id = "test_user_123"
    db_manager.create_user_table(test_user_id)
    
    # 检查表是否存在
    table_name = db_manager.get_user_table_name(test_user_id)
    if db_manager.table_exists(table_name):
        print(f"✓ 用户表创建成功: {table_name}")
    
    print("✓ 数据库测试完成")

