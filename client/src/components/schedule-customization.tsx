// client/src/components/schedule-customization.tsx
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Bot, Send, Mic, RotateCcw, Check, Loader2, AlertCircle } from 'lucide-react';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { RoleModelProfileData } from './role-model-profile';
import { 
  customizeSchedule, 
  confirmSchedule,
  TimeSlot as APITimeSlot,
  CustomizeScheduleRequest
} from '@/services/scheduleService';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

interface ScheduleBlock extends Omit<APITimeSlot, 'icon'> {
  icon: React.ReactNode; 
  isModified?: boolean;
  originalTime?: string;
}

interface ScheduleCustomizationProps {
  profileData: RoleModelProfileData;
  userId: string;
  onBack: () => void;
  onConfirm: (schedule: ScheduleBlock[]) => void;
}
import { Briefcase, Dumbbell, BookOpen, Users, Moon, Coffee, Zap, Brain, Heart, Anchor, Palette, Home } from 'lucide-react';
const iconSize = 16;
const iconStroke = 2;
const categoryIcons: Record<string, React.ReactNode> = {
  work: <Briefcase size={iconSize} strokeWidth={iconStroke} />,
  health: <Dumbbell size={iconSize} strokeWidth={iconStroke} />,
  personal: <BookOpen size={iconSize} strokeWidth={iconStroke} />,
  family: <Users size={iconSize} strokeWidth={iconStroke} />,
  sleep: <Moon size={iconSize} strokeWidth={iconStroke} />,
  default: <Anchor size={iconSize} strokeWidth={iconStroke} />,
};

// API 응답(APITimeSlot)을 프론트엔드용(ScheduleBlock)으로 변환
const mapApiScheduleToUiSchedule = (apiSchedule: APITimeSlot[]): ScheduleBlock[] => {
  return apiSchedule.map(slot => ({
    ...slot,
    icon: categoryIcons[slot.category] || categoryIcons.default,
    isModified: false,
  }));
};

// 프론트엔드용(ScheduleBlock)을 API 요청용(APITimeSlot)으로 변환
const mapUiScheduleToApiSchedule = (uiSchedule: ScheduleBlock[]): APITimeSlot[] => {
  return uiSchedule.map(({ icon, isModified, originalTime, ...apiSlot }) => apiSlot);
};

const quickReplies = [
  "I'm a student",
  "I work 9-5",
  "I have 2 kids",
  "I'm self-employed",
  "Night owl schedule"
];

