"""
个人信息 API 数据模型定义
使用 Pydantic 进行请求和响应验证
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


# ==================== 用户资料相关 ====================

class UserProfileRequest(BaseModel):
    """用户资料更新请求"""
    wechat_user_id: Optional[str] = Field(None, description="微信用户 ID")
    avatar: Optional[str] = Field(None, description="头像（emoji 或 URL）")
    nickname: Optional[str] = Field(None, description="昵称")
    greeting: Optional[str] = Field(None, description="个性化问候语")


class UserProfileResponse(BaseModel):
    """用户资料响应"""
    id: int = Field(..., description="数据库 ID")
    user_id: str = Field(..., description="用户 ID")
    wechat_user_id: Optional[str] = Field(None, description="微信用户 ID")
    avatar: Optional[str] = Field(None, description="头像")
    nickname: str = Field(..., description="昵称")
    greeting: Optional[str] = Field(None, description="个性化问候语")
    join_date: str = Field(..., description="加入日期")
    created_at: str = Field(..., description="创建时间")
    updated_at: str = Field(..., description="更新时间")


# ==================== 漂流瓶相关 ====================

class BottleResponse(BaseModel):
    """漂流瓶响应"""
    id: int = Field(..., description="帖子 ID")
    user_id: str = Field(..., description="用户 ID")
    username: str = Field(..., description="用户名")
    timestamp: str = Field(..., description="发帖时间")
    emotion_tag: str = Field(..., description="情感标签")
    emotion_intensity: int = Field(..., description="情绪强度（1-10）")
    content: str = Field(..., description="帖子内容")


class BottleListResponse(BaseModel):
    """漂流瓶列表响应"""
    bottles: List[BottleResponse] = Field(..., description="漂流瓶列表")
    total: int = Field(..., description="总数")


# ==================== 共鸣浏览记录相关 ====================

class ResonanceRecordRequest(BaseModel):
    """添加共鸣浏览记录请求"""
    post_id: int = Field(..., description="帖子 ID")
    post_data: Dict[str, Any] = Field(..., description="帖子数据（六字段）")


class ResonanceRecordResponse(BaseModel):
    """共鸣浏览记录响应"""
    id: int = Field(..., description="记录 ID")
    user_id: str = Field(..., description="用户 ID")
    post_id: int = Field(..., description="帖子 ID")
    viewed_at: str = Field(..., description="查看时间")
    post_data: Dict[str, Any] = Field(..., description="帖子数据")


class ResonanceHistoryResponse(BaseModel):
    """共鸣浏览历史响应"""
    resonances: List[ResonanceRecordResponse] = Field(..., description="共鸣记录列表")
    total: int = Field(..., description="总数（最多 25 条）")


# ==================== 保存的对话相关 ====================

class SaveConversationRequest(BaseModel):
    """保存对话请求"""
    conversation_id: str = Field(..., description="对话 ID")
    title: str = Field(..., description="对话标题")
    messages: List[Dict[str, Any]] = Field(..., description="对话消息列表")
    preview: Optional[str] = Field(None, description="对话预览")


class SavedConversationResponse(BaseModel):
    """保存的对话响应"""
    id: int = Field(..., description="记录 ID")
    user_id: str = Field(..., description="用户 ID")
    conversation_id: str = Field(..., description="对话 ID")
    title: str = Field(..., description="对话标题")
    preview: Optional[str] = Field(None, description="对话预览")
    messages: List[Dict[str, Any]] = Field(..., description="对话消息列表")
    saved_at: str = Field(..., description="保存时间")


class ConversationListResponse(BaseModel):
    """保存的对话列表响应"""
    conversations: List[SavedConversationResponse] = Field(..., description="对话列表")
    total: int = Field(..., description="总数")


# ==================== 情绪统计相关 ====================

class EmotionDayData(BaseModel):
    """单日情绪数据"""
    date: str = Field(..., description="日期标签（周一、周二...或今天）")
    # 动态字段，包含各种情绪及其值
    # 例如：平静、快乐、焦虑、感恩等
    
    class Config:
        extra = 'allow'  # 允许额外字段


class EmotionStatisticsResponse(BaseModel):
    """情绪统计响应"""
    success: bool = Field(..., description="是否成功")
    user_id: Optional[str] = Field(None, description="用户 ID")
    start_date: Optional[str] = Field(None, description="开始日期")
    end_date: Optional[str] = Field(None, description="结束日期")
    days: Optional[int] = Field(None, description="统计天数")
    week_data: List[Dict[str, Any]] = Field(..., description="7天情绪数据")
    total_posts: Optional[int] = Field(None, description="总帖子数")


# ==================== 通用响应 ====================

class SuccessResponse(BaseModel):
    """成功响应"""
    success: bool = Field(True, description="操作是否成功")
    message: str = Field(..., description="消息")


class ErrorResponse(BaseModel):
    """错误响应"""
    error: str = Field(..., description="错误类型")
    message: str = Field(..., description="错误消息")
    detail: Optional[Any] = Field(None, description="错误详情")


# ==================== 统计概览相关 ====================

class ProfileStatsResponse(BaseModel):
    """个人中心统计概览"""
    bottles_count: int = Field(..., description="我的漂流瓶总数")
    resonances_count: int = Field(..., description="查看的共鸣总数")
    conversations_count: int = Field(..., description="保存的对话总数")
    companion_days: int = Field(..., description="陪伴天数")


# ==================== 示例数据 ====================

if __name__ == "__main__":
    # 测试 Schemas
    print("测试个人信息 API Schemas...")
    
    # 测试用户资料请求
    profile_req = UserProfileRequest(
        avatar="😊",
        nickname="测试用户",
        greeting="继续保持热爱"
    )
    print(f"\n✓ UserProfileRequest: {profile_req.dict()}")
    
    # 测试用户资料响应
    profile_resp = UserProfileResponse(
        id=1,
        user_id="test_user_001",
        wechat_user_id="wx_123",
        avatar="😊",
        nickname="测试用户",
        greeting="继续保持热爱",
        join_date="2025-01-01T00:00:00",
        created_at="2025-01-01T00:00:00",
        updated_at="2025-01-01T00:00:00"
    )
    print(f"✓ UserProfileResponse: {profile_resp.dict()}")
    
    # 测试共鸣记录请求
    resonance_req = ResonanceRecordRequest(
        post_id=1,
        post_data={
            'user_id': 'user_001',
            'username': '用户1',
            'timestamp': '2025-01-01T00:00:00',
            'emotion_tag': 'happy',
            'emotion_intensity': 8,
            'content': '今天很开心'
        }
    )
    print(f"✓ ResonanceRecordRequest: {resonance_req.dict()}")
    
    # 测试保存对话请求
    conv_req = SaveConversationRequest(
        conversation_id="conv_001",
        title="关于焦虑的对话",
        messages=[
            {'role': 'user', 'content': '我很焦虑'},
            {'role': 'assistant', 'content': '能说说是什么让你焦虑吗？'}
        ],
        preview="我很焦虑 能说说是什么让你焦虑吗？"
    )
    print(f"✓ SaveConversationRequest: {conv_req.dict()}")
    
    # 测试情绪统计响应
    stats_resp = EmotionStatisticsResponse(
        success=True,
        user_id="test_user_001",
        start_date="2025-01-01",
        end_date="2025-01-07",
        days=7,
        week_data=[
            {'date': '周一', '平静': 30, '快乐': 20},
            {'date': '周二', '平静': 25, '快乐': 30}
        ],
        total_posts=10
    )
    print(f"✓ EmotionStatisticsResponse: {stats_resp.dict()}")
    
    print("\n✓ 所有 Schemas 测试通过！")

