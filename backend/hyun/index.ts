// backend/hyun/index.ts
// --- English comments provided ---
// --- Uses req.user for authenticated user ID ---
import express, { Request as ExpressRequest, Response, NextFunction,Router} from "express"; // Import ExpressRequest
import { createClient, User as SupabaseUser } from "@supabase/supabase-js"; // Import SupabaseUser type
import dotenv from "dotenv";
// Load environment variables
dotenv.config();
const router: Router = express.Router();
// =========================================================================
//                             Supabase Client Initialization
// =========================================================================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY). Check your .env file.");
}
const supabase = createClient(supabaseUrl, supabaseKey);
// =========================================================================
//                             Utility Functions
// =========================================================================
// --- Type definition for Request object extended with user property ---
// This assumes an authentication middleware adds a 'user' object (SupabaseUser) to the request.
interface RequestWithUser extends ExpressRequest {
  user?: SupabaseUser; // Make user optional in case middleware allows unauthenticated access for some routes
}
// --- End of Request object extension ---
// Define database table interfaces (optional but good practice)
interface UserSchedule {
    id: number;
    user_id: string; // Changed to string to match Supabase Auth UUID
    status: string;
    total_score: number;
}
interface User {
    id: string; // Changed to string to match Supabase Auth UUID
    name: string;
    active_schedule_id?: number | null;
}
interface RoleModel {
    id: number;
    name: string;
}
// Standard API response structure
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
// Helper function to send successful responses
const sendSuccess = <T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
): void => {
    const response: ApiResponse<T> = {
        success: true,
        data,
        message,
    };
    res.status(statusCode).json(response);
};
// Helper function to send error responses
const sendError = (
    res: Response,
    error: string,
    statusCode: number = 400
): void => {
    const response: ApiResponse = {
        success: false,
        error,
    };
    res.status(statusCode).json(response);
};
// Async handler wrapper to catch errors
const asyncHandler = (
    // Use the extended RequestWithUser type here
    fn: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void> | void
) => {
    return (req: RequestWithUser, res: Response, next: NextFunction) => {
        // Ensure req.user exists before proceeding for protected routes
        // (Middleware should handle this, but adding a check here can be safer)
        // Example check (adapt as needed):
        // if (!req.user) {
        //   return sendError(res, "Authentication required", 401);
        // }
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
// =========================================================================
//                             API Endpoints
// =========================================================================
/**
 * [TEST] Basic test endpoint
 * GET /api/hyun/test
 */
router.get("/test", (req: ExpressRequest, res: Response) => {
  sendSuccess(res, { developer: "hyun" }, "API is functional.");
});
/**
 * Get all tasks for the AUTHENTICATED user's active schedule API
 * GET /api/hyun/users/me/active-tasks  <- Changed route to use 'me'
 */
// ✅ CHANGED: Route uses '/users/me/active-tasks' to imply the current authenticated user
// ✅ CHANGED: Uses req.user.id instead of req.params.userId
router.get("/users/me/active-tasks", asyncHandler(async (req: RequestWithUser, res: Response) => {
    // Get authenticated user ID from the request object (populated by middleware)
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'Authentication required.', 401);
    }
    // Convert Supabase UUID (string) to number IF your DB 'users.id' is integer.
    // ⚠️ IMPORTANT: If your 'users.id' column in Supabase DB is ALSO a UUID (string),
    // REMOVE the Number() conversion below. Based on your schema screenshot, it looks like INT8 (number).
    const userIdNumber = parseInt(userId); // Assuming Supabase Auth ID needs mapping or your DB ID is different. If IDs match and are UUIDs, use userId directly.
    // If your `users.id` is TEXT/VARCHAR matching Supabase UUID, use: const userIdString = userId;
    if (isNaN(userIdNumber)){
        // This case should ideally not happen if req.user.id is always a valid format
         return sendError(res, 'Invalid User ID format after conversion.', 400);
    }
    try {
        // 1. Fetch the user's active_schedule_id using the authenticated user ID
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('active_schedule_id')
            // Use the obtained userIdNumber (or userIdString if your DB uses UUIDs)
            .eq('id', userIdNumber) // ⚠️ Adjust 'id' type if necessary
            .single();
        if (userError) {
            console.error('Error fetching user:', userError);
            return sendError(res, 'User not found.', 404);
        }
        if (!userData || userData.active_schedule_id === null || userData.active_schedule_id === undefined) {
            // Send empty array instead of error if user exists but has no active schedule
             console.log(`User ${userIdNumber} has no active schedule set.`);
             return sendSuccess(res, [], 'Active schedule not set for this user.'); // Return empty array
            // return sendError(res, 'Active schedule not set for this user.', 404);
        }
        const activeScheduleId = userData.active_schedule_id;
        // 2. Fetch user_tasks for the active_schedule_id
        const { data: tasks, error: tasksError } = await supabase
            .from('user_tasks')
            .select('*')
            .eq('user_schedule_id', activeScheduleId)
            .order('display_order', { ascending: true });
        if (tasksError) {
            console.error('Error fetching user tasks:', tasksError);
            throw tasksError;
        }
        // 3. Determine task status
        let currentTaskFound = false;
        const processedTasks = (tasks || []).map(task => {
            let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
            if (task.is_completed) {
                status = 'completed';
            } else if (!currentTaskFound) {
                status = 'current';
                currentTaskFound = true;
            }
            return { ...task, status };
        });
        sendSuccess(res, processedTasks, 'Successfully fetched active tasks.');
    } catch (error: any) {
        console.error('Error fetching active tasks:', error.message);
        sendError(res, 'Server error while fetching active tasks.', 500);
    }
}));