export function ScheduleCustomization({ 
  profileData, 
  userId,
  onBack, 
  onConfirm 
}: ScheduleCustomizationProps) {
  const { roleModel, schedule } = profileData;
  
  // Helper function to determine activity color
  const getActivityColor = (activity: string): string => {
    const lowerActivity = activity.toLowerCase();
    if (lowerActivity.includes('work') || lowerActivity.includes('meeting') || lowerActivity.includes('business')) return '#3b82f6';
    if (lowerActivity.includes('exercise') || lowerActivity.includes('workout') || lowerActivity.includes('training')) return '#10b981';
    if (lowerActivity.includes('read') || lowerActivity.includes('learn') || lowerActivity.includes('study')) return '#8b5cf6';
    if (lowerActivity.includes('family') || lowerActivity.includes('dinner') || lowerActivity.includes('breakfast')) return '#f59e0b';
    if (lowerActivity.includes('sleep')) return '#1a2332';
    return '#6b7280';
  };

  // Helper function to map category
  const getCategoryFromActivity = (activity: string): 'work' | 'personal' | 'health' | 'family' | 'sleep' => {
    const lowerActivity = activity.toLowerCase();
    if (lowerActivity.includes('work') || lowerActivity.includes('meeting') || lowerActivity.includes('business')) return 'work';
    if (lowerActivity.includes('exercise') || lowerActivity.includes('workout') || lowerActivity.includes('training')) return 'health';
    if (lowerActivity.includes('family') || lowerActivity.includes('dinner') || lowerActivity.includes('breakfast')) return 'family';
    if (lowerActivity.includes('sleep')) return 'sleep';
    return 'personal';
  };
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hi! Let's adapt ${roleModel.name}'s schedule to fit your life. Tell me about your daily commitments, work hours, and any specific constraints you have. I'll help customize the schedule to match your lifestyle while keeping the core principles.`,
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>(
    schedule.map((item, index) => ({
      id: `block-${index}`,
      time: item.time,
      activity: item.activity,
      category: getCategoryFromActivity(item.activity),
      icon: item.icon,
      color: getActivityColor(item.activity),
      isModified: false
    }))
  );

  // Store original schedule for reset
  const [originalSchedule] = useState<ScheduleBlock[]>(
    schedule.map((item, index) => ({
      id: `block-${index}`,
      time: item.time,
      activity: item.activity,
      category: getCategoryFromActivity(item.activity),
      icon: item.icon,
      color: getActivityColor(item.activity),
      isModified: false
    }))
  );
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

// handleSendMessage 함수만 수정 (파일의 나머지 부분은 동일)

const handleSendMessage = async (content: string) => {
  if (!content.trim() || isAiTyping) return;

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    type: 'user',
    content,
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);
  setInputMessage('');
  setIsAiTyping(true);
  setError(null);

  try {
    // Convert current schedule to API format (without React elements)
    const currentScheduleAPI: APITimeSlot[] = scheduleBlocks.map(block => ({
      id: block.id,
      time: block.time,
      activity: block.activity,
      category: block.category,
      color: block.color
    }));

    console.log('=== Sending Request ===');
    console.log('UserID:', userId);
    console.log('RoleModelID:', roleModel.id);
    console.log('User Query:', content);
    console.log('Schedule Length:', currentScheduleAPI.length);

    // Call backend API
    const response = await customizeSchedule({
      userId,
      roleModelId: roleModel.id,
      currentSchedule: currentScheduleAPI,
      userQuery: content
    });

    console.log('=== Backend Response ===');
    console.log('Success:', response.success);
    console.log('Has Data:', !!response.data);
    console.log('Message:', response.data?.message);
    console.log('Modified Schedule Length:', response.data?.modifiedSchedule?.length);

    if (response.success && response.data) {
      // Add AI response message
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.data.message || "I've customized your schedule!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Update schedule with modifications
      const updatedSchedule = response.data.modifiedSchedule.map((apiSlot, index) => {
        // Find original block to preserve icon
        const originalBlock = scheduleBlocks.find(b => b.id === apiSlot.id) || scheduleBlocks[index];
        const wasModified = originalBlock && 
          (originalBlock.time !== apiSlot.time || originalBlock.activity !== apiSlot.activity);

        return {
          ...apiSlot,
          icon: originalBlock?.icon || scheduleBlocks[0].icon,
          color: apiSlot.color || getActivityColor(apiSlot.activity),
          isModified: wasModified,
          originalTime: wasModified ? originalBlock?.time : undefined
        } as ScheduleBlock;
      });

      console.log('=== Updated Schedule ===');
      console.log('Length:', updatedSchedule.length);
      console.log('Modified items:', updatedSchedule.filter(s => s.isModified).length);

      setScheduleBlocks(updatedSchedule);
      toast.success('Schedule updated!');
    } else {
      const errorMsg = response.error || response.message || 'Invalid response from server';
      console.error('=== API Error ===');
      console.error('Error:', errorMsg);
      throw new Error(errorMsg);
    }
  } catch (error: any) {
    console.error('=== Error Customizing Schedule ===');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    
    // Extract meaningful error message
    let errorMsg = 'Failed to customize schedule. Please try again.';
    
    let specificError = 'Failed to customize schedule. Please try again.';
    const message = error?.message || ''; // error.message가 없어도 안전하게 처리

    if (message.includes('GEMINI_API_KEY')) {
      specificError = 'AI service is not configured. Please contact support.';
    } else if (message.includes('Failed to parse')) {
      specificError = 'AI gave an invalid response. Please try rephrasing your request.';
    } else if (message.includes('network') || message.includes('fetch')) {
      specificError = 'Network error. Please check your connection and try again.';
    } else if (message) { // 빈 문자열이 아닌 다른 메시지가 있다면
      specificError = message;
    }
    
    setError(specificError);
    
    // Add error message to chat
    const errorMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: `Sorry, I encountered an error: ${errorMsg}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, errorMessage]);

    // Show toast notification
    toast.error(errorMsg);
  } finally {
    setIsAiTyping(false);
  }
};

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleReset = () => {
    setScheduleBlocks([...originalSchedule]);
    toast.success('Schedule reset to original');
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    setError(null);

    try {
      // 1. React 상태인 scheduleBlocks를 API가 요구하는 APITimeSlot[] 형식으로 변환합니다.
      const scheduleToConfirm: APITimeSlot[] = scheduleBlocks.map(block => ({
        id: block.id,
        time: block.time,
        activity: block.activity,
        category: block.category,
        color: block.color,
      }));

      // 2. 백엔드 API 호출
      const response = await confirmSchedule({
        userId: userId,
        roleModelId: roleModel.id,
        roleModelName: roleModel.name, // ✨ 추가된 roleModelName
        schedule: scheduleToConfirm,
      });

      if (response.success && response.data) {
        console.log('Schedule confirmed!', response.data);
        // 3. 성공 시 App.tsx로 콜백을 실행 (예: 태스크보드 화면으로 이동)
        onConfirm(scheduleBlocks); 
        toast.success(response.data.message || 'Schedule confirmed successfully!');
      } else {
        throw new Error(response.error || 'Failed to confirm schedule');
      }

    } catch (err: any) {
      console.error('Failed to confirm schedule:', err);
      setError(`Failed to confirm schedule: ${err.message}`);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-[#e8eaed] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-[#1a2332] to-[#2a3748] shadow-lg">
        <div className="px-6 py-4 flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 
              className="text-white"
              style={{ 
                fontFamily: 'var(--font-headline)',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: '1.25rem'
              }}
            >
              Customize Your Schedule
            </h2>
            <p 
              className="text-white/60 text-sm"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Powered by AI
            </p>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content - Split View */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT: Chat Interface (60%) */}
        <div className="flex-1 lg:w-[60%] flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 bg-white">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#f8f9fa] to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#6366f1] rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 
                  className="text-[#1a2332]"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}
                >
                  AI Schedule Assistant
                </h3>
                <p className="text-xs text-[#6b7280]" style={{ fontFamily: 'var(--font-body)' }}>
                  {isAiTyping ? 'Typing...' : 'Online • Ready to help'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {message.type === 'ai' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-[#3b82f6] to-[#6366f1] rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" strokeWidth={2} />
                      </div>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.type === 'ai'
                          ? 'bg-[#f0f1f3] text-[#1a2332]'
                          : 'bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white'
                      }`}
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.95rem',
                        lineHeight: '1.5',
                        borderBottomLeftRadius: message.type === 'ai' ? '4px' : '16px',
                        borderBottomRightRadius: message.type === 'user' ? '4px' : '16px'
                      }}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {isAiTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#3b82f6] to-[#6366f1] rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" strokeWidth={2} />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-[#f0f1f3] flex items-center gap-1">
                      <div className="w-2 h-2 bg-[#6b7280] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-[#6b7280] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-[#6b7280] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Replies */}
          {messages.length <= 2 && !isAiTyping && (
            <div className="px-6 py-3 border-t border-gray-200 bg-[#f8f9fa]">
              <p className="text-xs text-[#6b7280] mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                Quick replies:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <Badge
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="cursor-pointer bg-white hover:bg-[#3b82f6] hover:text-white border border-gray-300 text-[#1a2332] transition-colors"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {reply}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isAiTyping && handleSendMessage(inputMessage)}
                placeholder="Type your message..."
                disabled={isAiTyping}
                className="flex-1 rounded-xl border-gray-300"
                style={{ fontFamily: 'var(--font-body)' }}
              />
              <Button
                onClick={() => handleSendMessage(inputMessage)}
                size="icon"
                disabled={isAiTyping || !inputMessage.trim()}
                className="bg-gradient-to-r from-[#3b82f6] to-[#6366f1] hover:from-[#6366f1] hover:to-[#3b82f6] text-white rounded-xl disabled:opacity-50"
              >
                {isAiTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-gray-300 rounded-xl"
              >
                <Mic className="w-4 h-4 text-[#6b7280]" />
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT: Schedule Preview (40%) */}
        <div className="flex-1 lg:w-[40%] flex flex-col bg-[#f8f9fa]">
          {/* Preview Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 
                  className="text-[#1a2332]"
                  style={{ 
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: '1.1rem'
                  }}
                >
                  Your Adapted Schedule
                </h3>
                <p className="text-xs text-[#6b7280]" style={{ fontFamily: 'var(--font-body)' }}>
                  Based on {roleModel.name}
                </p>
              </div>
              {isAiTyping && (
                <div className="flex items-center gap-2 text-[#3b82f6]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs" style={{ fontFamily: 'var(--font-body)' }}>Updating...</span>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Blocks */}
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-3 pb-4">
              {scheduleBlocks.map((block) => (
                <Card
                  key={block.id}
                  className={`p-4 bg-white border-l-4 transition-all duration-300 ${
                    block.isModified ? 'shadow-md ring-2 ring-yellow-200' : 'shadow-sm'
                  }`}
                  style={{
                    borderLeftColor: block.color,
                    background: block.isModified ? '#fffbeb' : 'white'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${block.color}15` }}
                    >
                      <div style={{ color: block.color }}>{block.icon}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <span 
                          className="text-[#1a2332]"
                          style={{ 
                            fontFamily: 'var(--font-body)',
                            fontWeight: 'var(--font-weight-semibold)',
                            fontSize: '0.9rem'
                          }}
                        >
                          {block.time}
                        </span>
                        {block.isModified && (
                          <Badge className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0">
                            Modified
                          </Badge>
                        )}
                      </div>
                      <p 
                        className="text-[#6b7280] text-sm"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {block.activity}
                      </p>
                      {block.isModified && block.originalTime && (
                        <p className="text-xs text-[#6b7280] mt-1 italic" style={{ fontFamily: 'var(--font-body)' }}>
                          Originally: {block.originalTime}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleConfirm}
            disabled={isConfirming || isAiTyping}
            className="flex-1 py-6 bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#10b981] text-white rounded-xl shadow-md disabled:opacity-50"
            style={{ 
              fontFamily: 'var(--font-body)',
              fontWeight: 'var(--font-weight-semibold)'
            }}
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Confirm Schedule
              </>
            )}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={isConfirming || isAiTyping}
            className="sm:w-auto px-6 py-6 border-gray-300 rounded-xl"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Original
          </Button>
        </div>
      </div>
    </div>
  );
}