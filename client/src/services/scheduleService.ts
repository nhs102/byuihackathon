// client/src/services/scheduleService.ts
import { post, get } from './apiService';

// ===== Types =====
export interface TimeSlot {
  id: string;
  time: string;
  activity: string;
  category: 'work' | 'personal' | 'health' | 'family' | 'sleep';
  color?: string;
}

// ===== Customize Schedule =====
export interface CustomizeScheduleRequest {
  userId: string;
  roleModelId: string;
  currentSchedule: TimeSlot[];
  userQuery: string;
}

export interface CustomizeScheduleResponse {
  success: boolean;
  data?: {
    message: string;
    modifiedSchedule: TimeSlot[];
    originalSchedule: TimeSlot[];
  };
  message?: string;
  error?: string;
}

// ===== Confirm Schedule =====
export interface ConfirmScheduleRequest {
  userId: string;
  roleModelId: string;
  roleModelName: string;
  schedule: TimeSlot[];
}

export interface ConfirmScheduleResponse {
  success: boolean;
  data?: {
    scheduleId: string;
    challengeId: string;
    message: string;
  };
  message?: string;
  error?: string;
}

// ===== Get Active Schedule =====
export interface ActiveScheduleResponse {
  success: boolean;
  data?: {
    challengeId: string;
    roleModelId: string;
    schedule: TimeSlot[];
    score: number;
    startedAt: string;
  } | null;
  message?: string;
  error?: string;
}

// ===== Stop Challenge =====
export interface StopChallengeRequest {
  userId: string;
}

export interface StopChallengeResponse {
  success: boolean;
  data?: {
    challengeId: string;
    finalScore: number;
  };
  message?: string;
  error?: string;
}

// ===== API Functions =====

/**
 * AI를 통해 스케줄 커스터마이징
 * POST /api/gisuck/customize-schedule
 */
export const customizeSchedule = async (
  request: CustomizeScheduleRequest,
  token?: string
): Promise<CustomizeScheduleResponse> => {
  return post<CustomizeScheduleResponse>('/gisuck/customize-schedule', request, token);
};

/**
 * 커스터마이징된 스케줄 확정 및 저장
 * POST /api/gisuck/confirm-schedule
 */
export const confirmSchedule = async (
  request: ConfirmScheduleRequest,
  token?: string
): Promise<ConfirmScheduleResponse> => {
  return post<ConfirmScheduleResponse>('/gisuck/confirm-schedule', request, token);
};

/**
 * 사용자의 활성 스케줄 조회
 * GET /api/gisuck/active-schedule/:userId
 */
export const getActiveSchedule = async (
  userId: string,
  token?: string
): Promise<ActiveScheduleResponse> => {
  return get<ActiveScheduleResponse>(`/gisuck/active-schedule/${userId}`, token);
};

/**
 * 활성 챌린지 중지
 * POST /api/gisuck/stop-challenge
 */
export const stopChallenge = async (
  request: StopChallengeRequest,
  token?: string
): Promise<StopChallengeResponse> => {
  return post<StopChallengeResponse>('/gisuck/stop-challenge', request, token);
};

/**
 * API 테스트
 * GET /api/gisuck/test
 */
export const testAPI = async (): Promise<any> => {
  return get('/gisuck/test');
};

export default {
  customizeSchedule,
  confirmSchedule,
  getActiveSchedule,
  stopChallenge,
  testAPI,
};