"""
LLM 对话服务
封装 SiliconFlow API，实现共情对话和对话历史管理
"""

import requests
import json
from typing import List, Dict, Optional

try:
    from . import config
    from .prompts import SYSTEM_PROMPT_EMOTION_COMPANION
except ImportError:
    import config
    from prompts import SYSTEM_PROMPT_EMOTION_COMPANION


class LLMService:
    """LLM 对话服务类"""
    
    def __init__(self, api_key: str = None, model: str = None):
        """
        初始化 LLM 服务
        
        Args:
            api_key: API 密钥，默认使用配置文件中的密钥
            model: 模型名称，默认使用配置文件中的模型
        """
        self.api_key = api_key or config.SILICONFLOW_API_KEY
        self.model = model or config.CHAT_MODEL
        self.api_url = config.SILICONFLOW_CHAT_URL
        
        # 系统提示词 - 从配置文件加载
        self.system_prompt = SYSTEM_PROMPT_EMOTION_COMPANION
    
    def chat(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> Dict:
        """
        发送对话请求
        
        Args:
            user_message: 用户消息
            conversation_history: 对话历史，格式为 [{"role": "user/assistant", "content": "..."}]
            temperature: 温度参数（0-1），控制创造性
            max_tokens: 最大返回长度
        
        Returns:
            包含回复和元数据的字典
        """
        # 构建消息列表
        messages = [{"role": "system", "content": self.system_prompt}]
        
        # 添加对话历史
        if conversation_history:
            messages.extend(conversation_history)
        
        # 添加当前用户消息
        messages.append(
            {
                "role": "user", 
                "content": user_message
            }
        )
        
        # 构建请求
        payload = {
            "model": self.model,
            "messages": messages,
            # "temperature": temperature,
            # "max_tokens": max_tokens
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(
                self.api_url,
                json=payload,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            
            # 提取回复内容
            assistant_message = result['choices'][0]['message']['content']
            
            return {
                'success': True,
                'message': assistant_message,
                'model': result.get('model'),
                'usage': result.get('usage'),
                'finish_reason': result['choices'][0].get('finish_reason')
            }
            
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e),
                'message': "抱歉，我现在有点累了，请稍后再试。"
            }
        except (KeyError, IndexError) as e:
            return {
                'success': False,
                'error': f"响应解析错误: {str(e)}",
                'message': "抱歉，我理解出现了一点问题。"
            }
    
    def chat_stream(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
        temperature: float = 0.7
    ):
        """
        流式对话（生成器）
        
        Args:
            user_message: 用户消息
            conversation_history: 对话历史
            temperature: 温度参数
        
        Yields:
            每个生成的文本片段
        """
        # 构建消息列表
        messages = [{"role": "system", "content": self.system_prompt}]
        
        if conversation_history:
            messages.extend(conversation_history)
        
        messages.append({"role": "user", "content": user_message})
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "stream": True
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(
                self.api_url,
                json=payload,
                headers=headers,
                stream=True,
                timeout=30
            )
            response.raise_for_status()
            
            for line in response.iter_lines():
                if line:
                    line = line.decode('utf-8')
                    if line.startswith('data: '):
                        data = line[6:]
                        if data == '[DONE]':
                            break
                        try:
                            chunk = json.loads(data)
                            if 'choices' in chunk and len(chunk['choices']) > 0:
                                delta = chunk['choices'][0].get('delta', {})
                                if 'content' in delta:
                                    yield delta['content']
                        except json.JSONDecodeError:
                            continue
                            
        except requests.exceptions.RequestException as e:
            yield f"[错误: {str(e)}]"


class ConversationManager:
    """对话历史管理器"""
    
    def __init__(self, max_history: int = 10):
        """
        初始化对话管理器
        
        Args:
            max_history: 保留的最大对话轮数
        """
        self.max_history = max_history
        self.conversations = {}  # {user_id: [{"role": "...", "content": "..."}]}
    
    def add_message(self, user_id: str, role: str, content: str):
        """
        添加消息到对话历史
        
        Args:
            user_id: 用户 ID
            role: 角色（user/assistant）
            content: 消息内容
        """
        if user_id not in self.conversations:
            self.conversations[user_id] = []
        
        self.conversations[user_id].append({
            "role": role,
            "content": content
        })
        
        # 保持历史长度限制
        if len(self.conversations[user_id]) > self.max_history * 2:
            self.conversations[user_id] = self.conversations[user_id][-(self.max_history * 2):]
    
    def get_history(self, user_id: str) -> List[Dict[str, str]]:
        """获取用户的对话历史"""
        return self.conversations.get(user_id, [])
    
    def clear_history(self, user_id: str):
        """清空用户的对话历史"""
        if user_id in self.conversations:
            self.conversations[user_id] = []
    
    def get_last_n_messages(self, user_id: str, n: int) -> List[Dict[str, str]]:
        """获取最近 n 条消息"""
        history = self.get_history(user_id)
        return history[-n:] if len(history) > n else history


# 全局对话管理器实例
_conversation_manager = None


def get_conversation_manager() -> ConversationManager:
    """获取全局对话管理器实例"""
    global _conversation_manager
    if _conversation_manager is None:
        _conversation_manager = ConversationManager()
    return _conversation_manager


if __name__ == "__main__":
    # 测试 LLM 服务
    print("测试 LLM 对话服务...")
    
    llm = LLMService()
    
    # 测试对话
    print("\n1. 测试基础对话：")
    response = llm.chat("今天我考试没考好，心情很糟糕...")
    if response['success']:
        print(f"✓ 回复: {response['message']}")
    else:
        print(f"✗ 错误: {response['error']}")
    
    # 测试对话历史
    print("\n2. 测试对话历史管理：")
    manager = ConversationManager()
    
    user_id = "test_user"
    manager.add_message(user_id, "user", "今天考试没考好")
    manager.add_message(user_id, "assistant", "听起来你有点失落，能跟我说说吗？")
    manager.add_message(user_id, "user", "是的，我很难过")
    
    history = manager.get_history(user_id)
    print(f"✓ 对话历史: {len(history)} 条消息")
    
    # 继续对话
    response = llm.chat("我该怎么办？", conversation_history=history)
    if response['success']:
        print(f"✓ 回复: {response['message']}")
    
    print("\n✓ LLM 服务测试完成")

