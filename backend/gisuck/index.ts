import express, { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// ===== Supabase Setup =====
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ===== Gemini API Setup =====
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

if (!GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY not set");
}

// ===== Type Definitions =====
interface TimeSlot {
  id: string;
  time: string;
  activity: string;
  category: 'work' | 'personal' | 'health' | 'family' | 'sleep' | 'institutional Governance' | 'education' | 'leisure' | 'other' | 'scripture study';
  color?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ===== Utility Functions =====
const sendSuccess = <T>(res: Response, data: T, message?: string): void => {
  res.status(200).json({ success: true, data, message });
};

const sendError = (res: Response, error: string, statusCode: number = 400): void => {
  res.status(statusCode).json({ success: false, error });
};

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// ===== Time Conversion Functions =====

/**
 * "07:00 AM" → "07:00:00"
 * "02:30 PM" → "14:30:00"
 */
function convertTo24HourFormat(time12h: string): string {
  try {
    time12h = time12h.trim();
    const match = time12h.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    
    if (!match) {
      // Already in 24-hour format
      return time12h.includes(':') && time12h.split(':').length === 2 
        ? `${time12h}:00` 
        : time12h;
    }
    
    let [_, hours, minutes, period] = match;
    let hour = parseInt(hours, 10);
    
    if (period.toUpperCase() === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period.toUpperCase() === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
  } catch (error) {
    console.error('Time conversion error:', error);
    return time12h;
  }
}

/**
 * Calculate end time (start + duration)
 */
function calculateEndTime(startTime: string, activityName: string): string {
  try {
    const start = convertTo24HourFormat(startTime);
    const [hours, minutes] = start.split(':').map(Number);
    
    // Duration based on activity type
    let durationMinutes = 60; // default
    const activity = activityName.toLowerCase();
    
    if (activity.includes('sleep')) durationMinutes = 360; // 6 hours
    else if (activity.includes('work') || activity.includes('study')) durationMinutes = 240; // 4 hours
    else if (activity.includes('meal') || activity.includes('breakfast') || activity.includes('lunch') || activity.includes('dinner')) durationMinutes = 60;
    else if (activity.includes('workout') || activity.includes('exercise')) durationMinutes = 60;
    
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00`;
  } catch (error) {
    return '23:59:00';
  }
}

/**
 * Map frontend category to DB category
 */
function mapCategoryToDb(category: string): string {
  const map: Record<string, string> = {
    'work': 'Work',
    'personal': 'Personal',
    'health': 'Personal',
    'family': 'Family Time',
    'sleep': 'Sleep'
  };
  return map[category.toLowerCase()] || 'Personal';
}

function getActivityColor(activity: string): string {
  const lower = activity.toLowerCase();
  if (lower.includes('work') || lower.includes('meeting')) return '#3b82f6';
  if (lower.includes('exercise') || lower.includes('workout')) return '#10b981';
  if (lower.includes('read') || lower.includes('learn')) return '#8b5cf6';
  if (lower.includes('family') || lower.includes('dinner')) return '#f59e0b';
  if (lower.includes('sleep')) return '#1a2332';
  return '#6b7280';
}

// ===== Gemini AI Functions =====

async function callGeminiApi(prompt: string, retries = 2): Promise<{ schedule: TimeSlot[], explanation: string }> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  console.log("🤖 Calling Gemini API...");
  console.log(`📏 Prompt length: ${prompt.length} characters`);

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 8192,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
    ]
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
        console.log(`⏳ Retrying in ${waitTime}ms... (Attempt ${attempt + 1}/${retries + 1})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `Gemini API failed: ${response.status}`;
        let shouldRetry = false;
        
        try {
          const errorData = await response.json() as any;
          console.error("❌ Gemini API Error Details:", JSON.stringify(errorData, null, 2));
          if (errorData?.error?.message) {
            errorMessage += ` - ${errorData.error.message}`;
          }
          
          // Retry on 429 (rate limit) or 503 (service unavailable)
          shouldRetry = response.status === 429 || response.status === 503;
        } catch (e) {
          console.error("❌ Could not parse error response");
          shouldRetry = response.status === 503;
        }
        
        if (shouldRetry && attempt < retries) {
          console.log(`⚠️ ${errorMessage} - Will retry...`);
          continue; // Try again
        }
        
        throw new Error(errorMessage);
      }

      // Success - parse response
      interface GeminiResponse {
        candidates?: Array<{
          content?: {
            parts?: Array<{
              text?: string;
            }>;
          };
        }>;
      }

      const data = await response.json() as GeminiResponse;
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) {
        throw new Error("Invalid Gemini response");
      }

      return parseGeminiResponse(textResponse);
      
    } catch (error: any) {
      // If this is the last attempt or not a retryable error, throw
      if (attempt >= retries || !error.message?.includes('503') && !error.message?.includes('429')) {
        throw error;
      }
      // Otherwise, continue to next retry
      console.log(`⚠️ Attempt ${attempt + 1} failed:`, error.message);
    }
  }
  
  // Should never reach here, but just in case
  throw new Error("Failed to get response from Gemini API after all retries");
}

