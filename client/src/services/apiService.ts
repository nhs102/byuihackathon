const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api';
import { supabase } from './supabaseClient';

// Interface for request options (can include a token)
interface RequestOptions extends RequestInit {
  token?: string;
}

// Base structure for API responses (similar to backend's ApiResponse)
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

/**
 * Base fetch wrapper function with error handling.
 * @template T - The expected type of the response data.
 * @param {string} endpoint - The API endpoint path (e.g., '/users/profile').
 * @param {RequestOptions} options - Fetch options (method, body, headers, etc.).
 * @returns {Promise<T>} - The API response data (throws an error on failure).
 */
const fetchAPI = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { token, ...fetchOptions } = options;

  // Set default headers (JSON)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>), // Merge existing headers
  };

  // Add Authorization header if token is provided OR get from Supabase session
  let authToken = token;
  if (!authToken) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        authToken = session.access_token;
      }
    } catch (err) {
      console.warn('Failed to get Supabase session:', err);
    }
  }
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    // Execute the API request
    const requestUrl = `${API_URL}${endpoint}`;
    console.log(`Attempting fetch to: ${requestUrl}`);
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // Handle errors if the response status code is not 2xx
    if (!response.ok) {
      // Try to parse the response body as JSON, otherwise use a default error message
      const errorData = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText || 'An error occurred'}`,
        error: response.statusText || 'Unknown Error' // Consider backend ApiResponse format
      }));
      // Throw an error matching the backend ApiResponse format
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Return the JSON response on success
    return response.json();

  } catch (error) {
    // Handle network errors, JSON parsing errors, etc.
    console.error(`API Fetch Error (${options.method || 'GET'} ${endpoint}):`, error);
    // Re-throw the actual error object for the caller to handle
    throw error;
  }
};

/**
 * GET request function.
 * @template T - The expected type of the response data.
 * @param {string} endpoint - The API endpoint path.
 * @param {string} [token] - Optional authentication token.
 * @returns {Promise<T>} - The API response data.
 */
export const get = <T>(endpoint: string, token?: string): Promise<T> => {
  // Assumes fetchAPI returns the full ApiResponse<T> structure from the backend
  return fetchAPI<T>(endpoint, { method: 'GET', token });
};

/**
 * POST request function.
 * @template T - The expected type of the response data.
 * @param {string} endpoint - The API endpoint path.
 * @param {unknown} [data] - Optional request body data.
 * @param {string} [token] - Optional authentication token.
 * @returns {Promise<T>} - The API response data.
 */
export const post = <T>(endpoint: string, data?: unknown, token?: string): Promise<T> => {
  return fetchAPI<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined, // Include body only if data exists
    token,
  });
};

/**
 * PUT request function.
 * @template T - The expected type of the response data.
 * @param {string} endpoint - The API endpoint path.
 * @param {unknown} [data] - Optional request body data.
 * @param {string} [token] - Optional authentication token.
 * @returns {Promise<T>} - The API response data.
 */
export const put = <T>(endpoint: string, data?: unknown, token?: string): Promise<T> => {
  return fetchAPI<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    token,
  });
};

/**
 * DELETE request function.
 * @template T - The expected type of the response data.
 * @param {string} endpoint - The API endpoint path.
 * @param {string} [token] - Optional authentication token.
 * @returns {Promise<T>} - The API response data.
 */
export const del = <T>(endpoint: string, token?: string): Promise<T> => {
  return fetchAPI<T>(endpoint, { method: 'DELETE', token });
};

// --- Module-specific API function definitions ---

// Home screen related APIs (sangmin)
export const homeAPI = {
  getHomeData: () => get<ApiResponse</* Specify HomeData type */ any>>('/sangmin/home'), // Recommended to specify concrete types
  getPopularTemplates: () => get<ApiResponse</* Specify Template[] type */ any[]>>('/sangmin/popular-templates'),
  getRecentProjects: () => get<ApiResponse</* Specify Project[] type */ any[]>>('/sangmin/recent-projects'),
  getUserStats: () => get<ApiResponse</* Specify UserStats type */ any>>('/sangmin/user-stats'),
};

// Role model related APIs (sangmin)
export const roleModelAPI = {
  searchRoleModels: (searchQuery: string) =>
    get<ApiResponse</* Specify RoleModel[] type */ any[]>>(`/sangmin/role-models?search=${encodeURIComponent(searchQuery)}`),
  getAllRoleModels: () => get<ApiResponse</* Specify RoleModel[] type */ any[]>>('/sangmin/role-models'),
};

// Task related APIs (hyun) - Added
export const taskAPI = {
  // Fetch all tasks for the user's active schedule
  getActiveUserTasks: (userId: string | number) => get<ApiResponse</* Specify Task[] type */ any[]>>(`/hyun/users/${userId}/active-tasks`), // Task type definition needed

  // Start a task
  startTask: (taskId: string | number) => post<ApiResponse<{ task: { id: number; activity_name: string; started_at: string } }>>(`/hyun/tasks/${taskId}/start`),

  // Complete a task
  completeTask: (taskId: string | number) => post<ApiResponse<{ completedDuration: number; newTotalScore: number }>>(`/hyun/tasks/${taskId}/complete`),

  // Cancel active schedule (Complete challenge)
  cancelSchedule: (userId: string | number) => post<ApiResponse<{ message: string; cancelledScheduleId: number; finalScore: number }>>(`/hyun/users/${userId}/cancel-schedule`),
};

// Ranking related APIs (hyun) - Added
export const rankingAPI = {
  // Fetch rankings (optionally filtered by roleModelId)
  getRankings: (roleModelId?: string | number) => {
    const endpoint = roleModelId ? `/hyun/rankings?roleModelId=${roleModelId}` : '/hyun/rankings';
    // LeaderboardUser type definition needed
    return get<ApiResponse</* Specify LeaderboardUser[] type */ any[]>>(endpoint);
  },
};

// --- Default export object ---
export default {
  get,
  post,
  put,
  delete: del,
  homeAPI,
  roleModelAPI,
  taskAPI,     // Added taskAPI
  rankingAPI,  // Added rankingAPI
};