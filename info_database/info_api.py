"""
个人信息 API 路由
提供用户资料、共鸣记录、保存对话、情绪统计等接口
"""

from fastapi import APIRouter, HTTPException, Path, Query
from typing import Optional
from datetime import datetime
import sys
import os

# 导入父目录模块
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from .info_schemas import *
    from .info_crud import UserProfileCRUD, ResonanceHistoryCRUD, SavedConversationCRUD, EmotionStatisticsCRUD
    from .info_database import get_info_db_manager
    from .emotion_statistics_service import EmotionStatisticsService
except ImportError:
    from info_schemas import *
    from info_crud import UserProfileCRUD, ResonanceHistoryCRUD, SavedConversationCRUD, EmotionStatisticsCRUD
    from info_database import get_info_db_manager
    from emotion_statistics_service import EmotionStatisticsService

# 导入主数据库 CRUD（用于获取漂流瓶列表）
try:
    from llm.crud import PostCRUD
    from llm.database import get_db_manager
except ImportError:
    try:
        from crud import PostCRUD
        from database import get_db_manager
    except ImportError:
        print("警告：无法导入主数据库模块")
        PostCRUD = None
        get_db_manager = None


# 创建路由器
router = APIRouter(prefix="/profile", tags=["个人中心"])


# ==================== 用户资料相关 ====================

@router.get("/{user_id}", response_model=UserProfileResponse)
async def get_user_profile(
    user_id: str = Path(..., description="用户 ID")
):
    """
    获取用户资料
    
    - **user_id**: 用户 ID
    """
    info_db = get_info_db_manager()
    db = info_db.get_session()
    
    try:
        profile = UserProfileCRUD.get_profile(db, user_id)
        
        if not profile:
            # 如果用户资料不存在，创建默认资料
            profile = UserProfileCRUD.create_or_update_profile(
                db, user_id,
                nickname="用户",
                avatar="👤",
                join_date=datetime.now()
            )
        
        return UserProfileResponse(**profile.to_dict())
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取用户资料失败: {str(e)}")
    finally:
        db.close()


@router.put("/{user_id}", response_model=UserProfileResponse)
async def update_user_profile(
    user_id: str = Path(..., description="用户 ID"),
    profile_data: UserProfileRequest = ...
):
    """
    更新用户资料
    
    - **user_id**: 用户 ID
    - **profile_data**: 要更新的资料信息
    """
    info_db = get_info_db_manager()
    db = info_db.get_session()
    
    try:
        profile = UserProfileCRUD.create_or_update_profile(
            db, user_id,
            wechat_user_id=profile_data.wechat_user_id,
            avatar=profile_data.avatar,
            nickname=profile_data.nickname,
            greeting=profile_data.greeting
        )
        
        return UserProfileResponse(**profile.to_dict())
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新用户资料失败: {str(e)}")
    finally:
        db.close()


# ==================== 漂流瓶列表 ====================