function parseGeminiResponse(text: string): { schedule: TimeSlot[], explanation: string } {
  console.log("📝 Parsing AI response...");

  // Extract explanation
  const explanationMatch = text.match(/EXPLANATION:\s*(.*?)(?=SCHEDULE:|$)/s);
  const explanation = explanationMatch?.[1]?.trim() || "Schedule customized!";

  // Extract schedule JSON
  let scheduleMatch = text.match(/SCHEDULE:\s*(\[[\s\S]*?\])/);
  if (!scheduleMatch) {
    scheduleMatch = text.match(/(\[\s*\{[\s\S]*?\}\s*\])/);
  }
  if (!scheduleMatch) {
    scheduleMatch = text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
  }

  if (!scheduleMatch) {
    throw new Error("Could not find schedule in AI response. Try rephrasing your request.");
  }

  const jsonStr = scheduleMatch[1].trim().replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(jsonStr);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Invalid schedule format");
  }

  const schedule: TimeSlot[] = parsed.map((slot: any, index: number) => ({
    id: slot.id || `slot-${Date.now()}-${index}`,
    time: slot.time,
    activity: slot.activity,
    category: slot.category || 'personal',
    color: slot.color || getActivityColor(slot.activity),
  }));

  console.log(`✅ Parsed ${schedule.length} schedule items`);
  return { schedule, explanation };
}

function createSchedulePrompt(currentSchedule: TimeSlot[], userQuery: string, roleModelPhilosophy: string): string {
  const scheduleText = currentSchedule
    .map((slot, idx) => `${idx + 1}. ${slot.time}: ${slot.activity} (${slot.category})`)
    .join('\n');

  return `You are an expert schedule and lifestyle integration assistant. Your task is to analyze a user's request, their current schedule, and the core philosophy of a chosen role model. You will then synthesize these elements into a new, actionable schedule.

The primary goal is NOT to simply copy the role model's superficial habits (e.g., "wake up at 6 AM because they do"). The goal is to embed their underlying principles, values, and operational ideology into the user's daily structure, adapting them to the user's own life and goals.

CURRENT SCHEDULE:
${scheduleText}

USER REQUEST:
"${userQuery}"

ROLE MODEL INSIGHTS (PHILOSOPHY & PRINCIPLES):
${roleModelPhilosophy}

INSTRUCTIONS:
Analyze Ideology: First, deeply analyze the ROLE MODEL INSIGHTS. Identify the core principles (e.g., "First Principles Thinking," "Constant Outreach," "Spiritual Primacy," "Bias for Action," "Living in Crescendo").
Translate Principles: Translate these abstract principles into concrete, schedulable types of activities. The naming of the activity should reflect the principle.
Example 1: If the principle is "First Principles Thinking," don't just schedule "Project Work." Schedule "Deep Work: Problem Deconstruction" or "Strategic Review: Challenge Assumptions."
Example 2: If the principle is "Daily Spiritual Immersion," schedule "Protected Study: Uninterruptible" as a high-priority, non-negotiable block.
Example 3: If the principle is "Living in Crescendo" (constant improvement), add a recurring block for "Weekly Review: Identify 1% Improvement" or "Dedicated Skill Acquisition."
Synthesize & Modify: Modify the CURRENT SCHEDULE to skillfully integrate both the USER REQUEST and these new principle-driven blocks.
Maintain Constraints: The final schedule must include 7-8 hours of sleep and logical, consistent meal times.
Justify Changes: In the EXPLANATION section, you MUST articulate how the role model's philosophy (not just their habits) shaped the new schedule. Be specific (e.g., "To reflect [Principle X], the 'Project Time' block was renamed and refocused to 'Deep Work: System Deconstruction'...")
Format: Return the complete response in the exact format required.

REQUIRED FORMAT:

EXPLANATION: [2-4 sentences explicitly justifying how the role model's principles were integrated to meet the user's request. Be specific.]

SCHEDULE:
[
  {"id": "slot-1", "time": "6:00 AM", "activity": "Morning routine", "category": "personal", "color": "#6b7280"},
  {"id": "slot-2", "time": "7:00 AM", "activity": "Breakfast", "category": "family", "color": "#f59e0b"}
]

Include ALL items. Use exact format. Don't truncate.`;
}

