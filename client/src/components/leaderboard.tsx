import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Flame, Zap, Target, TrendingUp, Award, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'; // Tabs 관련 컴포넌트는 필터링에 사용되지 않으면 제거 가능
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { RoleModel } from './role-model-card';
import { rankingAPI } from '../services/apiService'; // API 서비스 import
import { useUser } from '../contexts/UserContext'; // UserContext import

// API 응답 기반 인터페이스 수정
interface LeaderboardUser {
  rank: number;
  score: number;
  userId: number; // 사용자 ID 추가
  userName: string;
  roleModelName: string;
  durationDays?: number; // 기간 추가 (옵셔널)
  avatar?: string; // 아바타는 여전히 프론트에서 임시 처리하거나 추후 추가 필요
  badges?: string[]; // 뱃지 로직은 별도 구현 필요
  streak?: number; // 연속 기록 로직은 별도 구현 필요
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  roleModel: RoleModel;
  availableRoleModels: RoleModel[];
  onChangeRoleModel: (roleModel: RoleModel) => void;
}

export function Leaderboard({ roleModel, availableRoleModels, onChangeRoleModel }: LeaderboardProps) {
  const { user: currentUserContext } = useUser(); // UserContext 사용
  const [selectedRoleModelId, setSelectedRoleModelId] = useState<string | number>(roleModel.id);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      setError(null);
      try {
        // API 응답 타입 사용 (apiService.ts에서 명시됨)
        // roleModelId를 숫자로 변환하여 전달 (API가 숫자를 예상하는 경우)
        const roleModelIdParam = typeof selectedRoleModelId === 'string' ? parseInt(selectedRoleModelId, 10) : selectedRoleModelId;
        const response = await rankingAPI.getRankings(roleModelIdParam);

        if (response.success && Array.isArray(response.data)) {
          const formattedData: LeaderboardUser[] = response.data.map((item: any) => {
            // 사용자 ID 비교 (string과 number 모두 처리)
            const currentUserId = currentUserContext?.id;
            const itemUserId = item.userId;
            const isCurrentUser = currentUserId && (
              String(currentUserId) === String(itemUserId) || 
              Number(currentUserId) === Number(itemUserId)
            );
            
            return {
              rank: item.rank,
              score: item.score,
              userId: item.userId,
              userName: item.userName,
              roleModelName: item.roleModelName,
              durationDays: item.durationDays,
              avatar: `https://avatar.vercel.sh/${item.userName.replace(/\s+/g, '')}.png`, // 사용자 이름 기반 아바타 생성 (임시)
              badges: [], // 임시: 뱃지 로직 필요
              streak: 0, // 임시: 연속 기록 로직 필요
              isCurrentUser
            };
          });
          
          console.log('Current User ID:', currentUserContext?.id);
          console.log('Leaderboard Data:', formattedData);
          console.log('Current User Found:', formattedData.find(u => u.isCurrentUser));
          
          setLeaderboardData(formattedData);
        } else {
          setError(response.error || 'Failed to load rankings.');
        }
      } catch (err) {
        setError('An error occurred while fetching rankings.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
     // currentUserContext?.id를 의존성 배열에 추가하여 사용자 변경 시 다시 로드
  }, [selectedRoleModelId, currentUserContext?.id]);

  const sortedUsers = leaderboardData; // 백엔드에서 이미 정렬됨
  // currentUserData를 leaderboardData에서 찾도록 수정
  const currentUserData = leaderboardData.find(u => u.isCurrentUser);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-[#f9a826]" fill="#f9a826" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-[#94a3b8]" />; // 은색 느낌
    if (rank === 3) return <Medal className="w-6 h-6 text-[#cd7f32]" />; // 동색 느낌
    return null;
  };

  const getRankBackground = (rank: number) => {
    if (rank === 1) return 'linear-gradient(135deg, #f9a82615 0%, #f7931e15 100%)';
    if (rank === 2) return 'linear-gradient(135deg, #cbd5e115 0%, #e2e8f015 100%)'; // 은색 느낌 배경
    if (rank === 3) return 'linear-gradient(135deg, #fcd9b615 0%, #d4a17415 100%)'; // 동색 느낌 배경
    return 'transparent';
  };

  const getBadgeInfo = (badge: string) => {
    // 뱃지 로직 구현 필요
    switch (badge) {
      case 'streak':
        return { icon: <Flame className="w-3 h-3" />, color: '#f97316', label: 'Streak' };
      case 'perfect-week':
        return { icon: <Target className="w-3 h-3" />, color: '#10b981', label: 'Perfect Week' };
      case 'champion':
        return { icon: <Trophy className="w-3 h-3" />, color: '#f9a826', label: 'Champion' };
      case 'rising-star':
        return { icon: <TrendingUp className="w-3 h-3" />, color: '#3b82f6', label: 'Rising Star' };
      case 'early-bird':
        return { icon: <Zap className="w-3 h-3" />, color: '#8b5cf6', label: 'Early Bird' };
      default:
        return { icon: <Award className="w-3 h-3" />, color: '#6b7280', label: 'Badge' };
    }
  };

  const getMotivationalMessage = (rank: number | undefined, totalUsers: number) => {
    if (rank === undefined) return "Keep going! You're climbing the ranks!"; // rank가 없을 경우 기본 메시지
    const percentage = ((totalUsers - rank + 1) / totalUsers) * 100;
    if (rank === 1) return "🥇 You're #1! Keep dominating!";
    if (rank <= 3) return `🥈🥉 Amazing! You're in the top 3!`;
    if (rank <= 10) return `🏆 Fantastic! You're in the top 10!`;
    if (percentage >= 80) return `🎉 Great work! You're in the top ${Math.round(100 - percentage + 1)}%!`; // 상위 %로 표시
    return `👍 Keep going! You're climbing the ranks!`;
  };

  const handleRoleModelChange = (roleModelId: string) => {
    setSelectedRoleModelId(roleModelId);
    const selectedRM = availableRoleModels.find(rm => rm.id === roleModelId);
    if (selectedRM) {
      onChangeRoleModel(selectedRM);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-[#e8eaed]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#2a3748] px-6 py-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#f9a826] to-[#f7931e] rounded-2xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1
              className="text-white"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 'var(--font-weight-bold)',
                fontSize: '1.75rem'
              }}
            >
              Global Rankings
            </h1>
            <p
              className="text-white/70 text-sm"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Compete with others worldwide
            </p>
          </div>
        </div>

        {/* Role Model Tabs */}
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {availableRoleModels.map((rm) => (
              <button
                key={rm.id}
                onClick={() => handleRoleModelChange(rm.id)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  String(selectedRoleModelId) === String(rm.id) // 문자열로 비교
                    ? 'bg-[#f9a826] text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: String(selectedRoleModelId) === String(rm.id) ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                  fontSize: '0.9rem'
                }}
              >
                {rm.name}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-240px)]">
        <div className="px-6 py-6 space-y-4">

          {/* Current User Stats Card */}
          {currentUserData && (
             <Card
              className="p-6 bg-gradient-to-br from-[#1a2332] to-[#2a3748] border-0 shadow-xl"
              style={{
                boxShadow: '0 8px 32px rgba(249, 168, 38, 0.3)'
              }}
             >
                 <div className="flex items-center gap-4 mb-4">
                   <Avatar className="w-16 h-16 border-4 border-[#f9a826] shadow-lg">
                     <AvatarImage src={currentUserData.avatar} alt={currentUserData.userName} />
                     <AvatarFallback>{currentUserData.userName ? currentUserData.userName[0].toUpperCase() : 'U'}</AvatarFallback>
                   </Avatar>
                   <div className="flex-1">
                      <h3
                        className="text-white mb-1"
                        style={{
                          fontFamily: 'var(--font-headline)',
                          fontWeight: 'var(--font-weight-semibold)',
                          fontSize: '1.25rem'
                        }}
                      >
                        {currentUserData.userName}
                      </h3>
                      <div className="flex items-center gap-2">
                         <Badge
                           className="bg-[#f9a826] text-white border-0"
                           style={{ fontFamily: 'var(--font-body)' }}
                         >
                           Rank #{currentUserData.rank}
                         </Badge>
                         {/* Streak Badge (streak 데이터가 있다면) */}
                         {currentUserData.streak && currentUserData.streak > 0 && (
                            <Badge className="bg-white/10 text-white border-0" style={{ fontFamily: 'var(--font-body)' }}>
                               <Flame className="w-3 h-3 mr-1 text-[#f97316]" fill="#f97316" />
                               {currentUserData.streak} days
                            </Badge>
                         )}
                      </div>
                   </div>
                   <div className="text-right">
                      <div
                        className="text-[#f9a826] mb-1"
                        style={{
                          fontFamily: 'var(--font-headline)',
                          fontWeight: 'var(--font-weight-bold)',
                          fontSize: '2rem',
                          lineHeight: '1'
                        }}
                      >
                        {currentUserData.score}
                      </div>
                      <span
                        className="text-white/60 text-sm"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        hours
                      </span>
                   </div>
                 </div>
                 {/* Progress to next rank */}
                 <div className="mb-3">
                   <div className="flex items-center justify-between mb-2">
                     <span
                       className="text-white/70 text-sm"
                       style={{ fontFamily: 'var(--font-body)' }}
                     >
                       Progress to Rank #{currentUserData.rank > 1 ? currentUserData.rank - 1 : 1}
                     </span>
                     <span
                       className="text-[#f9a826] text-sm"
                       style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-weight-semibold)' }}
                     >
                       {currentUserData.rank > 1 && sortedUsers[currentUserData.rank - 2]
                         ? `${Math.max(0, sortedUsers[currentUserData.rank - 2].score - currentUserData.score)}h to go` // 음수 방지
                         : 'Top Rank!'}
                     </span>
                   </div>
                   <Progress
                     value={currentUserData.rank > 1 && sortedUsers[currentUserData.rank - 2]?.score > 0 // 0으로 나누기 방지
                       ? Math.min(100, (currentUserData.score / sortedUsers[currentUserData.rank - 2].score) * 100) // 100% 초과 방지
                       : 100}
                     className="h-2 bg-white/20"
                     style={{ ['--progress-background' as any]: '#f9a826' }} // 프로그레스 바 색상 단일화
                   />
                 </div>
                 {/* Badges */}
                 {currentUserData.badges && currentUserData.badges.length > 0 && (
                   <div className="flex flex-wrap gap-2">
                     {currentUserData.badges.map((badge) => {
                       const badgeInfo = getBadgeInfo(badge);
                       return (
                         <div
                           key={badge}
                           className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 border border-white/20"
                         >
                           <div style={{ color: badgeInfo.color }}>{badgeInfo.icon}</div>
                           <span
                             className="text-white text-xs"
                             style={{ fontFamily: 'var(--font-body)' }}
                           >
                             {badgeInfo.label}
                           </span>
                         </div>
                       );
                     })}
                   </div>
                 )}
             </Card>
          )}

          {/* Leaderboard List */}
          <div>
            <h2
              className="text-[#1a2332] mb-3 px-2"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: '1.1rem'
              }}
            >
              Top Performers
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-[#f9a826] animate-spin mx-auto mb-4" />
                <p className="text-[#6b7280]" style={{ fontFamily: 'var(--font-body)' }}>
                  Loading rankings...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500" style={{ fontFamily: 'var(--font-body)' }}>
                  {error}
                </p>
              </div>
            ) : sortedUsers.length > 0 ? (
              <div className="space-y-2">
                {sortedUsers.map((user, index) => {
                  const isTopThree = user.rank <= 3;
                  const isCurrentUser = user.isCurrentUser;
                  return (
                    <Card
                      key={user.userId + '-' + user.rank} // key 수정
                      className={`p-4 transition-all duration-300 hover:shadow-lg ${
                        isCurrentUser ? 'border-2 border-[#f9a826] shadow-md' : 'border-0'
                      } ${isTopThree ? 'shadow-md' : 'shadow-sm'}`}
                      style={{
                        background: isCurrentUser
                          ? 'linear-gradient(135deg, #f9a82610 0%, #f7931e10 100%)'
                          : getRankBackground(user.rank),
                        backgroundColor: !isTopThree && !isCurrentUser && index % 2 === 1 ? '#f8f9fa' : 'white' // 현재 사용자 배경색 유지
                      }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="w-12 text-center">
                          {getRankIcon(user.rank) || (
                            <span
                              className="text-[#6b7280]"
                              style={{
                                fontFamily: 'var(--font-headline)',
                                fontWeight: 'var(--font-weight-bold)',
                                fontSize: isTopThree ? '1.75rem' : '1.25rem'
                              }}
                            >
                              #{user.rank}
                            </span>
                          )}
                        </div>
                        {/* Avatar */}
                         <Avatar
                          className={`${isTopThree ? 'w-14 h-14' : 'w-12 h-12'} ${
                             isCurrentUser ? 'border-2 border-[#f9a826]' : ''
                           } shadow-md`}
                         >
                             <AvatarImage src={user.avatar} alt={user.userName} />
                             <AvatarFallback>{user.userName ? user.userName[0].toUpperCase() : 'U'}</AvatarFallback>
                         </Avatar>
                        {/* User Info */}
                        <div className="flex-1 min-w-0"> {/* 추가: 이름 길 때 줄바꿈 방지 */}
                          <div className="flex items-center gap-2 mb-1 flex-wrap"> {/* 추가: wrap */}
                            <h4
                              className={`truncate ${isCurrentUser ? 'text-[#1a2332]' : 'text-[#1a2332]'}`} // truncate 추가
                              style={{
                                fontFamily: 'var(--font-body)',
                                fontWeight: 'var(--font-weight-semibold)',
                                fontSize: isTopThree ? '1.1rem' : '1rem'
                              }}
                            >
                              {user.userName}
                            </h4>
                             {isCurrentUser && (
                                <Badge className="bg-[#f9a826] text-white text-xs px-2 py-0 border-0 flex-shrink-0"> {/* flex-shrink-0 추가 */}
                                   You
                                </Badge>
                             )}
                          </div>
                          {/* Streak와 Badges가 있을 때만 표시 */}
                          {((user.streak && user.streak > 0) || (user.badges && user.badges.length > 0)) && (
                            <div className="flex items-center gap-2 flex-wrap">
                               {/* Streak 표시 */}
                               {user.streak && user.streak > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Flame className="w-3 h-3 text-[#f97316]" fill="#f97316" />
                                    <span className="text-[#6b7280] text-xs whitespace-nowrap" style={{ fontFamily: 'var(--font-body)' }}>
                                      {user.streak} day streak
                                    </span>
                                  </div>
                               )}
                               {/* Badges 표시 */}
                               {user.badges?.slice(0, 2).map((badge) => {
                                   const badgeInfo = getBadgeInfo(badge);
                                   return (
                                     <div key={badge} style={{ color: badgeInfo.color }} title={badgeInfo.label}>
                                       {badgeInfo.icon}
                                     </div>
                                   );
                               })}
                            </div>
                          )}
                        </div>
                        {/* Score */}
                        <div className="text-right flex-shrink-0 pl-2"> {/* flex-shrink-0, pl-2 추가 */}
                          <div
                            className={isTopThree ? 'text-[#1a2332]' : 'text-[#1a2332]'}
                            style={{
                              fontFamily: 'var(--font-headline)',
                              fontWeight: 'var(--font-weight-bold)',
                              fontSize: isTopThree ? '1.5rem' : '1.25rem'
                            }}
                          >
                            {user.score}
                          </div>
                          <span
                            className="text-[#6b7280] text-xs"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            hours
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                 <p className="text-[#6b7280]" style={{ fontFamily: 'var(--font-body)' }}>
                   No ranking data available for this role model yet.
                 </p>
              </div>
            )}
          </div>

          {/* Motivational Message */}
          {currentUserData && (
            <Card className="p-6 bg-gradient-to-r from-[#10b981] to-[#059669] border-0 shadow-lg mt-6">
              <div className="text-center">
                <p
                  className="text-white mb-2"
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: '1.25rem'
                  }}
                >
                  {getMotivationalMessage(currentUserData.rank, sortedUsers.length)}
                </p>
                <p
                  className="text-white/80 text-sm"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Keep following {roleModel.name}'s schedule to climb higher!
                </p>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}