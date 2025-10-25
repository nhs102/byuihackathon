import React, { useState, useEffect } from 'react';
import { Play, Clock, CheckCircle2, ChevronDown, ChevronUp, Zap, Loader2, XCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react'; // Import all icons
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { RoleModel } from './role-model-card';
import { taskAPI } from '../services/apiService'; // API service import
import { useUser } from '../contexts/UserContext'; // UserContext import
import confetti from 'canvas-confetti';

// DB 스키마 기반 Task 인터페이스 수정
interface Task {
  id: number; // 스키마는 int8
  user_schedule_id: number;
  start_time: string | null; // 'HH:MM:SS' 형식, null 가능
  end_time: string | null; // 'HH:MM:SS' 형식, null 가능
  activity_name: string;
  category: string | null;
  is_completed: boolean;
  started_at: string | null; // timestamptz
  completed_at: string | null; // timestamptz
  completed_duration: number | null; // numeric
  display_order: number;
  created_at: string;
  // --- 프론트엔드에서 추가/계산할 필드 ---
  status: 'completed' | 'current' | 'upcoming' | 'missed';
  icon?: React.ReactNode; // 아이콘은 프론트에서 매핑
  color?: string; // 색상도 프론트에서 매핑
  duration?: number; // 분 단위 duration (계산 필요)
  timeRangeString?: string; // 'HH:MM AM - HH:MM PM' 형식
}

interface TaskBoardProps {
  roleModel: RoleModel;
  onNavigateToSchedule: () => void;
  onNavigateToRanking: () => void;
  onNavigateToHome?: () => void;
  onCompletePlan?: () => void;
}

// 아이콘 매핑 함수 (카테고리 또는 활동명 기반)
const getActivityIcon = (activityName: string, category: string | null): React.ReactNode => {
    const lowerActivity = activityName.toLowerCase();
    const lowerCategory = category?.toLowerCase();
    const iconSize = 20; // 아이콘 크기 통일

    // 카테고리 우선 매핑
    if (lowerCategory === 'work' || lowerCategory === 'business') return <LucideIcons.Briefcase size={iconSize} />;
    if (lowerCategory === 'health' || lowerCategory === 'exercise') return <LucideIcons.Dumbbell size={iconSize} />;
    if (lowerCategory === 'learning' || lowerCategory === 'self_development') return <LucideIcons.BookOpen size={iconSize} />;
    if (lowerCategory === 'family' || lowerCategory === 'relationships') return <LucideIcons.Users size={iconSize} />;
    if (lowerCategory === 'sleep') return <LucideIcons.Moon size={iconSize} />;
    if (lowerCategory === 'morning_routine' || lowerCategory === 'wellness') return <LucideIcons.Coffee size={iconSize} />;
    if (lowerCategory === 'planning') return <LucideIcons.ListChecks size={iconSize} />;
    if (lowerCategory === 'leisure' || lowerCategory === 'hobby') return <LucideIcons.Gamepad2 size={iconSize} />;

    // 활동명 기반 매핑
    if (lowerActivity.includes('work') || lowerActivity.includes('meeting') || lowerActivity.includes('email')) return <LucideIcons.Briefcase size={iconSize} />;
    if (lowerActivity.includes('exercise') || lowerActivity.includes('workout') || lowerActivity.includes('gym')) return <LucideIcons.Dumbbell size={iconSize} />;
    if (lowerActivity.includes('read') || lowerActivity.includes('learn') || lowerActivity.includes('study')) return <LucideIcons.BookOpen size={iconSize} />;
    if (lowerActivity.includes('family') || lowerActivity.includes('dinner') || lowerActivity.includes('breakfast') || lowerActivity.includes('lunch')) return <LucideIcons.Users size={iconSize} />;
    if (lowerActivity.includes('sleep')) return <LucideIcons.Moon size={iconSize} />;
    if (lowerActivity.includes('wake up') || lowerActivity.includes('morning')) return <LucideIcons.Coffee size={iconSize} />;
    if (lowerActivity.includes('plan') || lowerActivity.includes('review')) return <LucideIcons.ListChecks size={iconSize} />;
    if (lowerActivity.includes('meditat')) return <LucideIcons.Heart size={iconSize} />;
    if (lowerActivity.includes('call') || lowerActivity.includes('phone')) return <LucideIcons.Phone size={iconSize} />;
    if (lowerActivity.includes('design') || lowerActivity.includes('develop')) return <LucideIcons.Brain size={iconSize} />;
    if (lowerActivity.includes('travel') || lowerActivity.includes('transit')) return <LucideIcons.Plane size={iconSize} />;

    return <LucideIcons.Zap size={iconSize} />; // 기본 아이콘
};

// 색상 매핑 함수
const getActivityColor = (activityName: string): string => {
    const lowerActivity = activityName.toLowerCase();
    if (lowerActivity.includes('work') || lowerActivity.includes('meeting') || lowerActivity.includes('email') || lowerActivity.includes('call') || lowerActivity.includes('develop')) return '#3b82f6'; // 파란색 계열
    if (lowerActivity.includes('exercise') || lowerActivity.includes('workout') || lowerActivity.includes('gym') || lowerActivity.includes('training')) return '#10b981'; // 녹색 계열
    if (lowerActivity.includes('read') || lowerActivity.includes('learn') || lowerActivity.includes('study') || lowerActivity.includes('plan') || lowerActivity.includes('review') || lowerActivity.includes('design') || lowerActivity.includes('brain')) return '#8b5cf6'; // 보라색 계열
    if (lowerActivity.includes('family') || lowerActivity.includes('dinner') || lowerActivity.includes('breakfast') || lowerActivity.includes('lunch') || lowerActivity.includes('relation')) return '#f59e0b'; // 주황색 계열
    if (lowerActivity.includes('sleep')) return '#1a2332'; // 네이비
    if (lowerActivity.includes('wake up') || lowerActivity.includes('morning') || lowerActivity.includes('coffee')) return '#f9a826'; // 금색 (Accent)
    if (lowerActivity.includes('meditat') || lowerActivity.includes('reflect') || lowerActivity.includes('wellness')) return '#ec4899'; // 핑크 계열
    return '#6b7280'; // 회색 (기본)
};

// 시간 포맷 함수 (HH:MM:SS -> HH:MM AM/PM)
const formatTimeString = (timeStr: string | null): string => {
    if (!timeStr) return '';
    try {
        const [hours, minutes] = timeStr.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
        console.error("Error formatting time:", timeStr, e);
        return timeStr; // 오류 시 원본 반환
    }
};

// 시간 범위 문자열 생성
const getTimeRangeString = (start: string | null, end: string | null): string => {
    const startTime = formatTimeString(start);
    const endTime = formatTimeString(end);
    if (startTime && endTime) {
        return `${startTime} - ${endTime}`;
    } else if (startTime) {
        return startTime;
    }
    return 'Time N/A'; // 시간이 없는 경우 명확히 표시
};

// 시간 차이 계산 (분 단위)
const calculateDurationMinutes = (start: string | null, end: string | null): number => {
    if (!start || !end) return 0;
    try {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        // 날짜를 명시적으로 동일하게 설정하여 시간 차이만 계산
        const startDate = new Date(2000, 0, 1, startH, startM);
        let endDate = new Date(2000, 0, 1, endH, endM);

        // 종료 시간이 시작 시간보다 이르면 다음 날로 간주 (예: 23:00 - 01:00)
        if (endDate < startDate) {
            endDate.setDate(endDate.getDate() + 1);
        }

        const diffMs = endDate.getTime() - startDate.getTime();
        return Math.round(diffMs / (1000 * 60)); // 분 단위로 반환, 반올림
    } catch (e) {
        console.error("Error calculating duration:", start, end, e);
        return 0;
    }
};


export function TaskBoard({ roleModel, onNavigateToHome, onNavigateToRanking, onCompletePlan }: TaskBoardProps) {
  const { user } = useUser();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelScheduleModal, setShowCancelScheduleModal] = useState(false);
  const [showCompletedSection, setShowCompletedSection] = useState(true);
  const [taskInProgress, setTaskInProgress] = useState(false);
  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 현재 시간 기준으로 현재 태스크 결정하는 함수
  const getCurrentTaskByTime = (taskList: Task[]): number => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // 완료되지 않은 태스크만 필터링
    const incompleteTasks = taskList.filter(task => !task.is_completed);
    
    for (let i = 0; i < incompleteTasks.length; i++) {
      const task = incompleteTasks[i];
      
      // start_time이 없으면 건너뛰기
      if (!task.start_time) continue;
      
      const [startHour, startMinute] = task.start_time.split(':').map(Number);
      const taskStartInMinutes = startHour * 60 + startMinute;
      
      // end_time이 있으면 시간 범위 체크
      if (task.end_time) {
        const [endHour, endMinute] = task.end_time.split(':').map(Number);
        let taskEndInMinutes = endHour * 60 + endMinute;
        
        // 종료 시간이 시작 시간보다 작으면 다음날로 간주 (자정 넘김)
        if (taskEndInMinutes < taskStartInMinutes) {
          taskEndInMinutes += 24 * 60;
          // 현재 시간도 자정 이전이면 24시간 추가
          let adjustedCurrentTime = currentTimeInMinutes;
          if (currentTimeInMinutes < taskStartInMinutes) {
            adjustedCurrentTime += 24 * 60;
          }
          
          // 현재 시간이 태스크 범위 내에 있으면 반환
          if (adjustedCurrentTime >= taskStartInMinutes && adjustedCurrentTime < taskEndInMinutes) {
            return taskList.indexOf(task);
          }
        } else {
          // 일반적인 경우 (같은 날 내)
          if (currentTimeInMinutes >= taskStartInMinutes && currentTimeInMinutes < taskEndInMinutes) {
            return taskList.indexOf(task);
          }
        }
      } else {
        // end_time이 없으면 시작 시간 이후면 현재 태스크로 간주
        if (currentTimeInMinutes >= taskStartInMinutes) {
          return taskList.indexOf(task);
        }
      }
    }
    
    // 현재 시간에 해당하는 태스크가 없으면 첫 번째 미완료 태스크 반환
    const firstIncompleteIndex = taskList.findIndex(task => !task.is_completed);
    return firstIncompleteIndex >= 0 ? firstIncompleteIndex : -1;
  };

  // 놓친 태스크 판별 함수
  const isMissedTask = (task: Task, currentTaskIndex: number, taskList: Task[]): boolean => {
    // 이미 완료된 태스크는 놓친 태스크가 아님
    if (task.is_completed) return false;
    
    const taskIndex = taskList.indexOf(task);
    // 현재 태스크이거나 현재 태스크 이후면 놓친 태스크가 아님
    if (taskIndex >= currentTaskIndex) return false;
    
    // start_time과 end_time이 없으면 판별 불가
    if (!task.end_time) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    const [endHour, endMinute] = task.end_time.split(':').map(Number);
    const taskEndInMinutes = endHour * 60 + endMinute;
    
    // 현재 시간이 태스크 종료 시간을 넘었으면 놓친 태스크
    return currentTimeInMinutes > taskEndInMinutes;
  };

  // API로 태스크 로드 (중복 제거된 버전)
  useEffect(() => {
    const fetchTasks = async () => {
      // 사용자 ID 없으면 로드 중단
      if (!user?.id) {
          setInitialLoading(false);
          setApiError("User not logged in. Please log in to view tasks.");
          setTasks([]); // 태스크 초기화
          return;
      }

      // 로딩 시작 및 상태 초기화
      setInitialLoading(true);
      setApiError(null);
      setTaskInProgress(false); // 로드 시작 시 진행 상태 초기화
      setTaskStartTime(null);  // 로드 시작 시 시작 시간 초기화

      try {
        // --- 콘솔 로그 추가 (API 호출 확인용) ---
        console.log(`Attempting to fetch tasks for user ID: ${user.id} at URL: ${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/hyun/users/${user.id}/active-tasks`);
        // --- 콘솔 로그 추가 ---

        // API 호출
        const response = await taskAPI.getActiveUserTasks(user.id);

        // --- 콘솔 로그 추가 (API 응답 확인용) ---
        console.log('API Response (active-tasks):', response);
        // --- 콘솔 로그 추가 ---

        if (response.success && Array.isArray(response.data)) {
          let activeTaskStartTime: Date | null = null;
          let isAnyTaskInProgress = false;

          // 먼저 모든 태스크를 처리 (status 없이)
          const processedTasks: Task[] = response.data.map((dbTask: any) => ({
            ...dbTask,
            status: dbTask.is_completed ? 'completed' : 'upcoming' as const,
            icon: getActivityIcon(dbTask.activity_name, dbTask.category),
            color: getActivityColor(dbTask.activity_name),
            timeRangeString: getTimeRangeString(dbTask.start_time, dbTask.end_time),
            duration: calculateDurationMinutes(dbTask.start_time, dbTask.end_time),
          }));

          // 현재 시간 기준으로 current 태스크 찾기
          const currentTaskIndex = getCurrentTaskByTime(processedTasks);
          
          // status 업데이트 (missed 상태 포함)
          const finalTasks = processedTasks.map((task, index) => {
            if (task.is_completed) {
              return { ...task, status: 'completed' as const };
            } else if (index === currentTaskIndex) {
              // 현재 진행 중인 태스크 확인 (started_at 있고 completed_at 없음)
              if (task.started_at && !task.completed_at) {
                activeTaskStartTime = new Date(task.started_at);
                isAnyTaskInProgress = true;
              }
              return { ...task, status: 'current' as const };
            } else if (isMissedTask(task, currentTaskIndex, processedTasks)) {
              // 놓친 태스크
              return { ...task, status: 'missed' as const };
            } else {
              return { ...task, status: 'upcoming' as const };
            }
          });

          setTasks(finalTasks);
          setTaskStartTime(activeTaskStartTime);
          setTaskInProgress(isAnyTaskInProgress);

        } else {
          // API 호출은 성공했으나 데이터가 없거나 실패 응답인 경우
          setApiError(response.error || 'Failed to fetch tasks.');
          setTasks([]); // 태스크 초기화
        }
      } catch (err: any) {
        // API 호출 자체에서 에러 발생 (네트워크 오류 등)
        console.error('Error during fetchTasks execution:', err); // 에러 로그 추가
        setApiError(err.message || 'An error occurred while fetching tasks.');
        setTasks([]); // 에러 시 태스크 초기화
      } finally {
        // 로딩 종료
        setInitialLoading(false);
      }
    };

    fetchTasks(); // useEffect 내부에서 정의한 async 함수 호출
  }, [user?.id]); // 사용자 ID가 변경될 때마다 이 훅을 다시 실행

  // 1분마다 현재 태스크 상태 업데이트 (시간이 지나면 자동으로 다음 태스크로 전환)
  useEffect(() => {
    const timer = setInterval(() => {
      setTasks(prevTasks => {
        if (prevTasks.length === 0) return prevTasks;
        
        const currentTaskIndex = getCurrentTaskByTime(prevTasks);
        let hasChanges = false;
        
        const updatedTasks = prevTasks.map((task, index) => {
          const newStatus: 'completed' | 'current' | 'upcoming' | 'missed' = task.is_completed ? 'completed' 
            : index === currentTaskIndex ? 'current'
            : isMissedTask(task, currentTaskIndex, prevTasks) ? 'missed'
            : 'upcoming';
          
          if (task.status !== newStatus) {
            hasChanges = true;
          }
          
          return { ...task, status: newStatus };
        });
        
        // 변경사항이 있을 때만 상태 업데이트
        if (hasChanges) {
          const newCurrentTask = updatedTasks.find(t => t.status === 'current');
          
          // 새로운 current 태스크가 진행 중이 아니면 진행 상태 초기화
          if (newCurrentTask) {
            if (!newCurrentTask.started_at || newCurrentTask.completed_at) {
              setTaskInProgress(false);
              setTaskStartTime(null);
            } else if (newCurrentTask.started_at) {
              setTaskInProgress(true);
              setTaskStartTime(new Date(newCurrentTask.started_at));
            }
          } else {
            setTaskInProgress(false);
            setTaskStartTime(null);
          }
          
          return updatedTasks;
        }
        
        return prevTasks;
      });
    }, 60000); // 1분마다 체크
    
    return () => clearInterval(timer);
  }, []);

  // 에러 자동 닫기
  useEffect(() => {
    if (apiError) {
      const timer = setTimeout(() => setApiError(null), 5000); // 5초 후 에러 메시지 숨김
      return () => clearTimeout(timer);
    }
  }, [apiError]);

  const currentTask = tasks.find(t => t.status === 'current');
  const upcomingTasks = tasks.filter(t => t.status === 'upcoming');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const missedTasks = tasks.filter(t => t.status === 'missed');
  const dayProgress = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  const handleStartTask = () => setShowStartModal(true);

  const confirmStartTask = async () => {
    if (!currentTask) return;
    setApiLoading(true);
    setApiError(null);

    try {
      const response = await taskAPI.startTask(currentTask.id);
      if (response.success && response.data?.task) {
        const apiStartedAt = response.data.task.started_at;
        const startTime = apiStartedAt ? new Date(apiStartedAt) : new Date();

        setTaskInProgress(true);
        setTaskStartTime(startTime);
        setTasks(prev => prev.map(t =>
          t.id === currentTask.id
            ? { ...t, started_at: startTime.toISOString(), status: 'current' }
            : t
        ));
        setShowStartModal(false);
      } else {
        setApiError(response.error || 'Failed to start task.');
        setShowStartModal(false);
      }
    } catch (err: any) {
      setApiError(err.message || 'An error occurred.');
      setShowStartModal(false);
    } finally {
      setApiLoading(false);
    }
  };

  const handleCompleteTask = () => setShowCompleteModal(true);

  const confirmCompleteTask = async () => {
    if (!currentTask) return;
    setApiLoading(true);
    setApiError(null);

    try {
      const response = await taskAPI.completeTask(currentTask.id);
      if (response.success) {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#f9a826', '#f7931e', '#10b981', '#3b82f6', '#ffffff']
        });

        // Mark current task as completed
        const updatedTasks = tasks.map((task) => {
          if (task.id === currentTask.id) {
            return {
              ...task,
              status: 'completed' as const,
              is_completed: true,
              completed_at: new Date().toISOString()
            };
          }
          return task;
        });

        // Determine next current task based on current time
        const currentTaskIndex = getCurrentTaskByTime(updatedTasks);
        
        // Update status
        const finalTasks = updatedTasks.map((task, index) => {
          if (task.is_completed) {
            return task;
          } else if (index === currentTaskIndex) {
            return { ...task, status: 'current' as const };
          } else if (isMissedTask(task, currentTaskIndex, updatedTasks)) {
            return { ...task, status: 'missed' as const };
          } else {
            return { ...task, status: 'upcoming' as const };
          }
        });

        setTasks(finalTasks);

        // Check progress status of new current task
        const newCurrentTask = finalTasks.find(t => t.status === 'current');
        if (newCurrentTask) {
          if (!newCurrentTask.started_at || newCurrentTask.completed_at) {
             setTaskInProgress(false);
             setTaskStartTime(null);
          } else {
             setTaskInProgress(true);
             setTaskStartTime(new Date(newCurrentTask.started_at));
          }
        } else {
          setTaskInProgress(false);
          setTaskStartTime(null);
        }

        setShowCompleteModal(false);
      } else {
        setApiError(response.error || 'Failed to complete task.');
        setShowCompleteModal(false);
      }
    } catch (err: any) {
      setApiError(err.message || 'An error occurred.');
      setShowCompleteModal(false);
    } finally {
      setApiLoading(false);
    }
  };

  const handleCancelSchedule = () => setShowCancelScheduleModal(true);

  const confirmCancelSchedule = async () => {
    if (!user?.id) return;
    setApiLoading(true);
    setApiError(null);

    try {
      const response = await taskAPI.cancelSchedule(user.id);
      if (response.success) {
        // Show confetti for completing the challenge
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#f9a826', '#f7931e', '#10b981', '#3b82f6', '#ffffff']
        });

        // Clear all tasks
        setTasks([]);
        setTaskInProgress(false);
        setTaskStartTime(null);
        setShowCancelScheduleModal(false);
        
        // Show success message with final score
        const finalScore = response.data?.finalScore || 0;
        
        // Create a custom success dialog
        const successMessage = document.createElement('div');
        successMessage.innerHTML = `
          <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                      background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                      z-index: 10000; max-width: 90%; width: 400px; text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
            <h2 style="font-family: var(--font-headline); font-weight: var(--font-weight-bold); 
                       font-size: 1.5rem; color: #1a2332; margin-bottom: 0.5rem;">
              Challenge Completed!
            </h2>
            <p style="font-family: var(--font-body); color: #6b7280; margin-bottom: 1rem;">
              Your final score: <strong>${finalScore} hours</strong><br/>
              Your result has been added to the rankings!
            </p>
            <p style="font-family: var(--font-body); font-size: 0.9rem; color: #f9a826;">
              Redirecting to rankings...
            </p>
          </div>
        `;
        document.body.appendChild(successMessage);
        
        // Navigate to rankings after delay
        setTimeout(() => {
          document.body.removeChild(successMessage);
          
          // Call onCompletePlan to reset the challenge state
          if (onCompletePlan) {
            onCompletePlan();
          }
          
          // Use onNavigateToRanking prop to navigate instead of reloading
          if (onNavigateToRanking) {
            onNavigateToRanking();
          }
        }, 2500);
        
      } else {
        setApiError(response.error || 'Failed to complete challenge.');
        setShowCancelScheduleModal(false);
      }
    } catch (err: any) {
      setApiError(err.message || 'An error occurred.');
      setShowCancelScheduleModal(false);
    } finally {
      setApiLoading(false);
    }
  };

  const getTimeElapsed = () => {
    if (!taskStartTime) return '00:00';
    const now = currentTime;
    const elapsed = Math.max(0, Math.floor((now.getTime() - taskStartTime.getTime()) / 1000));
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // 진행률 계산 함수 (옵션)
  const getTaskProgress = () => {
    if (!taskStartTime || !currentTask?.duration || currentTask.duration === 0) return 0;
    const elapsedMinutes = (currentTime.getTime() - taskStartTime.getTime()) / (1000 * 60);
    return Math.min(100, Math.max(0, (elapsedMinutes / currentTask.duration) * 100));
  };


  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f8f9fa] to-[#e8eaed]">
        <Loader2 className="w-16 h-16 text-[#f9a826] animate-spin" />
      </div>
    );
  }

  // --- JSX 부분은 이전과 동일하게 유지 ---
  // 아래 return 문부터 시작하는 JSX 코드를 여기에 붙여넣으세요.
  // ... (이전 답변의 return 문부터 끝까지의 JSX 코드) ...
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-[#e8eaed] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#2a3748] px-6 py-6 shadow-lg sticky top-0 z-20">
        <div className="text-center mb-4">
          <h1
            className="text-white mb-1"
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: '2.5rem',
              letterSpacing: '-0.02em'
            }}
          >
            {formatTime(currentTime)}
          </h1>
          <p
            className="text-white/70"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem'
            }}
          >
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-white/80 text-sm"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Day Progress
            </span>
            <span
              className="text-[#f9a826]"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: '0.9rem'
              }}
            >
              {Math.round(dayProgress)}%
            </span>
          </div>
          <Progress
            value={dayProgress}
            className="h-2 bg-white/20 progress-bar-custom" // 클래스 추가
            style={{
              ['--progress-background' as any]: 'linear-gradient(90deg, #f9a826 0%, #10b981 100%)'
            }}
          />
        </div>

        <div className="text-center">
          <p
            className="text-white/90"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem'
            }}
          >
            Today's Mission: <span className="text-[#f9a826]" style={{ fontWeight: 'var(--font-weight-semibold)' }}>Live Like {roleModel.name.split(' ')[0]}</span>
          </p>
        </div>

        {/* Cancel Schedule Button */}
        {tasks.length > 0 && (
          <div className="mt-4">
            <Button
              onClick={handleCancelSchedule}
              className="w-full !bg-red-500 border-2 !border-red-400 text-white hover:!bg-red-600 hover:!border-red-500 transition-all duration-300 shadow-lg py-3"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: '0.95rem',
                backgroundColor: '#ef4444',
                borderColor: '#f87171'
              }}
              disabled={apiLoading}
            >
              <XCircle className="w-5 h-5 mr-2" />
              Finish this challenge
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
        {apiError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded text-center transition-opacity duration-300" style={{ fontFamily: 'var(--font-body)' }}>
            ⚠️ {apiError}
          </div>
        )}

        {currentTask && (
          <div className="mb-6">
            <h2
              className="text-[#1a2332] mb-3"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: '1.25rem'
              }}
            >
              Current Task
            </h2>

            <Card
              className="relative p-6 bg-white border-0 overflow-hidden"
              style={{
                boxShadow: `0 8px 32px ${currentTask.color || '#cccccc'}30, 0 0 0 3px ${currentTask.color || '#cccccc'}40`
              }}
            >
              <div
                className="absolute inset-0 rounded-lg animate-pulse-glow pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${currentTask.color || '#cccccc'}10 0%, transparent 100%)`
                }}
              />

              {taskInProgress && (
                <div className="absolute top-4 right-4">
                  <div className="relative w-12 h-12">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="20"
                        stroke={`${currentTask.color || '#cccccc'}20`}
                        strokeWidth="4"
                        fill="transparent"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="20"
                        stroke={currentTask.color || '#6b7280'}
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 20}
                        strokeDashoffset={2 * Math.PI * 20 * (1 - getTaskProgress() / 100)}
                        style={{ transition: 'stroke-dashoffset 0.5s linear' }} // 부드러운 전환
                      />
                    </svg>
                    <Clock
                      className="w-5 h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      style={{ color: currentTask.color || '#6b7280' }}
                    />
                  </div>
                </div>
              )}

              <div className="relative z-10">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${currentTask.color || '#cccccc'}20` }}
                  >
                    <div className="scale-150" style={{ color: currentTask.color || '#1a2332' }}>
                      {currentTask.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-[#1a2332] mb-2 truncate"
                      style={{
                        fontFamily: 'var(--font-headline)',
                        fontWeight: 'var(--font-weight-bold)',
                        fontSize: '1.5rem',
                        lineHeight: '1.3'
                      }}
                    >
                      {currentTask.activity_name}
                    </h3>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge
                        className="text-white border-0 whitespace-nowrap"
                        style={{
                          background: currentTask.color || '#6b7280',
                          fontFamily: 'var(--font-body)'
                        }}
                      >
                        {currentTask.timeRangeString}
                      </Badge>
                      {currentTask.duration && currentTask.duration > 0 && (
                        <Badge
                          variant="outline"
                          className="border-gray-300 whitespace-nowrap"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {currentTask.duration} min
                        </Badge>
                      )}
                    </div>
                    {taskInProgress && (
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-4 h-4 text-[#6b7280]" />
                        <span
                          className="text-[#6b7280]"
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '1rem',
                            fontWeight: 'var(--font-weight-semibold)'
                          }}
                        >
                          {getTimeElapsed()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {!taskInProgress ? (
                  <Button
                    onClick={handleStartTask}
                    className="w-full py-7 rounded-xl shadow-lg text-white"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 'var(--font-weight-semibold)',
                      fontSize: '1.1rem'
                    }}
                    disabled={apiLoading}
                  >
                    {apiLoading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-5 h-5 mr-2" fill="currentColor" />
                    )}
                    {apiLoading ? 'Starting...' : 'Start Task'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleCompleteTask}
                    className="w-full py-7 rounded-xl shadow-lg text-white animate-pulse-slow"
                    style={{
                      background: 'linear-gradient(135deg, #f9a826 0%, #f7931e 100%)',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 'var(--font-weight-semibold)',
                      fontSize: '1.1rem'
                    }}
                    disabled={apiLoading}
                  >
                    {apiLoading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Zap className="w-5 h-5 mr-2 animate-pulse" fill="currentColor" />
                    )}
                    {apiLoading ? 'Completing...' : 'Task in Progress - Tap to Complete'}
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}

        {upcomingTasks.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-[#1a2332] mb-3"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: '1.25rem'
              }}
            >
              Upcoming Tasks
            </h2>
            <div className="space-y-3">
              {upcomingTasks.slice(0, 5).map((task, index) => (
                <Card
                  key={task.id}
                  className="p-4 bg-white/60 border border-gray-200 shadow-sm opacity-70"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                      style={{ background: '#9ca3af' }}
                    >
                      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-weight-semibold)' }}>
                        {completedTasks.length + missedTasks.length + index + 1}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div style={{ color: task.color || '#6b7280' }}>{task.icon}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className="text-[#1a2332] mb-1 truncate"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontWeight: 'var(--font-weight-semibold)',
                          fontSize: '0.95rem'
                        }}
                      >
                        {task.activity_name}
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[#6b7280] text-sm whitespace-nowrap"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {formatTimeString(task.start_time)}
                        </span>
                        {task.duration && task.duration > 0 && (
                            <>
                              <span className="text-[#6b7280] text-xs">•</span>
                              <span
                                className="text-[#6b7280] text-sm whitespace-nowrap"
                                style={{ fontFamily: 'var(--font-body)' }}
                              >
                                {task.duration} min
                              </span>
                            </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
               {upcomingTasks.length > 5 && (
                 <p
                   className="text-center text-sm text-gray-500 mt-3"
                   style={{ fontFamily: 'var(--font-body)' }}
                 >
                   + {upcomingTasks.length - 5} more tasks
                 </p>
               )}
            </div>
          </div>
        )}

        {missedTasks.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-[#ef4444] mb-3 flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: '1.25rem'
              }}
            >
              ⚠️ Missed Tasks ({missedTasks.length})
            </h2>
            <div className="space-y-3">
              {missedTasks.map((task) => (
                <Card
                  key={task.id}
                  className="p-4 bg-red-50 border-2 border-red-200 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-100">
                      <div style={{ color: '#ef4444' }}>{task.icon}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className="text-[#1a2332] mb-1 truncate"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontWeight: 'var(--font-weight-semibold)',
                          fontSize: '0.95rem'
                        }}
                      >
                        {task.activity_name}
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          className="bg-red-500 text-white border-0 text-xs"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          Missed
                        </Badge>
                        <span
                          className="text-[#6b7280] text-sm whitespace-nowrap"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {formatTimeString(task.start_time)}
                        </span>
                        {task.duration && task.duration > 0 && (
                            <>
                              <span className="text-[#6b7280] text-xs">•</span>
                              <span
                                className="text-[#6b7280] text-sm whitespace-nowrap"
                                style={{ fontFamily: 'var(--font-body)' }}
                              >
                                {task.duration} min
                              </span>
                            </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
           <div>
              <button
                onClick={() => setShowCompletedSection(!showCompletedSection)}
                className="flex items-center justify-between w-full mb-3 p-2 rounded hover:bg-gray-200/50"
              >
                 <h2
                   className="text-[#1a2332]"
                   style={{
                     fontFamily: 'var(--font-headline)',
                     fontWeight: 'var(--font-weight-semibold)',
                     fontSize: '1.25rem'
                   }}
                 >
                   Completed Tasks ({completedTasks.length})
                 </h2>
                 {showCompletedSection ? (
                   <ChevronUp className="w-5 h-5 text-[#6b7280]" />
                 ) : (
                   <ChevronDown className="w-5 h-5 text-[#6b7280]" />
                 )}
              </button>
              {showCompletedSection && (
                 <div className="space-y-2 animate-fade-in">
                   {completedTasks.slice().reverse().map((task) => (
                     <Card
                       key={task.id}
                       className="p-3 bg-[#10b981]/10 border border-[#10b981]/30 opacity-80"
                     >
                       <div className="flex items-center gap-3">
                         <CheckCircle2 className="w-5 h-5 text-[#10b981] flex-shrink-0" fill="#10b981" />
                         <div className="flex-1 min-w-0">
                           <h4
                             className="text-[#1a2332] line-through opacity-60 truncate"
                             style={{
                               fontFamily: 'var(--font-body)',
                               fontWeight: 'var(--font-weight-medium)',
                               fontSize: '0.9rem'
                             }}
                           >
                             {task.activity_name}
                           </h4>
                         </div>
                         <span
                           className="text-[#10b981] text-sm whitespace-nowrap"
                           style={{ fontFamily: 'var(--font-body)' }}
                         >
                           ✓ Done
                         </span>
                       </div>
                     </Card>
                   ))}
                 </div>
              )}
           </div>
        )}

        {!initialLoading && tasks.length > 0 && completedTasks.length === tasks.length && (
          <Card className="p-6 bg-gradient-to-r from-[#10b981] to-[#059669] border-0 shadow-lg mt-6 animate-fade-in">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3
                className="text-white mb-2"
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontSize: '1.5rem'
                }}
              >
                Amazing Work!
              </h3>
              <p
                className="text-white/90"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem'
                }}
              >
                You've completed all tasks for today. You're living like {roleModel.name}!
              </p>
            </div>
          </Card>
        )}

        {!initialLoading && tasks.length === 0 && !apiError && (
            <div className="text-center py-12">
                <p
                  className="text-[#6b7280] mb-4"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  No tasks found for your active schedule.
                  <br/>
                  Go to the 'Home' tab to select a role model and start a schedule!
                </p>
                <Button
                  onClick={() => onNavigateToHome && onNavigateToHome()}
                  className="bg-gradient-to-r from-[#f9a826] to-[#f7931e] text-white"
                >
                  Go to Home
                </Button>
            </div>
        )}
      </div>

      {/* Modals */}
      <Dialog open={showStartModal} onOpenChange={setShowStartModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-headline)' }}>
              Start Task?
            </DialogTitle>
            <DialogDescription style={{ fontFamily: 'var(--font-body)' }}>
              Begin "{currentTask?.activity_name}" now?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowStartModal(false)}
              className="w-full sm:w-auto"
              disabled={apiLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStartTask}
              className="w-full sm:w-auto bg-gradient-to-r from-[#10b981] to-[#059669] text-white"
              disabled={apiLoading}
            >
              {apiLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Start!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-headline)' }}>
              Complete Task?
            </DialogTitle>
            <DialogDescription style={{ fontFamily: 'var(--font-body)' }}>
              Time spent on "{currentTask?.activity_name}": {getTimeElapsed()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCompleteModal(false)}
              className="w-full sm:w-auto"
              disabled={apiLoading}
            >
              Not Yet
            </Button>
            <Button
              onClick={confirmCompleteTask}
              className="w-full sm:w-auto bg-gradient-to-r from-[#10b981] to-[#059669] text-white"
              disabled={apiLoading}
            >
               {apiLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Schedule Modal */}
      <Dialog open={showCancelScheduleModal} onOpenChange={setShowCancelScheduleModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2" style={{ fontFamily: 'var(--font-headline)' }}>
              <XCircle className="w-6 h-6" />
              Finish This Challenge?
            </DialogTitle>
            <DialogDescription style={{ fontFamily: 'var(--font-body)' }}>
              This will end your challenge for "{roleModel.name}". All your progress will be saved, but you'll need to start a new challenge to continue.
              <br /><br />
              <strong>This action cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelScheduleModal(false)}
              className="w-full sm:w-auto border-2 border-gray-300 bg-white hover:bg-gray-100"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--font-weight-medium)'
              }}
              disabled={apiLoading}
            >
              Keep Going
            </Button>
            <Button
              onClick={confirmCancelSchedule}
              className="w-full sm:w-auto !bg-red-500 hover:!bg-red-600 text-white border-0 shadow-lg"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--font-weight-semibold)',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white'
              }}
              disabled={apiLoading}
            >
               {apiLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               Yes, Finish Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Styles */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-pulse-glow { animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
        .animate-pulse-slow { animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        /* Progress bar custom color */
        .progress-bar-custom > div {
           background: var(--progress-background, linear-gradient(90deg, #f9a826 0%, #10b981 100%));
        }
      `}</style>
    </div>
  );
}