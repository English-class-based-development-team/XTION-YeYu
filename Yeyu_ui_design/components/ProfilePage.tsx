import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { X, Edit2, Camera, Smile, MessageCircle, Heart, Settings, Clock, ChevronRight } from "lucide-react";
import { EMOTION_TAGS_CN } from "../constants/emotions";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProfilePageProps {
  onClose: () => void;
}

interface UserProfile {
  avatar: string;
  nickname: string;
  greeting: string;
  joinDate: string;
}

interface MyBottle {
  id: string;
  tag: string;
  content: string;
  date: string;
}

interface MyResonance {
  id: string;
  tag: string;
  content: string;
  date: string;
}

interface SavedConversation {
  id: string;
  title: string;
  preview: string;
  date: string;
}

// 获取时间段问候语
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return "凌晨";
  if (hour < 12) return "早上";
  if (hour < 14) return "中午";
  if (hour < 18) return "下午";
  if (hour < 22) return "晚上";
  return "深夜";
};

// 计算陪伴天数
const getCompanionDays = (joinDate: string) => {
  const start = new Date(joinDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
};

// 模拟7天情绪数据 - 时间序列格式
const mockEmotionData = [
  { date: "周一", 平静: 30, 快乐: 20, 焦虑: 15, 感恩: 10 },
  { date: "周二", 平静: 25, 快乐: 30, 焦虑: 10, 感恩: 15 },
  { date: "周三", 平静: 20, 快乐: 25, 焦虑: 25, 感恩: 8 },
  { date: "周四", 平静: 35, 快乐: 15, 焦虑: 18, 感恩: 12 },
  { date: "周五", 平静: 28, 快乐: 28, 焦虑: 12, 感恩: 18 },
  { date: "周六", 平静: 40, 快乐: 22, 焦虑: 8, 感恩: 15 },
  { date: "今天", 平静: 32, 快乐: 26, 焦虑: 14, 感恩: 20 },
];

// 情绪颜色配置 - 使用应用的暖色调
const emotionColors = {
  平静: "#98D8C8",    // 温柔的青绿色
  快乐: "#FFD89C",    // 柔和的金色
  焦虑: "#FFB09C",    // 温暖的桃橙色
  感恩: "#E89B6D",    // 应用主色调
};

// 模拟我的漂流瓶
const mockBottles: MyBottle[] = [
  { id: "1", tag: EMOTION_TAGS_CN['calm'], content: "今天感觉心里很乱，希望能找到一个安静的角落...", date: "2天前" },
  { id: "2", tag: EMOTION_TAGS_CN['happy'], content: "终于完成了一个大项目，心情特别好！", date: "5天前" },
  { id: "3", tag: EMOTION_TAGS_CN['anxious'], content: "对未来有些迷茫，不知道该怎么办...", date: "1周前" },
];

// 模拟我的共鸣记录
const mockResonances: MyResonance[] = [
  { id: "1", tag: EMOTION_TAGS_CN['lonely'], content: "总觉得没人能真正理解我的感受...", date: "1天前" },
  { id: "2", tag: EMOTION_TAGS_CN['hopeful'], content: "虽然现在很难，但我相信会变好的", date: "3天前" },
];

// 模拟保存的对话
const mockConversations: SavedConversation[] = [
  { id: "1", title: "关于焦虑的对话", preview: "AI帮我分析了焦虑的来源...", date: "昨天" },
  { id: "2", title: "如何放松心情", preview: "学到了一些冥想的技巧...", date: "4天前" },
];

export function ProfilePage({ onClose }: ProfilePageProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    avatar: "",
    nickname: "爱敲代码的你",
    greeting: "继续保持热爱",
    joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天前
  });

  const [editingProfile, setEditingProfile] = useState<UserProfile>(profile);

  // 加载用户数据
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setEditingProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleSaveProfile = () => {
    setProfile(editingProfile);
    localStorage.setItem("userProfile", JSON.stringify(editingProfile));
    setIsEditingProfile(false);
  };

  const handleAvatarChange = () => {
    // 简单的头像选择逻辑
    const avatars = ["😊", "🌟", "🌸", "🎨", "📚", "🎵", "☕", "🌈"];
    const currentIndex = avatars.indexOf(editingProfile.avatar);
    const nextIndex = (currentIndex + 1) % avatars.length;
    setEditingProfile({ ...editingProfile, avatar: avatars[nextIndex] });
  };

  const companionDays = getCompanionDays(profile.joinDate);
  const timeGreeting = getTimeGreeting();

  return (
    <motion.div
      className="fixed inset-0 z-[80] bg-gradient-to-b from-[#fef8f3] to-[#f5e6dc] overflow-y-auto"
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      <div className="min-h-full pb-20">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-b from-[#fef8f3] to-transparent pb-4">
          <div className="pt-5 px-5 flex items-center justify-between">
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors active:scale-95"
            >
              <X className="w-6 h-6 text-[#2a1a4d]" strokeWidth={3} />
            </button>

            <h2 className="text-xl text-[#2a1a4d] font-semibold">个人中心</h2>

            <div className="w-12" /> {/* Spacer */}
          </div>
        </div>

        <div className="px-5 space-y-4">
          {/* Personal Info Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-[20px] bg-gradient-to-br from-[#ff9966] to-[#ff8855] flex items-center justify-center text-4xl shadow-lg">
                    {profile.avatar || "👤"}
                  </div>
                  {isEditingProfile && (
                    <button
                      onClick={handleAvatarChange}
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 active:scale-95"
                    >
                      <Camera className="w-4 h-4 text-[#E89B6D]" />
                    </button>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  {isEditingProfile ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingProfile.nickname}
                        onChange={(e) => setEditingProfile({ ...editingProfile, nickname: e.target.value })}
                        className="w-full px-3 py-1.5 bg-gray-50 rounded-lg text-[#2a1a4d] outline-none focus:ring-2 focus:ring-[#E89B6D]/30"
                        placeholder="昵称"
                      />
                      <input
                        type="text"
                        value={editingProfile.greeting}
                        onChange={(e) => setEditingProfile({ ...editingProfile, greeting: e.target.value })}
                        className="w-full px-3 py-1.5 bg-gray-50 rounded-lg text-[#2a1a4d]/60 text-sm outline-none focus:ring-2 focus:ring-[#E89B6D]/30"
                        placeholder="个性化问候"
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="text-[#2a1a4d] text-xl font-semibold">
                        {profile.nickname}，{timeGreeting}好
                      </h3>
                      <p className="text-[#2a1a4d]/60 text-sm mt-1">
                        {profile.greeting}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors active:scale-95"
                >
                  <Edit2 className="w-4 h-4 text-[#E89B6D]" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingProfile(profile);
                      setIsEditingProfile(false);
                    }}
                    className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm text-[#2a1a4d]/60 transition-colors active:scale-95"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-[#E89B6D] to-[#F3B89A] hover:shadow-lg text-sm text-white transition-all active:scale-95"
                  >
                    保存
                  </button>
                </div>
              )}
            </div>

            {/* Companion Days */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#2a1a4d]/60">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  已陪伴你 <span className="text-[#E89B6D] font-semibold">{companionDays}</span> 天
                </span>
              </div>
            </div>
          </div>

          {/* Emotion Distribution */}
          <div className="bg-white rounded-[24px] p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Smile className="w-5 h-5 text-[#E89B6D]" />
              <h3 className="text-[#2a1a4d] font-semibold">情绪曲线</h3>
            </div>

            {/* Stacked Area Chart */}
            <div className="h-48 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={mockEmotionData}
                  margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                >
                  <defs>
                    {/* 渐变定义 - 柔和半透明 */}
                    <linearGradient id="colorCalm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={emotionColors.平静} stopOpacity={0.6}/>
                      <stop offset="95%" stopColor={emotionColors.平静} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorHappy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={emotionColors.快乐} stopOpacity={0.6}/>
                      <stop offset="95%" stopColor={emotionColors.快乐} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorAnxious" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={emotionColors.焦虑} stopOpacity={0.6}/>
                      <stop offset="95%" stopColor={emotionColors.焦虑} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorGrateful" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={emotionColors.感恩} stopOpacity={0.6}/>
                      <stop offset="95%" stopColor={emotionColors.感恩} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#f0f0f0" 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="date" 
                    stroke="#2a1a4d40"
                    tick={{ fill: '#2a1a4d80', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#f0f0f0' }}
                  />
                  <YAxis 
                    stroke="#2a1a4d40"
                    tick={{ fill: '#2a1a4d60', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={35}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#2a1a4d', fontWeight: 600, marginBottom: '4px' }}
                  />
                  {/* 堆叠面积图 - 从下到上依次叠加 */}
                  <Area
                    type="monotone"
                    dataKey="感恩"
                    stackId="1"
                    stroke={emotionColors.感恩}
                    strokeWidth={2}
                    fill="url(#colorGrateful)"
                  />
                  <Area
                    type="monotone"
                    dataKey="焦虑"
                    stackId="1"
                    stroke={emotionColors.焦虑}
                    strokeWidth={2}
                    fill="url(#colorAnxious)"
                  />
                  <Area
                    type="monotone"
                    dataKey="快乐"
                    stackId="1"
                    stroke={emotionColors.快乐}
                    strokeWidth={2}
                    fill="url(#colorHappy)"
                  />
                  <Area
                    type="monotone"
                    dataKey="平静"
                    stackId="1"
                    stroke={emotionColors.平静}
                    strokeWidth={2}
                    fill="url(#colorCalm)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
              {Object.entries(emotionColors).map(([emotion, color]) => (
                <div key={emotion} className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-[#2a1a4d]/70">{emotion}</span>
                </div>
              ))}
            </div>
          </div>

          {/* My Content */}
          <div className="bg-white rounded-[24px] p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-[#E89B6D]" />
              <h3 className="text-[#2a1a4d] font-semibold">我的内容</h3>
            </div>

            <div className="space-y-3">
              {/* My Bottles */}
              <div className="p-4 bg-gradient-to-r from-[#ff9966]/5 to-[#ff8855]/5 rounded-[18px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">🍾</div>
                    <span className="text-[#2a1a4d] font-semibold">我的漂流瓶</span>
                  </div>
                  <span className="text-[#E89B6D] text-sm font-semibold">{mockBottles.length}</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {mockBottles.map((bottle) => (
                    <div key={bottle.id} className="bg-white rounded-[12px] p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2 py-0.5 bg-[#E89B6D]/10 rounded-full text-xs text-[#E89B6D]">
                          {bottle.tag}
                        </span>
                        <span className="text-xs text-[#2a1a4d]/40">{bottle.date}</span>
                      </div>
                      <p className="text-[#2a1a4d]/80 line-clamp-2">{bottle.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* My Resonances */}
              <div className="p-4 bg-gradient-to-r from-[#89CFF0]/5 to-[#98D8C8]/5 rounded-[18px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">💫</div>
                    <span className="text-[#2a1a4d] font-semibold">查看的共鸣</span>
                  </div>
                  <span className="text-[#E89B6D] text-sm font-semibold">{mockResonances.length}</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {mockResonances.map((resonance) => (
                    <div key={resonance.id} className="bg-white rounded-[12px] p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2 py-0.5 bg-[#89CFF0]/10 rounded-full text-xs text-[#89CFF0]">
                          {resonance.tag}
                        </span>
                        <span className="text-xs text-[#2a1a4d]/40">{resonance.date}</span>
                      </div>
                      <p className="text-[#2a1a4d]/80 line-clamp-2">{resonance.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved Conversations */}
              <div className="p-4 bg-gradient-to-r from-[#FFD700]/5 to-[#FFA500]/5 rounded-[18px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">💬</div>
                    <span className="text-[#2a1a4d] font-semibold">保存的对话</span>
                  </div>
                  <span className="text-[#E89B6D] text-sm font-semibold">{mockConversations.length}</span>
                </div>
                <div className="space-y-2">
                  {mockConversations.map((conv) => (
                    <div key={conv.id} className="bg-white rounded-[12px] p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#2a1a4d] font-semibold text-xs">{conv.title}</span>
                        <span className="text-xs text-[#2a1a4d]/40">{conv.date}</span>
                      </div>
                      <p className="text-[#2a1a4d]/60 text-xs line-clamp-1">{conv.preview}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-[24px] p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-[#E89B6D]" />
              <h3 className="text-[#2a1a4d] font-semibold">设置</h3>
            </div>

            <div className="space-y-2">
              {[
                { icon: "🔔", label: "通知提醒" },
                { icon: "🔒", label: "隐私设置" },
                { icon: "🎨", label: "外观主题" },
                { icon: "❓", label: "帮助与反馈" },
                { icon: "ℹ️", label: "关于应用" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between p-4 rounded-[16px] hover:bg-gray-50 transition-colors active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-[#2a1a4d]">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#2a1a4d]/30" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
