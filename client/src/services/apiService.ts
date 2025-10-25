// PLACEHOLDER - sangmin 담당 서비스 (범용 API)
// 이 파일은 sangmin이 실제 코드로 교체할 예정

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const apiService = {
  // 범용 API 함수들이 sangmin에 의해 구현될 예정
  get: async (endpoint: string) => {
    console.log(`Placeholder apiService.get called for: ${endpoint}`);
    return { success: true, data: null, message: 'Placeholder by Sangmin' };
  },

  post: async (endpoint: string, data: any) => {
    console.log(`Placeholder apiService.post called for: ${endpoint}`, data);
    return { success: true, message: 'Placeholder by Sangmin' };
  },

  put: async (endpoint: string, data: any) => {
    console.log(`Placeholder apiService.put called for: ${endpoint}`, data);
    return { success: true, message: 'Placeholder by Sangmin' };
  },

  delete: async (endpoint: string) => {
    console.log(`Placeholder apiService.delete called for: ${endpoint}`);
    return { success: true, message: 'Placeholder by Sangmin' };
  }
};