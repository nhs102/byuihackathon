import { Home, Calendar, Trophy } from 'lucide-react';
import { Badge } from './ui/badge';

export type NavTab = 'home' | 'schedule' | 'ranking';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  taskBadgeCount?: number;
  rankingBadgeCount?: number;
}

export function BottomNav({ activeTab, onTabChange, taskBadgeCount, rankingBadgeCount }: BottomNavProps) {
  const tabs = [
    {
      id: 'home' as NavTab,
      label: 'Home',
      icon: Home,
      badge: undefined
    },
    {
      id: 'schedule' as NavTab,
      label: 'Schedule',
      icon: Calendar,
      badge: taskBadgeCount
    },
    {
      id: 'ranking' as NavTab,
      label: 'Ranking',
      icon: Trophy,
      badge: rankingBadgeCount
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
      <div className="flex items-center justify-around px-4 py-3 max-w-2xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 flex-1 relative transition-all duration-300 ${
                isActive ? 'transform -translate-y-1' : ''
              }`}
            >
              {/* Icon */}
              <div className="relative">
                <Icon 
                  className={`w-6 h-6 transition-all duration-300 ${
                    isActive 
                      ? 'text-[#f9a826] scale-110' 
                      : 'text-[#6b7280]'
                  }`}
                  fill={isActive ? '#f9a826' : 'none'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {/* Active Indicator Glow */}
                {isActive && (
                  <div 
                    className="absolute inset-0 rounded-full blur-md -z-10 animate-pulse-glow"
                    style={{ background: '#f9a826', opacity: 0.3 }}
                  />
                )}
              </div>

              {/* Label */}
              <span 
                className={`text-xs transition-all duration-300 ${
                  isActive 
                    ? 'text-[#f9a826]' 
                    : 'text-[#6b7280]'
                }`}
                style={{ 
                  fontFamily: 'var(--font-body)',
                  fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)'
                }}
              >
                {tab.label}
              </span>

              {/* Active Indicator Bar */}
              {isActive && (
                <div 
                  className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-[#f9a826] to-transparent rounded-full animate-slide-in"
                />
              )}
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes slide-in {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 3rem;
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