/**
 * Development-friendly route: Get all tasks for a specific user's active schedule
 * GET /api/hyun/users/:userId/active-tasks
 *
 * This mirrors the `/users/me/active-tasks` behavior but accepts an explicit
 * userId in the URL. It's useful for local testing when an authentication
 * middleware is not available. It will try to use the provided userId as a
 * number first, then fall back to the raw string if necessary (to support
 * UUID-style user IDs).
 */
router.get("/users/:userId/active-tasks", asyncHandler(async (req: ExpressRequest, res: Response) => {
    const { userId } = req.params;
    if (!userId) {
        return sendError(res, 'User ID is required in the path.', 400);
    }

    // Try to interpret as number; if NaN, use the string directly (UUID case)
    const numericId = Number(userId);
    const userIdQuery: string | number = !isNaN(numericId) ? numericId : userId;

    try {
        // 1. Fetch the user's active_schedule_id using the provided user ID
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('active_schedule_id')
            .eq('id', userIdQuery)
            .single();

        if (userError) {
            console.error('Error fetching user (by param):', userError);
            return sendError(res, 'User not found.', 404);
        }

        if (!userData || userData.active_schedule_id === null || userData.active_schedule_id === undefined) {
            console.log(`User ${userId} has no active schedule set.`);
            return sendSuccess(res, [], 'Active schedule not set for this user.');
        }

        const activeScheduleId = userData.active_schedule_id;

        // 2. Fetch user_tasks for the active_schedule_id
        const { data: tasks, error: tasksError } = await supabase
            .from('user_tasks')
            .select('*')
            .eq('user_schedule_id', activeScheduleId)
            .order('display_order', { ascending: true });

        if (tasksError) {
            console.error('Error fetching user tasks (by param):', tasksError);
            throw tasksError;
        }

        // 3. Determine task status
        let currentTaskFound = false;
        const processedTasks = (tasks || []).map(task => {
            let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
            if (task.is_completed) {
                status = 'completed';
            } else if (!currentTaskFound) {
                status = 'current';
                currentTaskFound = true;
            }
            return { ...task, status };
        });

        sendSuccess(res, processedTasks, 'Successfully fetched active tasks (by userId).');
    } catch (error: any) {
        console.error('Error fetching active tasks (by param):', error.message);
        sendError(res, 'Server error while fetching active tasks.', 500);
    }
}));
/**
 * Start Task API - No authentication required (for development)
 * POST /api/hyun/tasks/:taskId/start
 */
router.post("/tasks/:taskId/start", asyncHandler(async (req: ExpressRequest, res: Response) => {
    const { taskId } = req.params;
    const startedAt = new Date().toISOString();

    if (!taskId || isNaN(Number(taskId))) {
        return sendError(res, 'Invalid task ID.', 400);
    }

    try {
        // 1. Verify task exists and is not already started
        const { data: taskCheck, error: checkError } = await supabase
            .from('user_tasks')
            .select(`
                id,
                started_at,
                user_schedules!inner (status)
            `)
            .eq('id', Number(taskId))
            .eq('user_schedules.status', 'active')
            .single();

        if (checkError || !taskCheck) {
            console.error('Task check failed:', checkError);
            return sendError(res, 'Task not found or challenge is not active.', 404);
        }

        if (taskCheck.started_at) {
            return sendError(res, 'Task has already been started.', 400);
        }

        // 2. Update started_at for the task
        const { data: updatedTask, error: updateError } = await supabase
            .from('user_tasks')
            .update({ started_at: startedAt })
            .eq('id', Number(taskId))
            .select('id, activity_name, started_at')
            .single();

        if (updateError) {
            console.error('Error updating task:', updateError);
            return sendError(res, 'Failed to start task.', 500);
        }

        sendSuccess(res, { task: updatedTask }, 'Task started successfully.');
    } catch (error: any) {
        console.error('Error starting task:', error.message);
        sendError(res, 'Task starting failed due to server error.', 500);
    }
}));
/**
 * Complete Task API & Score Calculation - No authentication required (for development)
 * POST /api/hyun/tasks/:taskId/complete
 */
