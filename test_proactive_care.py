#!/usr/bin/env python3
"""
测试 ProactiveCare 大模型生成功能
演示如何通过创建用户历史数据来触发大模型生成
"""

import requests
import json

API_BASE = "http://localhost:8000"

def test_with_history():
    """测试有历史数据时的大模型生成"""
    user_id = "test_user_with_history"
    username = "测试用户"
    
    print("=" * 60)
    print("测试场景：有用户历史数据 -> 调用大模型生成")
    print("=" * 60)
    
    # 步骤 1: 先发布一些帖子（创建历史数据）
    print("\n步骤 1: 创建用户历史数据...")
    posts = [
        {
            "user_id": user_id,
            "username": username,
            "content": "明天要考试了，有点紧张，不知道能不能考好",
            "emotion_tag": "anxious",
            "emotion_intensity": 7
        },
        {
            "user_id": user_id,
            "username": username,
            "content": "最近和朋友吵架了，心情不太好",
            "emotion_tag": "sad",
            "emotion_intensity": 6
        },
        {
            "user_id": user_id,
            "username": username,
            "content": "今天终于完成了一个大项目，感觉特别有成就感！",
            "emotion_tag": "happy",
            "emotion_intensity": 8
        }
    ]
    
    for i, post_data in enumerate(posts, 1):
        response = requests.post(f"{API_BASE}/publish_post", json=post_data)
        if response.status_code == 200:
            print(f"  ✓ 帖子 {i} 发布成功")
        else:
            print(f"  ✗ 帖子 {i} 发布失败: {response.text}")
    
    # 步骤 2: 等待一下，让数据写入数据库
    import time
    time.sleep(1)
    
    # 步骤 3: 调用 proactive_care API（这次应该会调用大模型）
    print("\n步骤 2: 调用 ProactiveCare API（应该会触发大模型生成）...")
    response = requests.post(
        f"{API_BASE}/proactive_care",
        json={
            "user_id": user_id,
            "username": username,
            "max_messages": 5
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        messages = data.get("messages", [])
        context_posts = data.get("context_posts", [])
        
        print(f"\n✓ 成功获取 {len(messages)} 条关怀消息")
        print("\n生成的关怀消息（由大模型生成）：")
        print("-" * 60)
        for i, msg in enumerate(messages, 1):
            print(f"{i}. {msg}")
        
        if context_posts:
            print(f"\n参考的历史帖子数量: {len(context_posts)}")
            print("这些历史帖子被用于生成个性化关怀消息")
    else:
        print(f"✗ API 调用失败: {response.status_code}")
        print(response.text)

def test_without_history():
    """测试无历史数据时的默认消息"""
    print("\n" + "=" * 60)
    print("测试场景：无用户历史数据 -> 返回默认消息（不调用大模型）")
    print("=" * 60)
    
    response = requests.post(
        f"{API_BASE}/proactive_care",
        json={
            "user_id": "new_user_no_history",
            "username": "新用户",
            "max_messages": 3
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        messages = data.get("messages", [])
        
        print(f"\n✓ 获取 {len(messages)} 条默认消息")
        print("\n默认关怀消息（不调用大模型）：")
        print("-" * 60)
        for i, msg in enumerate(messages, 1):
            print(f"{i}. {msg}")
        print("\n注意：这些是预定义的默认消息，不是大模型生成的")
    else:
        print(f"✗ API 调用失败: {response.status_code}")

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("ProactiveCare 大模型生成功能测试")
    print("=" * 60)
    
    # 测试无历史数据的情况
    test_without_history()
    
    # 测试有历史数据的情况（会调用大模型）
    test_with_history()
    
    print("\n" + "=" * 60)
    print("测试完成！")
    print("=" * 60)
    print("\n总结：")
    print("- 无历史数据 → 返回默认消息（不调用大模型）")
    print("- 有历史数据 → 调用大模型 API 生成个性化关怀消息")
    print("=" * 60)