@router.get("/{user_id}/bottles", response_model=BottleListResponse)
async def get_user_bottles(
    user_id: str = Path(..., description="用户 ID"),
    limit: int = Query(50, ge=1, le=100, description="返回数量限制"),
    offset: int = Query(0, ge=0, description="偏移量")
):
    """
    获取用户的漂流瓶列表
    
    - **user_id**: 用户 ID
    - **limit**: 返回数量限制（1-100）
    - **offset**: 偏移量
    """
    if PostCRUD is None or get_db_manager is None:
        raise HTTPException(status_code=503, detail="漂流瓶服务不可用")
    
    main_db = get_db_manager()
    db = main_db.get_session()
    
    try:
        # 从用户私有表获取帖子
        posts = PostCRUD.get_user_posts_from_private_table(user_id, limit, offset)
        
        # 转换为响应格式
        bottles = []
        for post in posts:
            bottles.append(BottleResponse(
                id=post.get('id', 0) if isinstance(post, dict) else post.id,
                user_id=post['user_id'] if isinstance(post, dict) else post.user_id,
                username=post['username'] if isinstance(post, dict) else post.username,
                timestamp=post['timestamp'] if isinstance(post, dict) else post.timestamp.isoformat(),
                emotion_tag=post['emotion_tag'] if isinstance(post, dict) else post.emotion_tag,
                emotion_intensity=post['emotion_intensity'] if isinstance(post, dict) else post.emotion_intensity,
                content=post['content'] if isinstance(post, dict) else post.content
            ))
        
        return BottleListResponse(
            bottles=bottles,
            total=len(bottles)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取漂流瓶列表失败: {str(e)}")
    finally:
        db.close()


# ==================== 共鸣浏览记录 ====================

@router.get("/{user_id}/resonances", response_model=ResonanceHistoryResponse)
async def get_resonance_history(
    user_id: str = Path(..., description="用户 ID"),
    limit: int = Query(25, ge=1, le=25, description="返回数量限制（最多 25）")
):
    """
    获取用户的共鸣浏览记录
    
    - **user_id**: 用户 ID
    - **limit**: 返回数量限制（最多 25 条）
    """
    info_db = get_info_db_manager()
    db = info_db.get_session()
    
    try:
        records = ResonanceHistoryCRUD.get_resonance_history(db, user_id, limit)
        
        resonances = [
            ResonanceRecordResponse(**record.to_dict())
            for record in records
        ]
        
        total = ResonanceHistoryCRUD.get_resonance_count(db, user_id)
        
        return ResonanceHistoryResponse(
            resonances=resonances,
            total=total
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取共鸣记录失败: {str(e)}")
    finally:
        db.close()


@router.post("/{user_id}/resonances", response_model=ResonanceRecordResponse)
async def add_resonance_record(
    user_id: str = Path(..., description="用户 ID"),
    record_data: ResonanceRecordRequest = ...
):
    """
    添加共鸣浏览记录（自动维护 25 条限制）
    
    - **user_id**: 用户 ID
    - **record_data**: 共鸣记录数据
    """
    info_db = get_info_db_manager()
    db = info_db.get_session()
    
    try:
        record = ResonanceHistoryCRUD.add_resonance_record(
            db, user_id, record_data.post_id, record_data.post_data
        )
        
        return ResonanceRecordResponse(**record.to_dict())
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"添加共鸣记录失败: {str(e)}")
    finally:
        db.close()


# ==================== 保存的对话 ====================

@router.get("/{user_id}/conversations", response_model=ConversationListResponse)
async def get_saved_conversations(
    user_id: str = Path(..., description="用户 ID"),
    limit: int = Query(50, ge=1, le=100, description="返回数量限制"),
    offset: int = Query(0, ge=0, description="偏移量")
):
    """
    获取用户保存的对话列表
    
    - **user_id**: 用户 ID
    - **limit**: 返回数量限制（1-100）
    - **offset**: 偏移量
    """
    info_db = get_info_db_manager()
    db = info_db.get_session()
    
    try:
        conversations = SavedConversationCRUD.get_saved_conversations(db, user_id, limit, offset)
        
        conv_list = [
            SavedConversationResponse(**conv.to_dict())
            for conv in conversations
        ]
        
        total = SavedConversationCRUD.get_conversation_count(db, user_id)
        
        return ConversationListResponse(
            conversations=conv_list,
            total=total
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取保存的对话失败: {str(e)}")
    finally:
        db.close()


@router.post("/{user_id}/conversations", response_model=SavedConversationResponse)
async def save_conversation(
    user_id: str = Path(..., description="用户 ID"),
    conversation_data: SaveConversationRequest = ...
):
    """
    保存对话
    
    - **user_id**: 用户 ID
    - **conversation_data**: 对话数据
    """
    info_db = get_info_db_manager()
    db = info_db.get_session()
    
    try:
        conversation = SavedConversationCRUD.save_conversation(
            db, user_id,
            conversation_data.conversation_id,
            conversation_data.title,
            conversation_data.messages,
            conversation_data.preview
        )
        
        return SavedConversationResponse(**conversation.to_dict())
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"保存对话失败: {str(e)}")
    finally:
        db.close()


@router.delete("/{user_id}/conversations/{conversation_id}", response_model=SuccessResponse)
async def delete_saved_conversation(
    user_id: str = Path(..., description="用户 ID"),
    conversation_id: str = Path(..., description="对话 ID")
):
    """
    删除保存的对话
    
    - **user_id**: 用户 ID
    - **conversation_id**: 对话 ID
    """
    info_db = get_info_db_manager()
    db = info_db.get_session()
    
    try:
        # 验证对话属于该用户
        conversation = SavedConversationCRUD.get_conversation_by_id(db, conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="对话不存在")
        
        if conversation.user_id != user_id:
            raise HTTPException(status_code=403, detail="无权删除此对话")
        
        success = SavedConversationCRUD.delete_conversation(db, conversation_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="对话不存在")
        
        return SuccessResponse(
            success=True,
            message="对话删除成功"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除对话失败: {str(e)}")
    finally:
        db.close()


# ==================== 情绪统计 ====================

@router.get("/{user_id}/emotion-stats", response_model=EmotionStatisticsResponse)
async def get_emotion_statistics(
    user_id: str = Path(..., description="用户 ID"),
    force_update: bool = Query(False, description="是否强制更新统计")
):
    """
    获取用户的情绪统计数据（7天情绪曲线）
    
    - **user_id**: 用户 ID
    - **force_update**: 是否强制重新计算（默认从缓存读取）
    """
    try:
        # 获取情绪统计（从缓存或重新计算）
        stats_data = EmotionStatisticsService.get_user_emotion_stats(user_id, force_update)
        
        if not stats_data:
            raise HTTPException(status_code=404, detail="无法获取情绪统计数据")
        
        return EmotionStatisticsResponse(**stats_data)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取情绪统计失败: {str(e)}")


# ==================== 统计概览 ====================

@router.get("/{user_id}/stats", response_model=ProfileStatsResponse)
async def get_profile_stats(
    user_id: str = Path(..., description="用户 ID")
):
    """
    获取个人中心统计概览
    
    - **user_id**: 用户 ID
    """
    info_db = get_info_db_manager()
    db = info_db.get_session()
    
    try:
        # 获取用户资料
        profile = UserProfileCRUD.get_profile(db, user_id)
        
        # 计算陪伴天数
        if profile and profile.join_date:
            join_date = profile.join_date
            if isinstance(join_date, str):
                join_date = datetime.fromisoformat(join_date)
            days_diff = (datetime.now() - join_date).days
            companion_days = max(1, days_diff + 1)
        else:
            companion_days = 1
        
        # 获取各项统计
        bottles_count = 0
        if PostCRUD and get_db_manager:
            try:
                posts = PostCRUD.get_user_posts_from_private_table(user_id, limit=1000)
                bottles_count = len(posts)
            except:
                pass
        
        resonances_count = ResonanceHistoryCRUD.get_resonance_count(db, user_id)
        conversations_count = SavedConversationCRUD.get_conversation_count(db, user_id)
        
        return ProfileStatsResponse(
            bottles_count=bottles_count,
            resonances_count=resonances_count,
            conversations_count=conversations_count,
            companion_days=companion_days
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取统计概览失败: {str(e)}")
    finally:
        db.close()


# ==================== 测试端点 ====================

@router.get("/test/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "service": "个人信息服务",
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    print("✓ 个人信息 API 路由定义成功")
    print(f"  路由前缀: {router.prefix}")
    print(f"  端点数量: {len(router.routes)}")
    for route in router.routes:
        print(f"    - {route.methods} {route.path}")

