# -*- coding: utf-8 -*-
"""
FastAPI 应用入口
情绪记录与共鸣社区 LLM 后端服务
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional
import uvicorn

# 导入配置和模块
try:
    from . import config
    from .schemas import *
    from .llm_service import LLMService, get_conversation_manager
    from .emotion_analyzer import EmotionAnalyzer
    from .post_summarizer import PostSummarizer, GreetingGenerator
    from .database import get_db_manager
    from .crud import PostCRUD
    from .rag_service import RAGService
except ImportError:
    import config
    from schemas import *
    from llm_service import LLMService, get_conversation_manager
    from emotion_analyzer import EmotionAnalyzer
    from post_summarizer import PostSummarizer, GreetingGenerator
    from database import get_db_manager
    from crud import PostCRUD
    from rag_service import RAGService

app = FastAPI(
    title="情绪记录与共鸣社区 LLM API",
    description="提供对话、情绪分析、共鸣推荐和长期记忆功能",
    version="1.0.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化服务
llm_service = LLMService()
emotion_analyzer = EmotionAnalyzer()
post_summarizer = PostSummarizer()
greeting_generator = GreetingGenerator()
conversation_manager = get_conversation_manager()
db_manager = get_db_manager()
rag_service = RAGService()


# ==================== 基础端点 ====================

@app.get("/", response_model=HealthResponse)
async def root():
    """根路径 - 服务健康检查"""
    return HealthResponse(
        status="running",
        timestamp=datetime.now().isoformat(),
        version="1.0.0"
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """健康检查接口"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="1.0.0"
    )


