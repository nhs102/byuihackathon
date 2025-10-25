// PLACEHOLDER - hyun 담당 컴포넌트 (리더보드)
// 이 파일은 hyun이 실제 코드로 교체할 예정

interface LeaderboardProps {
  roleModel: any;
  availableRoleModels: any[];
  onChangeRoleModel: (roleModel: any) => void;
}

export function Leaderboard(props: LeaderboardProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Leaderboard Placeholder</h1>
        <p className="text-gray-600">This component will be implemented by Hyun</p>
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>Role Model: {props.roleModel?.name || 'None'}</p>
          <p>Available Models: {props.availableRoleModels?.length || 0}</p>
        </div>
      </div>
    </div>
  );
}