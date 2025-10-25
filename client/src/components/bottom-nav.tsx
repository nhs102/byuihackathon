// PLACEHOLDER - hyun 담당 컴포넌트 (하단 네비게이션)
// 이 파일은 hyun이 실제 코드로 교체할 예정

export type NavTab = 'home' | 'schedule' | 'ranking';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  taskBadgeCount?: number;
  rankingBadgeCount?: number;
}

export function BottomNav(props: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
      <div className="flex justify-around">
        <button 
          onClick={() => props.onTabChange('home')}
          className={`p-2 ${props.activeTab === 'home' ? 'text-blue-500' : 'text-gray-500'}`}
        >
          Home
        </button>
        <button 
          onClick={() => props.onTabChange('schedule')}
          className={`p-2 ${props.activeTab === 'schedule' ? 'text-blue-500' : 'text-gray-500'}`}
        >
          Schedule {props.taskBadgeCount && `(${props.taskBadgeCount})`}
        </button>
        <button 
          onClick={() => props.onTabChange('ranking')}
          className={`p-2 ${props.activeTab === 'ranking' ? 'text-blue-500' : 'text-gray-500'}`}
        >
          Ranking {props.rankingBadgeCount && `(${props.rankingBadgeCount})`}
        </button>
      </div>
      <p className="text-xs text-center text-gray-400 mt-2">Placeholder by Hyun</p>
    </div>
  );
}