# ==================== 对话端点 ====================

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    对话接口
    用户与 LLM 进行情绪倾诉和交流
    """
    try:
        # 使用 user_id 作为对话标识
        user_id = request.user_id
        
        # 获取对话历史
        history = conversation_manager.get_history(user_id)
        
        # 生成回复
        reply_result = llm_service.chat(request.message, history)
        reply = reply_result.get('message', '') if isinstance(reply_result, dict) else str(reply_result)
        
        # 保存对话
        conversation_manager.add_message(user_id, "user", request.message)
        conversation_manager.add_message(user_id, "assistant", reply)
        
        # 尝试分析情绪（可选）
        emotion_info = None
        try:
            emotion_result = emotion_analyzer.analyze(request.message)
            if emotion_result and emotion_result.get("emotion_tag"):
                emotion_info = EmotionInfo(
                    emotion_tag=emotion_result["emotion_tag"],
                    emotion_intensity=emotion_result["emotion_intensity"]
                )
        except Exception as e:
            print(f"情绪分析失败: {e}")
        
        return ChatResponse(
            conversation_id=user_id,
            reply=reply,
            emotion_detected=emotion_info
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"对话失败: {str(e)}")


# ==================== 情绪分析端点 ====================

@app.post("/analyze_emotion", response_model=EmotionAnalyzeResponse)
async def analyze_emotion(request: EmotionAnalyzeRequest):
    """
    情绪分析接口
    分析文本或对话的情绪信息
    """
    try:
        # 验证至少提供了 text 或 conversation_id 之一
        if not request.text and not request.conversation_id:
            raise HTTPException(
                status_code=400,
                detail="必须提供 text 或 conversation_id 参数之一"
            )
        
        # 如果提供了对话 ID，分析整个对话
        if request.conversation_id:
            result = emotion_analyzer.analyze_conversation(
                conversation_manager.get_history(request.conversation_id)
            )
        else:
            # 否则分析单个文本
            result = emotion_analyzer.analyze(request.text)
        
        if not result:
            raise HTTPException(status_code=400, detail="情绪分析失败")
        
        return EmotionAnalyzeResponse(
            emotion_tag=result["emotion_tag"],
            emotion_intensity=result["emotion_intensity"],
            analysis=result.get("reason")
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"情绪分析失败: {str(e)}")


# ==================== 总结生成端点 ====================

@app.post("/generate_summary", response_model=SummaryResponse)
async def generate_summary(request: SummaryRequest):
    """
    生成总结接口
    从对话或文本生成帖子总结
    """
    try:
        # 从对话生成总结
        if request.conversation_id:
            history = conversation_manager.get_history(request.conversation_id)
            summary_result = post_summarizer.generate_summary(history)
            # 获取对话文本用于情绪分析
            text_for_emotion = " ".join([msg["content"] for msg in history if msg["role"] == "user"])
        # 从文本生成总结
        elif request.text:
            summary_result = post_summarizer.generate_summary_from_text(request.text)
            text_for_emotion = request.text
        else:
            raise HTTPException(status_code=400, detail="必须提供 conversation_id 或 text")
        
        if not summary_result or not summary_result.get('success'):
            raise HTTPException(status_code=400, detail="总结生成失败")
        
        # 分析情绪
        emotion_result = emotion_analyzer.analyze(text_for_emotion)
        
        return SummaryResponse(
            summary=summary_result["summary"],
            emotion_tag=emotion_result["emotion_tag"],
            emotion_intensity=emotion_result["emotion_intensity"]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"总结生成失败: {str(e)}")


# ==================== 发帖端点 ====================

@app.post("/publish_post", response_model=PublishPostResponse)
async def publish_post(request: PublishPostRequest):
    """
    发帖接口
    发布情绪帖子到全局和用户私有数据库，并生成跟进消息
    """
    try:
        # 如果未提供情绪信息，自动分析
        emotion_tag = request.emotion_tag
        emotion_intensity = request.emotion_intensity
        
        if not emotion_tag or not emotion_intensity:
            emotion_result = emotion_analyzer.analyze(request.content)
            if not emotion_result:
                raise HTTPException(status_code=400, detail="无法分析情绪，请手动提供")
            emotion_tag = emotion_result["emotion_tag"]
            emotion_intensity = emotion_result["emotion_intensity"]
        
        # 生成时间戳
        timestamp_dt = datetime.now()
        timestamp = timestamp_dt.isoformat()
        
        # 添加到数据库（全局）
        db = db_manager.get_session()
        try:
            post = PostCRUD.create_post(
                db=db,
                user_id=request.user_id,
                username=request.username,
                timestamp=timestamp_dt,
                emotion_tag=emotion_tag,
                emotion_intensity=emotion_intensity,
                content=request.content
            )
            post_id_global = post.id
        finally:
            db.close()
        
        # 添加到用户私有表
        PostCRUD.create_post_in_user_table(
            user_id=request.user_id,
            username=request.username,
            timestamp=timestamp_dt,
            emotion_tag=emotion_tag,
            emotion_intensity=emotion_intensity,
            content=request.content
        )
        
        # 添加到向量数据库
        try:
            index_result = rag_service.index_post(
                user_id=request.user_id,
                username=request.username,
                emotion_tag=emotion_tag,
                emotion_intensity=emotion_intensity,
                content=request.content,
                timestamp=timestamp
            )
            if index_result['success']:
                global_vector_id = index_result['global_vector_id']
                user_vector_id = index_result['user_vector_id']
            else:
                print(f"向量索引失败: {index_result.get('error', '未知错误')}")
                global_vector_id = -1
                user_vector_id = -1
        except Exception as e:
            print(f"向量索引失败: {e}")
            global_vector_id = -1
            user_vector_id = -1
        
        # 生成跟进消息
        had_conversation = bool(request.conversation_id)
        follow_up = greeting_generator.generate_follow_up(
            post_content=request.content,
            emotion_tag=emotion_tag,
            emotion_intensity=emotion_intensity,
            had_conversation=had_conversation
        )
        
        # 构建帖子信息
        post_info = PostInfo(
            user_id=request.user_id,
            username=request.username,
            timestamp=timestamp,
            emotion_tag=emotion_tag,
            emotion_intensity=emotion_intensity,
            content=request.content
        )
        
        return PublishPostResponse(
            post_id=post_id_global,
            global_vector_id=global_vector_id,
            user_vector_id=user_vector_id,
            post_info=post_info,
            follow_up_message=follow_up
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"发帖失败: {str(e)}")


# ==================== 共鸣推荐端点 ====================

@app.post("/resonance_posts", response_model=ResonanceResponse)
async def get_resonance_posts(request: ResonanceRequest):
    """
    共鸣推荐接口
    基于情绪和内容推荐相似的帖子
    """
    try:
        # 如果提供了 post_id，从数据库获取帖子信息
        if request.post_id:
            db = db_manager.get_session()
            try:
                post = PostCRUD.get_post_by_id(db, request.post_id)
                if not post:
                    raise HTTPException(status_code=404, detail="帖子不存在")
                emotion_tag = post.emotion_tag
                emotion_intensity = post.emotion_intensity
                content = post.content
            finally:
                db.close()
        # 否则使用提供的参数
        elif request.emotion_tag and request.content:
            emotion_tag = request.emotion_tag
            emotion_intensity = request.emotion_intensity or 5
            content = request.content
        else:
            raise HTTPException(
                status_code=400,
                detail="必须提供 post_id 或 (emotion_tag + content)"
            )
        
        # 检索共鸣帖子
        results = rag_service.find_resonance_posts(
            emotion_tag=emotion_tag,
            emotion_intensity=emotion_intensity,
            content=content,
            limit=request.k,
            exclude_user_id=request.user_id if request.exclude_self else None
        )
        
        # 转换为响应格式
        posts = [
            PostWithSimilarity(**result) for result in results
        ]
        
        return ResonanceResponse(
            posts=posts,
            total=len(posts)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"共鸣推荐失败: {str(e)}")


# ==================== 问候语端点 ====================

@app.post("/greeting", response_model=GreetingResponse)
async def generate_greeting(request: GreetingRequest):
    """
    问候语接口
    基于用户历史生成个性化问候
    """
    try:
        # 获取用户历史上下文
        context = rag_service.get_personalized_greeting_context(
            user_id=request.user_id,
            limit=5
        )
        
        if not context:
            # 没有历史记录，返回通用问候（根据 max_greetings 生成多条）
            default_greetings = [
                "你好！很高兴见到你。有什么想聊的吗？",
                "嗨！今天过得怎么样？",
                "你好呀！有什么想分享的吗？",
                "很高兴见到你！最近有什么新鲜事吗？",
                "你好！我在这里陪你聊天～",
                "嗨！想聊些什么呢？",
                "你好呀！今天心情如何？",
                "很开心见到你！有什么想说的吗？",
                "你好！随时可以和我聊天哦～",
                "嗨！我一直在这里等你～"
            ]
            return GreetingResponse(
                greetings=default_greetings[:request.max_greetings],
                context_posts=[]
            )
        
        # 生成个性化问候（根据 max_greetings 生成多条）
        greetings = []
        for _ in range(request.max_greetings):
            greeting_result = greeting_generator.generate_greeting(
                user_history=context,
                username=request.username or "朋友"
            )
            greetings.append(greeting_result['greeting'])
        
        # 转换上下文帖子格式
        context_posts = [
            PostInfo(**post) for post in context
        ]
        
        return GreetingResponse(
            greetings=greetings,
            context_posts=context_posts
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"问候语生成失败: {str(e)}")


# ==================== 跟进消息端点 ====================

@app.post("/follow_up", response_model=FollowUpResponse)
async def generate_follow_up(request: FollowUpRequest):
    """
    跟进消息接口
    发帖后生成跟进消息
    """
    try:
        # 获取帖子信息
        db = db_manager.get_session()
        try:
            post = PostCRUD.get_post_by_id(db, request.post_id)
            if not post:
                raise HTTPException(status_code=404, detail="帖子不存在")
        finally:
            db.close()
        
        # 生成跟进消息
        follow_up = greeting_generator.generate_follow_up(
            post_content=post.content,
            emotion_tag=post.emotion_tag,
            emotion_intensity=post.emotion_intensity,
            had_conversation=request.had_conversation
        )
        
        # 构建帖子信息
        post_info = PostInfo(
            user_id=post.user_id,
            username=post.username,
            timestamp=post.timestamp.isoformat() if isinstance(post.timestamp, datetime) else post.timestamp,
            emotion_tag=post.emotion_tag,
            emotion_intensity=post.emotion_intensity,
            content=post.content
        )
        
        return FollowUpResponse(
            follow_up_message=follow_up,
            post_info=post_info
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"跟进消息生成失败: {str(e)}")


# ==================== 主动关怀端点 ====================

@app.post("/proactive_care", response_model=ProactiveCareResponse)
async def generate_proactive_care(request: ProactiveCareRequest):
    """
    主动关怀接口
    基于用户历史生成关怀消息列表
    支持 offset 参数实现顺序访问所有历史记录
    """
    try:
        # 获取用户历史帖子（从 info_database 目录），使用 offset 顺序访问
        user_history = rag_service.find_user_memories(
            user_id=request.user_id,
            limit=10,  # 每次获取10条帖子用于生成关怀消息
            offset=request.offset  # 使用 offset 顺序读取历史
        )
        
        # 生成关怀消息列表
        care_result = greeting_generator.generate_proactive_care_messages(
            user_history=user_history,
            username=request.username or "朋友",
            max_messages=request.max_messages
        )
        
        if not care_result.get('success'):
            raise HTTPException(status_code=400, detail="关怀消息生成失败")
        
        # 转换历史帖子格式
        context_posts = [
            PostInfo(
                user_id=post.get('user_id', request.user_id),
                username=post.get('username', ''),
                timestamp=post.get('timestamp', ''),
                emotion_tag=post.get('emotion_tag', ''),
                emotion_intensity=post.get('emotion_intensity', 5),
                content=post.get('content', '')
            )
            for post in user_history[:5]  # 只返回最近5条作为上下文
        ]
        
        return ProactiveCareResponse(
            messages=care_result.get('messages', []),
            context_posts=context_posts
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"主动关怀生成失败: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True
    )

