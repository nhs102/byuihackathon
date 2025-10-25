// PLACEHOLDER - hyun 담당 서비스 (사용자 관련 API)
// 이 파일은 hyun이 실제 코드로 교체할 예정

export const userService = {
  // 사용자 관련 API 함수들이 hyun에 의해 구현될 예정
  getUserTasks: async (userId: string) => {
    console.log('Placeholder userService.getUserTasks called with:', userId);
    return { success: true, data: [], message: 'Placeholder by Hyun' };
  },

  startTask: async (taskId: string) => {
    console.log('Placeholder userService.startTask called with:', taskId);
    return { success: true, message: 'Placeholder by Hyun' };
  },

  completeTask: async (taskId: string) => {
    console.log('Placeholder userService.completeTask called with:', taskId);
    return { success: true, message: 'Placeholder by Hyun' };
  },

  getRankings: async (roleModelId?: string) => {
    console.log('Placeholder userService.getRankings called with:', roleModelId);
    return { success: true, data: [], message: 'Placeholder by Hyun' };
  },

  cancelSchedule: async (userId: string) => {
    console.log('Placeholder userService.cancelSchedule called with:', userId);
    return { success: true, message: 'Placeholder by Hyun' };
  }
};