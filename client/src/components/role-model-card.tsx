// PLACEHOLDER - sangmin 담당 컴포넌트 (롤모델 카드)
// 이 파일은 sangmin이 실제 코드로 교체할 예정

export interface RoleModel {
  id: string;
  name: string;
  quote: string;
  imageUrl: string;
  accentColor: string;
  isFeatured?: boolean;
  isPopular?: boolean;
}

interface RoleModelCardProps {
  roleModel: RoleModel;
  onClick: () => void;
  isSelected?: boolean;
  disabled?: boolean;
}

export function RoleModelCard(props: RoleModelCardProps) {
  return (
    <div 
      onClick={props.disabled ? undefined : props.onClick}
      className={`p-4 border rounded-lg cursor-pointer ${
        props.isSelected ? 'border-blue-500' : 'border-gray-200'
      } ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}`}
    >
      <div className="text-center">
        <h3 className="font-bold">{props.roleModel.name}</h3>
        <p className="text-sm text-gray-600 mt-2">"{props.roleModel.quote}"</p>
        <p className="text-xs text-gray-400 mt-2">Placeholder by Sangmin</p>
      </div>
    </div>
  );
}