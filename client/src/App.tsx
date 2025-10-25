import { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/welcome-screen';
import { BrandShowcase } from './components/brand-showcase';
import { RoleModelSelection } from './components/role-model-selection';
import { RoleModelProfile } from './components/role-model-profile';
import { ScheduleCustomization } from './components/schedule-customization';
import { TaskBoard } from './components/task-board';
import { Leaderboard } from './components/leaderboard';
import { BottomNav, NavTab } from './components/bottom-nav';
import { RoleModel } from './components/role-model-card';
import { getRoleModelProfile } from './data/role-model-profiles';
import { useUser } from './contexts/UserContext';
import { toast } from 'sonner';

type Screen = 'welcome' | 'brand' | 'roleModelSelection' | 'roleModelProfile' | 'scheduleCustomization' | 'taskBoard' | 'leaderboard';

export default function App() {
  const { user } = useUser();
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');

  // If user is logged in, redirect to roleModelSelection and set home tab active
  useEffect(() => {
    if (user && currentScreen === 'welcome') {
      setCurrentScreen('roleModelSelection');
      setActiveNavTab('home');
    }
  }, [user, currentScreen]);
  
  // Pre-select a role model for demo purposes
  const [selectedRoleModel, setSelectedRoleModel] = useState<RoleModel | null>({
    id: '1',
    name: 'Elon Musk',
    quote: 'When something is important enough, you do it even if the odds are not in your favor.',
    imageUrl: 'https://images.unsplash.com/photo-1573497620166-aef748c8c792?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwZW50cmVwcmVuZXVyJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYwNjQ3ODA0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    accentColor: '#3b82f6',
    isFeatured: true,
  });
  
  // Track if a role model is currently in progress
  const [isRoleModelInProgress, setIsRoleModelInProgress] = useState(false);
  
  const [customSchedule, setCustomSchedule] = useState<any[]>([]);
  const [activeNavTab, setActiveNavTab] = useState<NavTab>('home');
  
  // Track task progress globally
  const [taskProgress, setTaskProgress] = useState<{
    tasks: any[];
    currentTask: any;
    taskInProgress: boolean;
    taskStartTime: Date | null;
  }>({
    tasks: [],
    currentTask: null,
    taskInProgress: false,
    taskStartTime: null
  });

  const handleSelectRoleModel = (roleModel: RoleModel) => {
    // Check if another role model is already in progress
    if (isRoleModelInProgress && selectedRoleModel && selectedRoleModel.id !== roleModel.id) {
      toast.error("Another role model's plan is already in progress", {
        description: "Please complete your current plan before switching to a different role model.",
        duration: 4000,
      });
      return;
    }
    
    setSelectedRoleModel(roleModel);
    setCurrentScreen('roleModelProfile');
  };

  const handleBackToSelection = () => {
    setCurrentScreen('roleModelSelection');
    // 진행 상태와 선택된 롤모델 모두 유지
    // setSelectedRoleModel(null); // 이 줄을 제거
  };

  // 계획을 완전히 완료하거나 취소할 때 호출되는 함수
  const handleCompletePlan = () => {
    setIsRoleModelInProgress(false);
    setSelectedRoleModel(null);
    setCustomSchedule([]);
    setTaskProgress({
      tasks: [],
      currentTask: null,
      taskInProgress: false,
      taskStartTime: null
    });
  };

  // 작업 진행 상태 업데이트 핸들러
  const handleTaskProgressUpdate = (newTaskProgress: any) => {
    setTaskProgress(newTaskProgress);
  };

  const handleContinueFromProfile = () => {
    setCurrentScreen('scheduleCustomization');
  };

  const handleBackToProfile = () => {
    setCurrentScreen('roleModelProfile');
  };

  const handleConfirmSchedule = (schedule: any) => {
    setCustomSchedule(schedule);
    setIsRoleModelInProgress(true);
    toast.success("Plan started successfully!", {
      description: `You're now following ${selectedRoleModel?.name}'s success DNA.`,
      duration: 3000,
    });
    setCurrentScreen('taskBoard');
  };

  const handleNavigateToSchedule = () => {
    setCurrentScreen('taskBoard');
    setActiveNavTab('schedule');
  };

  const handleNavigateToRanking = () => {
    setCurrentScreen('leaderboard');
    setActiveNavTab('ranking');
  };
  
  const handleNavigateToHome = () => {
    setCurrentScreen('roleModelSelection');
    setActiveNavTab('home');
  };

  const handleLogin = () => {
    setCurrentScreen('roleModelSelection');
    setActiveNavTab('home');
  };

  const handleViewBrandGuide = () => {
    setCurrentScreen('brand');
  };

  const handleNavTabChange = (tab: NavTab) => {
    setActiveNavTab(tab);
    if (tab === 'home') {
      setCurrentScreen('roleModelSelection');
    } else if (tab === 'schedule') {
      // Check if user has selected a role model or has an active schedule
      if (selectedRoleModel || isRoleModelInProgress) {
        setCurrentScreen('taskBoard');
      } else {
        // No role model selected, redirect to home with a message
        toast.info("Select a role model first", {
          description: "Please choose a role model from the Home tab to start a challenge.",
          duration: 3000,
        });
        setActiveNavTab('home');
        setCurrentScreen('roleModelSelection');
      }
    } else if (tab === 'ranking') {
      // Always allow access to leaderboard, set a default role model if none selected
      if (!selectedRoleModel) {
        setSelectedRoleModel(getAllRoleModels()[0]);
      }
      setCurrentScreen('leaderboard');
    }
  };

  const showBottomNav = currentScreen === 'roleModelSelection' || currentScreen === 'taskBoard' || currentScreen === 'leaderboard';

  // Get all available role models for leaderboard
  const getAllRoleModels = (): RoleModel[] => {
    return [
      {
        id: '1',
        name: 'Elon Musk',
        quote: 'When something is important enough, you do it even if the odds are not in your favor.',
        imageUrl: '/images/elon.png',
        accentColor: '#3b82f6',
        isFeatured: true,
      },
      {
        id: '2',
        name: 'Russell M. Nelson',
        quote: 'The joy we feel has little to do with the circumstances of our lives and everything to do with the focus of our lives.',
        imageUrl: '/images/russell.png',
        accentColor: '#8b5cf6',
        isPopular: true,
      },
      {
        id: '3',
        name: 'Michael Jordan',
        quote: 'I\'ve failed over and over again in my life. And that is why I succeed.',
        imageUrl: '/images/image.png',
        accentColor: '#ef4444',
        isFeatured: true,
      },
      {
        id: '4',
        name: 'Donald Trump',
        quote: 'What separates the winners from the losers is how a person reacts to each new twist of fate.',
        imageUrl: '/images/trump.png',
        accentColor: '#f59e0b',
      }
    ];
  };

  if (currentScreen === 'brand') {
    return <BrandShowcase onBack={() => setCurrentScreen('welcome')} />;
  }

  if (currentScreen === 'leaderboard') {
    const roleModelForLeaderboard = selectedRoleModel || getAllRoleModels()[0];
    return (
      <>
        <Leaderboard
          roleModel={roleModelForLeaderboard}
          availableRoleModels={getAllRoleModels()}
          onChangeRoleModel={(rm) => setSelectedRoleModel(rm)}
        />
        {showBottomNav && (
          <BottomNav 
            activeTab={activeNavTab} 
            onTabChange={handleNavTabChange}
            rankingBadgeCount={1}
          />
        )}
      </>
    );
  }

  if (currentScreen === 'taskBoard') {
    // If no role model is selected, show a message and default to first role model
    const roleModelToUse = selectedRoleModel || getAllRoleModels()[0];
    const profileData = getRoleModelProfile(roleModelToUse);
    const scheduleToUse = customSchedule.length > 0 ? customSchedule : profileData.schedule;
    
    return (
      <>
        <TaskBoard
          roleModel={roleModelToUse}
          schedule={scheduleToUse}
          onNavigateToSchedule={handleNavigateToSchedule}
          onNavigateToRanking={handleNavigateToRanking}
          onNavigateToHome={handleNavigateToHome}
          onCompletePlan={handleCompletePlan}
          taskProgress={taskProgress}
          onTaskProgressUpdate={handleTaskProgressUpdate}
        />
        {showBottomNav && (
          <BottomNav 
            activeTab={activeNavTab} 
            onTabChange={handleNavTabChange}
            taskBadgeCount={3}
          />
        )}
      </>
    );
  }

  if (currentScreen === 'scheduleCustomization' && selectedRoleModel) {
    const profileData = getRoleModelProfile(selectedRoleModel);
    return (
      <ScheduleCustomization
        profileData={profileData}
        userId={user?.id || ''}
        onBack={handleBackToProfile}
        onConfirm={handleConfirmSchedule}
      />
    );
  }

  if (currentScreen === 'roleModelProfile' && selectedRoleModel) {
    const profileData = getRoleModelProfile(selectedRoleModel);
    return (
      <RoleModelProfile
        profileData={profileData}
        onBack={handleBackToSelection}
        onContinue={handleContinueFromProfile}
      />
    );
  }

  if (currentScreen === 'roleModelSelection') {
    return (
      <>
        <RoleModelSelection 
          onSelectRoleModel={handleSelectRoleModel}
          selectedRoleModel={selectedRoleModel}
          isRoleModelInProgress={isRoleModelInProgress}
        />
        {showBottomNav && (
          <BottomNav 
            activeTab={activeNavTab} 
            onTabChange={handleNavTabChange}
          />
        )}
      </>
    );
  }

  return (
    <WelcomeScreen 
      onLogin={handleLogin}
      onViewBrandGuide={handleViewBrandGuide}
    />
  );
}