// ===== API Routes =====

/**
 * Test endpoint
 * GET /api/gisuck/test
 */
router.get("/test", (req: Request, res: Response) => {
  sendSuccess(res, { 
    status: "OK",
    timestamp: new Date().toISOString(),
    geminiConfigured: !!GEMINI_API_KEY,
    supabaseConfigured: !!supabaseUrl && !!supabaseKey
  });
});

/**
 * AI Schedule Customization
 * POST /api/gisuck/customize-schedule
 * 
 * Body: { userId, roleModelId, currentSchedule, userQuery }
 */
router.post("/customize-schedule", asyncHandler(async (req: Request, res: Response) => {
  const { userId, roleModelId, currentSchedule, userQuery } = req.body;

  console.log("\n🔄 === CUSTOMIZE SCHEDULE ===");
  console.log("User:", userId, "| Query:", userQuery);

  // Validation
  if (!userId || !roleModelId || !currentSchedule || !userQuery) {
    return sendError(res, "Missing required fields", 400);
  }

  if (!Array.isArray(currentSchedule) || currentSchedule.length === 0) {
    return sendError(res, "Invalid schedule", 400);
  }

  try {
    // Fetch role model philosophy from database
    const { data: roleModelData, error: roleModelError } = await supabase
      .from('role_models')
      .select('philosophy')
      .eq('id', roleModelId)
      .single();

    if (roleModelError || !roleModelData) {
      console.error("❌ Role model fetch error:", roleModelError);
      return sendError(res, "Failed to fetch role model data", 500);
    }

    const roleModelPhilosophy = roleModelData.philosophy || "Focus on discipline, continuous improvement, and balanced living.";
    console.log("📖 Role model philosophy:", roleModelPhilosophy.substring(0, 100) + "...");

    // Call Gemini AI with role model philosophy
    const prompt = createSchedulePrompt(currentSchedule, userQuery, roleModelPhilosophy);
    const { schedule: modifiedSchedule, explanation } = await callGeminiApi(prompt);
    
    console.log(`✅ Generated ${modifiedSchedule.length} schedule items`);
    
    sendSuccess(res, {
      message: explanation,
      modifiedSchedule,
      originalSchedule: currentSchedule,
    });

  } catch (error: any) {
    console.error("❌ Customize error:", error.message);
    sendError(res, error.message || "Failed to customize schedule", 500);
  }
}));

/**
 * Confirm Schedule
 * POST /api/gisuck/confirm-schedule
 * 
 * This is the MAIN function that saves data to database
 * 
 * Body: { userId, roleModelId, roleModelName, schedule }
 */
