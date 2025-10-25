// PLACEHOLDER - gisuck 담당 컴포넌트 (롤모델 선택)
// 이 파일은 gisuck이 실제 코드로 교체할 예정

interface RoleModelSelectionProps {
  onSelectRoleModel: (roleModel: any) => void;
  selectedRoleModel: any;
  isRoleModelInProgress: boolean;
}

export function RoleModelSelection(props: RoleModelSelectionProps) {
  const dummyRoleModels = [
    { id: '1', name: 'Elon Musk', quote: 'Placeholder quote' },
    { id: '2', name: 'Russell M. Nelson', quote: 'Placeholder quote' },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Role Model Selection Placeholder</h1>
        <p className="text-gray-600">This component will be implemented by Gisuck</p>
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>Selected: {props.selectedRoleModel?.name || 'None'}</p>
          <p>In Progress: {props.isRoleModelInProgress ? 'Yes' : 'No'}</p>
        </div>
        <div className="mt-4 space-y-2">
          {dummyRoleModels.map(model => (
            <button 
              key={model.id}
              onClick={() => props.onSelectRoleModel(model)}
              className="block w-full p-2 bg-blue-100 rounded hover:bg-blue-200"
            >
              {model.name} (Placeholder)
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}