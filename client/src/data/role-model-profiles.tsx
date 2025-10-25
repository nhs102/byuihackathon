// PLACEHOLDER - sangmin 담당 데이터 (롤모델 프로필)
// 이 파일은 sangmin이 실제 코드로 교체할 예정

export const getRoleModelProfile = (roleModel: any) => {
  console.log('Placeholder getRoleModelProfile called with:', roleModel?.name);
  
  return {
    roleModel: roleModel,
    schedule: [
      {
        id: 'placeholder-1',
        time: '6:00 AM',
        activity: 'Placeholder Morning Routine',
        category: 'personal',
        color: '#6b7280'
      },
      {
        id: 'placeholder-2', 
        time: '7:00 AM',
        activity: 'Placeholder Breakfast',
        category: 'family',
        color: '#f59e0b'
      }
    ],
    philosophy: 'This is a placeholder philosophy that will be implemented by Sangmin.',
    keyPrinciples: [
      'Placeholder Principle 1',
      'Placeholder Principle 2',
      'Placeholder Principle 3'
    ],
    dailyHabits: [
      'Placeholder Habit 1',
      'Placeholder Habit 2', 
      'Placeholder Habit 3'
    ],
    achievements: [
      'Placeholder Achievement 1',
      'Placeholder Achievement 2'
    ]
  };
};