router.post("/confirm-schedule", asyncHandler(async (req: Request, res: Response) => {
  const { userId, roleModelId, roleModelName, schedule } = req.body;

  console.log("\n💾 === CONFIRM SCHEDULE ===");
  console.log("User:", userId);
  console.log("Role Model:", roleModelName);
  console.log("Tasks:", schedule?.length);

  // Validation
  if (!userId || !roleModelId || !roleModelName || !schedule || schedule.length === 0) {
    return sendError(res, "Missing required fields", 400);
  }

  try {
    // STEP 1: Check if user already has active schedule
    console.log("1️⃣ Checking existing active schedule...");
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('active_schedule_id')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    if (user.active_schedule_id) {
      console.log("⚠️  User already has active schedule");
      return sendError(res, "You already have an active schedule. Stop it first.", 400);
    }
       // STEP 2: Verify role_model exists
    console.log("2️⃣ Verifying role_model exists...");
    const { data: roleModel, error: roleModelError } = await supabase
      .from('role_models')
      .select('id, name')
      .eq('id', roleModelId)
      .single();

   if (roleModelError || !roleModel) {
     console.error("❌ Role model not found:", roleModelId);
     return sendError(res, `Role model with ID ${roleModelId} does not exist. Please select a valid role model.`, 400);
   }
    // STEP 2: Create user_schedule
    console.log("2️⃣ Creating user_schedule...");
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const { data: userSchedule, error: scheduleError } = await supabase
      .from('user_schedules')
      .insert({
        user_id: userId,
        role_model_id: roleModelId,
        status: 'active',
        total_score: 0,
        start_date: today,
        end_date: tomorrowStr
      })
      .select()
      .single();

    if (scheduleError) {
      console.error("❌ Failed to create user_schedule:", scheduleError);
      throw new Error(`Schedule creation failed: ${scheduleError.message}`);
    }

    const userScheduleId = userSchedule.id;
    console.log(`✅ user_schedule created (ID: ${userScheduleId})`);

    // STEP 3: Create user_tasks
    console.log(`3️⃣ Creating ${schedule.length} user_tasks...`);
    
    const tasksToInsert = schedule.map((slot: TimeSlot, index: number) => ({
      user_schedule_id: userScheduleId,
      start_time: convertTo24HourFormat(slot.time),
      end_time: calculateEndTime(slot.time, slot.activity),
      activity_name: slot.activity,
      category: mapCategoryToDb(slot.category),
      is_completed: false,
      display_order: index + 1
    }));

    const { data: tasks, error: tasksError } = await supabase
      .from('user_tasks')
      .insert(tasksToInsert)
      .select();

    if (tasksError) {
      console.error("❌ Failed to create tasks:", tasksError);
      // Rollback: delete user_schedule
      await supabase.from('user_schedules').delete().eq('id', userScheduleId);
      throw new Error(`Task creation failed: ${tasksError.message}`);
    }

    console.log(`✅ ${tasks?.length || 0} tasks created`);

    // STEP 4: Update user's active_schedule_id
    console.log("4️⃣ Updating user's active_schedule_id...");
    const { error: updateError } = await supabase
      .from('users')
      .update({ active_schedule_id: userScheduleId })
      .eq('id', userId);

    if (updateError) {
      console.error("❌ Failed to update user:", updateError);
      // Rollback: delete tasks and schedule
      await supabase.from('user_tasks').delete().eq('user_schedule_id', userScheduleId);
      await supabase.from('user_schedules').delete().eq('id', userScheduleId);
      throw new Error(`User update failed: ${updateError.message}`);
    }

    console.log("✅ User updated");
    console.log("🎉 Schedule confirmed successfully!\n");

    // Success!
    sendSuccess(res, {
      userScheduleId,
      tasksCreated: tasks?.length || 0,
      message: "Schedule confirmed and started!"
    });

  } catch (error: any) {
    console.error("❌ CONFIRM ERROR:", error.message);
    sendError(res, error.message || "Failed to confirm schedule", 500);
  }
}));

/**
 * Get Active Schedule
 * GET /api/gisuck/active-schedule/:userId
 */
router.get("/active-schedule/:userId", asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  console.log("\n📋 === GET ACTIVE SCHEDULE ===");
  console.log("User:", userId);

  if (!userId) {
    return sendError(res, "Missing userId", 400);
  }

  try {
    // Get user's active_schedule_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('active_schedule_id')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    if (!user.active_schedule_id) {
      console.log("No active schedule");
      return sendSuccess(res, null, "No active schedule");
    }

    // Get schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from('user_schedules')
      .select('*')
      .eq('id', user.active_schedule_id)
      .single();

    if (scheduleError) throw scheduleError;

    // Get tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('user_tasks')
      .select('*')
      .eq('user_schedule_id', user.active_schedule_id)
      .order('display_order', { ascending: true });

    if (tasksError) throw tasksError;

    console.log(`✅ Found schedule with ${tasks?.length || 0} tasks\n`);

    sendSuccess(res, {
      scheduleId: schedule.id,
      roleModelId: schedule.role_model_id,
      status: schedule.status,
      tasks,
      score: schedule.total_score,
      startDate: schedule.start_date,
      endDate: schedule.end_date
    });

  } catch (error: any) {
    console.error("❌ GET ERROR:", error.message);
    sendError(res, error.message || "Failed to get schedule", 500);
  }
}));

/**
 * Stop Active Schedule
 * POST /api/gisuck/stop-schedule
 * 
 * Body: { userId }
 */
router.post("/stop-schedule", asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;

  console.log("\n🛑 === STOP SCHEDULE ===");
  console.log("User:", userId);

  if (!userId) {
    return sendError(res, "Missing userId", 400);
  }

  try {
    // Get active_schedule_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('active_schedule_id')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    if (!user.active_schedule_id) {
      return sendError(res, "No active schedule to stop", 404);
    }

    const scheduleId = user.active_schedule_id;

    // Update schedule status
    const { data: schedule, error: updateError } = await supabase
      .from('user_schedules')
      .update({ 
        status: 'completed',
        end_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', scheduleId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Clear user's active_schedule_id
    const { error: clearError } = await supabase
      .from('users')
      .update({ active_schedule_id: null })
      .eq('id', userId);

    if (clearError) throw clearError;

    console.log("✅ Schedule stopped\n");

    sendSuccess(res, {
      scheduleId,
      finalScore: schedule.total_score
    });

  } catch (error: any) {
    console.error("❌ STOP ERROR:", error.message);
    sendError(res, error.message || "Failed to stop schedule", 500);
  }
}));

export default router;