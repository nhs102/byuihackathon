// PLACEHOLDER - sangmin 담당 컴포넌트 (브랜드 쇼케이스)
// 이 파일은 sangmin이 실제 코드로 교체할 예정

interface BrandShowcaseProps {
  onBack: () => void;
}

export function BrandShowcase(props: BrandShowcaseProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Brand Showcase Placeholder</h1>
        <p className="text-gray-600">This component will be implemented by Sangmin</p>
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>Brand Identity Design System</p>
          <p>Color palettes, Typography, Components</p>
        </div>
        <button 
          onClick={props.onBack}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
        >
          Back
        </button>
      </div>
    </div>
  );
}