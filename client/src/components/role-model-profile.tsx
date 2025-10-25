// PLACEHOLDER - gisuck 담당 컴포넌트 (롤모델 프로필)
// 이 파일은 gisuck이 실제 코드로 교체할 예정

interface RoleModelProfileProps {
  profileData: any;
  onBack: () => void;
  onContinue: () => void;
}

export function RoleModelProfile(props: RoleModelProfileProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Role Model Profile Placeholder</h1>
        <p className="text-gray-600">This component will be implemented by Gisuck</p>
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>Profile: {props.profileData?.roleModel?.name || 'None'}</p>
        </div>
        <div className="mt-4 space-x-4">
          <button 
            onClick={props.onBack}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Back
          </button>
          <button 
            onClick={props.onContinue}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}