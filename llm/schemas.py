# -*- coding: utf-8 -*-
"""
API 数据模型定义
使用 Pydantic 进行请求和响应验证
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


# ==================== 基础模型 ====================

class EmotionInfo(BaseModel):
    """情绪信息"""
    emotion_tag: str = Field(..., description="情感标签")
    emotion_intensity: int = Field(..., ge=1, le=10, description="情绪强度（1-10）")


class PostInfo(BaseModel):
    """帖子信息（六字段）"""
    user_id: str = Field(..., description="用户 ID")
    username: str = Field(..., description="用户名")
    timestamp: str = Field(..., description="发帖时间")
    emotion_tag: str = Field(..., description="情感标签")
    emotion_intensity: int = Field(..., ge=1, le=10, description="情绪强度（1-10）")
    content: str = Field(..., description="帖子内容")


class PostWithSimilarity(PostInfo):
    """带相似度的帖子信息"""
    similarity: float = Field(..., description="相似度分数")


# ==================== 对话相关 ====================

class ChatRequest(BaseModel):
    """对话请求"""
    user_id: str = Field(..., description="用户 ID")
    message: str = Field(..., description="用户消息")
    conversation_id: Optional[str] = Field(None, description="对话 ID，不提供则创建新对话")


class ChatResponse(BaseModel):
    """对话响应"""
    conversation_id: str = Field(..., description="对话 ID")
    reply: str = Field(..., description="AI 回复")
    emotion_detected: Optional[EmotionInfo] = Field(None, description="检测到的情绪信息")


# ==================== 情绪分析相关 ====================

class EmotionAnalyzeRequest(BaseModel):
    """情绪分析请求"""
    text: Optional[str] = Field(None, description="待分析文本（可选，用于分析单独文本）")
    conversation_id: Optional[str] = Field(None, description="对话 ID（可选，用于分析整个对话）")


class EmotionAnalyzeResponse(BaseModel):
    """情绪分析响应"""
    emotion_tag: str = Field(..., description="情感标签")
    emotion_intensity: int = Field(..., description="情绪强度（1-10）")
    analysis: Optional[str] = Field(None, description="分析说明")


# ==================== 总结相关 ====================

class SummaryRequest(BaseModel):
    """总结请求"""
    conversation_id: Optional[str] = Field(None, description="对话 ID（从对话生成总结）")
    text: Optional[str] = Field(None, description="直接文本（直接总结）")
    user_id: str = Field(..., description="用户 ID")


class SummaryResponse(BaseModel):
    """总结响应"""
    summary: str = Field(..., description="总结内容")
    emotion_tag: str = Field(..., description="情感标签")
    emotion_intensity: int = Field(..., description="情绪强度（1-10）")


# ==================== 发帖相关 ====================

class PublishPostRequest(BaseModel):
    """发帖请求"""
    user_id: str = Field(..., description="用户 ID")
    username: str = Field(..., description="用户名")
    content: str = Field(..., description="帖子内容")
    emotion_tag: Optional[str] = Field(None, description="情感标签（可选，不提供则自动分析）")
    emotion_intensity: Optional[int] = Field(None, ge=1, le=10, description="情绪强度（可选，不提供则自动分析）")
    conversation_id: Optional[str] = Field(None, description="对话 ID（用于记录来源）")


class PublishPostResponse(BaseModel):
    """发帖响应"""
    post_id: int = Field(..., description="帖子 ID（数据库 ID）")
    global_vector_id: int = Field(..., description="全局向量 ID")
    user_vector_id: int = Field(..., description="用户私有向量 ID")
    post_info: PostInfo = Field(..., description="帖子完整信息")
    follow_up_message: str = Field(..., description="发帖后的跟进消息")


# ==================== 共鸣推荐相关 ====================

class ResonanceRequest(BaseModel):
    """共鸣推荐请求"""
    post_id: Optional[int] = Field(None, description="帖子 ID（基于已发布的帖子）")
    user_id: str = Field(..., description="用户 ID")
    emotion_tag: Optional[str] = Field(None, description="情感标签（直接查询）")
    emotion_intensity: Optional[int] = Field(None, ge=1, le=10, description="情绪强度（直接查询）")
    content: Optional[str] = Field(None, description="内容（直接查询）")
    k: int = Field(5, ge=1, le=20, description="返回结果数量")
    exclude_self: bool = Field(True, description="是否排除用户自己的帖子")


class ResonanceResponse(BaseModel):
    """共鸣推荐响应"""
    posts: List[PostWithSimilarity] = Field(..., description="推荐的共鸣帖子列表")
    total: int = Field(..., description="推荐数量")


# ==================== 问候语相关 ====================

class GreetingRequest(BaseModel):
    """问候语请求"""
    user_id: str = Field(..., description="用户 ID")
    username: Optional[str] = Field(None, description="用户名（可选）")
    max_greetings: int = Field(3, ge=1, le=10, description="最多生成的问候数量")


class GreetingResponse(BaseModel):
    """问候语响应"""
    greetings: List[str] = Field(..., description="问候语列表")
    context_posts: List[PostInfo] = Field(..., description="参考的历史帖子")


# ==================== 跟进消息相关 ====================

class FollowUpRequest(BaseModel):
    """跟进消息请求"""
    user_id: str = Field(..., description="用户 ID")
    post_id: int = Field(..., description="帖子 ID")
    had_conversation: bool = Field(..., description="发帖前是否有过对话")


class FollowUpResponse(BaseModel):
    """跟进消息响应"""
    follow_up_message: str = Field(..., description="跟进消息")
    post_info: PostInfo = Field(..., description="帖子信息")


# ==================== 主动关怀相关 ====================

class ProactiveCareRequest(BaseModel):
    """主动关怀请求"""
    user_id: str = Field(..., description="用户 ID")
    username: Optional[str] = Field(None, description="用户名（可选）")
    max_messages: int = Field(8, ge=1, le=10, description="最多生成的关怀消息数量")
    offset: int = Field(0, ge=0, description="历史记录读取偏移量，用于顺序访问所有历史")


class ProactiveCareResponse(BaseModel):
    """主动关怀响应"""
    messages: List[str] = Field(..., description="关怀消息列表")
    context_posts: List[PostInfo] = Field(..., description="参考的历史帖子")


# ==================== 通用响应 ====================

class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str = Field(..., description="服务状态")
    timestamp: str = Field(..., description="当前时间")
    version: str = Field(..., description="版本号")


class ErrorResponse(BaseModel):
    """错误响应"""
    error: str = Field(..., description="错误类型")
    message: str = Field(..., description="错误消息")
    detail: Optional[Any] = Field(None, description="错误详情")