router.post("/tasks/:taskId/complete", asyncHandler(async (req: ExpressRequest, res: Response) => {
    const { taskId } = req.params;
    const completedAt = new Date();

    if (!taskId || isNaN(Number(taskId))) {
        return sendError(res, 'Invalid task ID.', 400);
    }

    try {
        // 1. Verify task status and fetch necessary data
        const { data: taskData, error: checkError } = await supabase
            .from('user_tasks')
            .select(`
                id,
                started_at,
                completed_at,
                user_schedule_id,
                user_schedules!inner (status, total_score)
            `)
            .eq('id', Number(taskId))
            .eq('user_schedules.status', 'active')
            .single();

        if (checkError || !taskData) {
            console.error('Task check failed:', checkError);
            return sendError(res, 'Task not found or challenge is not active.', 404);
        }

        if (!taskData.started_at) {
            return sendError(res, 'Task has not been started yet.', 400);
        }

        if (taskData.completed_at) {
            return sendError(res, 'Task has already been completed.', 400);
        }

        // 2. Calculate duration
        const startedAtDate = new Date(taskData.started_at);
        const durationMs = completedAt.getTime() - startedAtDate.getTime();
        
        if (durationMs < 0) {
            return sendError(res, 'Invalid time range: start time is later than completion time.', 400);
        }

        const durationHours = durationMs / (1000 * 60 * 60);
        const completedDuration = parseFloat(durationHours.toFixed(1));

        // 3. Calculate score
        const userScheduleId = taskData.user_schedule_id;
        const userSchedulesData = taskData.user_schedules;  
        const scheduleDetail = Array.isArray(userSchedulesData) ? userSchedulesData[0] : userSchedulesData;
        
        // Ensure scheduleDetail is not null before accessing properties
        if (!scheduleDetail) {
             return sendError(res, 'Associated schedule data not found.', 500);
        }

        const currentTotalScore = parseFloat((scheduleDetail.total_score || 0).toString());
        const newTotalScore = parseFloat((currentTotalScore + completedDuration).toFixed(1));

        // 4. Update user_tasks
        const { error: updateTaskError } = await supabase
            .from('user_tasks')
            .update({
                completed_at: completedAt.toISOString(),
                completed_duration: completedDuration,
                is_completed: true
            })
            .eq('id', Number(taskId));

        if (updateTaskError) {
            console.error('Error updating task:', updateTaskError);
            return sendError(res, 'Failed to complete task.', 500);
        }

        // 5. Update user_schedules score
        const { data: finalScoreData, error: finalScoreError } = await supabase
            .from('user_schedules')
            .update({ total_score: newTotalScore })
            .eq('id', userScheduleId)
            .select('total_score')
            .single();

        if (finalScoreError) {
            console.error('Error updating total score:', finalScoreError);
            return sendError(res, 'Failed to update total score.', 500);
        }

        sendSuccess(res, {
            completedDuration,
            newTotalScore: finalScoreData?.total_score,
        }, 'Task completed and score updated successfully.');
    } catch (error: any) {
        console.error('Error completing task:', error.message);
        sendError(res, 'Task completion failed due to server error.', 500);
    }
}));
/**
 * Cancel Active Schedule API - Completes the user's current active schedule and adds to rankings
 * POST /api/hyun/users/:userId/cancel-schedule
 * 
 * This endpoint will:
 * 1. Find the user's active schedule and its details
 * 2. Mark the schedule as 'completed' 
 * 3. Add the result to the rankings table
 * 4. Remove the active_schedule_id from the user
 */
