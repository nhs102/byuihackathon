import { useState, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Input } from './ui/input';
import { RoleModelCard, RoleModel } from './role-model-card';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';

interface RoleModelSelectionProps {
  onSelectRoleModel: (roleModel: RoleModel) => void;
  selectedRoleModel?: RoleModel | null;
  isRoleModelInProgress?: boolean;
}

export function RoleModelSelection({ onSelectRoleModel, selectedRoleModel, isRoleModelInProgress }: RoleModelSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleModels, setRoleModels] = useState<RoleModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 임시 로컬 데이터 (백엔드 서버가 실행되지 않을 때 사용)
  const localRoleModels: RoleModel[] = [
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

  // 검색어가 변경될 때마다 로컬 필터링
  useEffect(() => {
    const filterRoleModels = () => {
      setLoading(true);
      
      // 디바운싱: 300ms 후에 검색 실행
      setTimeout(() => {
        try {
          const filtered = searchQuery.trim() 
            ? localRoleModels.filter(model => 
                model.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : localRoleModels;
          
          setRoleModels(filtered);
          setError(null);
        } catch (err) {
          setError('검색 중 오류가 발생했습니다.');
          console.error('롤모델 검색 오류:', err);
        } finally {
          setLoading(false);
        }
      }, 300);
    };

    filterRoleModels();
  }, [searchQuery]);

  const handleDisabledClick = () => {
    toast.error("Another challenge is in progress", {
      description: "Please finish your current challenge in the Schedule tab before starting a new one.",
      duration: 4000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-[#e8eaed]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-[#1a2332] to-[#2a3748] shadow-lg">
        <div className="px-6 py-6">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#f9a826] to-[#f7931e] rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h1 
                className="text-white"
                style={{ 
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 'var(--font-weight-extrabold)',
                  fontSize: '1.75rem',
                  letterSpacing: '-0.02em'
                }}
              >
                IMPRINT
              </h1>
            </div>
            <p 
              className="text-[#f9a826] text-sm"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Imprint Success DNA
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
            <Input
              type="text"
              placeholder="Search your role model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 bg-white border-0 rounded-2xl shadow-md focus-visible:ring-2 focus-visible:ring-[#f9a826] text-[#1a2332] placeholder:text-[#6b7280]"
              style={{ fontFamily: 'var(--font-body)' }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-260px)]">
        <div className="px-6 py-8">
          {/* Section Title */}
          <div className="mb-6">
            <h2 
              className="text-[#1a2332] mb-1"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: '1.5rem'
              }}
            >
              Choose Your Role Model
            </h2>
            <p 
              className="text-[#6b7280]"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem'
              }}
            >
              Select someone whose success DNA you want to imprint
            </p>
          </div>

          {/* Card Gallery */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f9a826] mx-auto mb-4"></div>
              <p 
                className="text-[#6b7280]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Searching...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p 
                className="text-red-500"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {error}
              </p>
            </div>
          ) : roleModels.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 pb-8">
              {roleModels.map((roleModel, index) => {
                const isCurrentRoleModel = selectedRoleModel?.id === roleModel.id;
                const isOtherRoleModelDisabled = isRoleModelInProgress && !isCurrentRoleModel;
                
                return (
                  <div
                    key={roleModel.id}
                    className="flex justify-center"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <RoleModelCard
                      roleModel={{
                        ...roleModel,
                        isInProgress: isRoleModelInProgress && isCurrentRoleModel
                      }}
                      onClick={onSelectRoleModel}
                      isDisabled={isOtherRoleModelDisabled}
                      onDisabledClick={handleDisabledClick}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p 
                className="text-[#6b7280]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                검색 결과가 없습니다. 다른 검색어를 시도해보세요.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