router.post("/users/:userId/cancel-schedule", asyncHandler(async (req: ExpressRequest, res: Response) => {
    const { userId } = req.params;
    
    if (!userId) {
        return sendError(res, 'User ID is required.', 400);
    }

    const numericId = Number(userId);
    const userIdQuery: string | number = !isNaN(numericId) ? numericId : userId;

    try {
        // 1. Find the user's active schedule with full details
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('active_schedule_id')
            .eq('id', userIdQuery)
            .single();

        if (userError) {
            console.error('Error fetching user:', userError);
            return sendError(res, 'User not found.', 404);
        }

        if (!userData || !userData.active_schedule_id) {
            return sendError(res, 'No active schedule to cancel.', 404);
        }

        const activeScheduleId = userData.active_schedule_id;

        // 2. Fetch the schedule details (role_model_id, total_score) with user and role_model info
        const { data: scheduleData, error: scheduleError } = await supabase
            .from('user_schedules')
            .select(`
                id, 
                user_id, 
                role_model_id, 
                total_score, 
                status,
                users!user_id(name),
                role_models!role_model_id(name)
            `)
            .eq('id', activeScheduleId)
            .single();

        if (scheduleError || !scheduleData) {
            console.error('Error fetching schedule:', scheduleError);
            console.error('Schedule data:', scheduleData);
            return sendError(res, 'Schedule not found.', 404);
        }
        
        console.log('Fetched schedule data:', scheduleData);

        // 3. Update schedule status to 'completed'
        const { error: updateScheduleError } = await supabase
            .from('user_schedules')
            .update({ 
                status: 'completed',
                end_date: new Date().toISOString()
            })
            .eq('id', activeScheduleId);

        if (updateScheduleError) {
            console.error('Error updating schedule status:', updateScheduleError);
            return sendError(res, 'Failed to update schedule status.', 500);
        }

        // 4. Add to rankings table
        // Extract user and role_model names from the joined data
        const userName = Array.isArray(scheduleData.users) ? scheduleData.users[0]?.name : scheduleData.users?.name;
        const roleModelName = Array.isArray(scheduleData.role_models) ? scheduleData.role_models[0]?.name : scheduleData.role_models?.name;
        const rankingName = `${userName || 'User'} - ${roleModelName || 'Role Model'} Challenge`;
        
        const { data: rankingData, error: rankingError } = await supabase
            .from('rankings')
            .insert({
                user_id: scheduleData.user_id,
                role_model_id: scheduleData.role_model_id,
                schedule_id: activeScheduleId,
                ranking_name: rankingName,
                total_score: scheduleData.total_score || 0
            })
            .select();

        if (rankingError) {
            console.error('Error adding to rankings:', rankingError);
            console.error('Failed ranking data:', {
                user_id: scheduleData.user_id,
                role_model_id: scheduleData.role_model_id,
                schedule_id: activeScheduleId,
                ranking_name: rankingName,
                total_score: scheduleData.total_score || 0
            });
            return sendError(res, `Failed to add to rankings: ${rankingError.message}`, 500);
        }
        
        console.log('Successfully added to rankings:', rankingData);

        // 5. Remove active_schedule_id from user
        const { error: updateUserError } = await supabase
            .from('users')
            .update({ active_schedule_id: null })
            .eq('id', userIdQuery);

        if (updateUserError) {
            console.error('Error updating user:', updateUserError);
            return sendError(res, 'Failed to cancel schedule.', 500);
        }

        sendSuccess(res, { 
            message: 'Challenge completed successfully',
            cancelledScheduleId: activeScheduleId,
            finalScore: scheduleData.total_score || 0
        }, 'Challenge has been completed and added to rankings.');

    } catch (error: any) {
        console.error('Error completing challenge:', error.message);
        sendError(res, 'Server error while completing challenge.', 500);
    }
}));

/**
 * Get Ranking List API
 * GET /api/hyun/rankings
 * Query Parameters:
 * - roleModelId (optional): Filter by role model
 * - limit (optional): Number of results (default: 100, max: 500)
 */
// Uses standard Request as authentication is likely not needed here
router.get("/rankings", asyncHandler(async (req: ExpressRequest, res: Response) => {
    const { roleModelId, limit } = req.query;
    const resultLimit = Math.min(parseInt(limit as string) || 100, 500);
    // 1. Base query setup: Select from 'rankings' table
    let query = supabase
        .from('rankings')
        .select(`
            total_score,
            user:users ( id, name ),
            role_model:role_models ( id, name )
        `) // ✅ REMOVED: duration_days selection
        .order('total_score', { ascending: false })
        .limit(resultLimit);
    // 2. Apply role model filter if provided
    if (roleModelId && !isNaN(Number(roleModelId))) {
        query = query.eq('role_model_id', Number(roleModelId));
    }
    try {
        // --- Execute Supabase Query ---
        const { data: rankings, error } = await query;
        // ---
        // Check for Supabase specific errors
        if (error) {
            console.error('Ranking fetch error (Supabase):', error);
            return sendError(res, `Failed to load ranking data from DB: ${error.message}`, 500);
        }
        if (!rankings) {
             console.error('Ranking data is null/undefined after query.');
             return sendError(res, 'Failed to retrieve ranking data structure.', 500);
        }
        // 3. Format the data for the frontend
        const formattedRankings = (rankings || []).map((rank: any, index) => ({
            rank: index + 1,
            score: Number(rank.total_score) || 0,
            userId: rank.user?.id,
            userName: rank.user?.name || 'anonymous user',
            roleModelName: rank.role_model?.name || 'N/A'
            // ✅ REMOVED: durationDays field from formatted data
        }));
        sendSuccess(res, formattedRankings, 'Successfully loaded the ranking data.', 200);
    } catch (error: any) { // Catch block for unexpected errors during processing
        console.error('Error processing rankings (catch block):', error.message);
         return sendError(res, `Server error processing ranking data: ${error.message}`, 500);
    }
}));
export default router;
