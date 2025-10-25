import express, { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const router = express.Router();

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase environment variables not found. Running in development mode without database.");
  // 임시로 더미 값 설정
  const dummyUrl = "https://dummy.supabase.co";
  const dummyKey = "dummy-key";
  // 실제 Supabase 클라이언트는 사용하지 않음
}

// Custom fetch using axios to bypass Node.js fetch issues
const customFetch: typeof fetch = async (url: any, options?: any): Promise<any> => {
  try {
    // Clean headers - convert Headers object to plain object and filter valid values
    let cleanHeaders: Record<string, string> = {};
    if (options?.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value: string, key: string) => {
          if (value && typeof value === 'string') {
            cleanHeaders[key] = value;
          }
        });
      } else if (typeof options.headers === 'object') {
        Object.entries(options.headers).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            cleanHeaders[key] = value;
          }
        });
      }
    }

    const axiosResponse = await axios({
      url: url.toString(),
      method: options?.method || 'GET',
      headers: cleanHeaders,
      data: options?.body,
      validateStatus: () => true,
    });

    return {
      ok: axiosResponse.status >= 200 && axiosResponse.status < 300,
      status: axiosResponse.status,
      statusText: axiosResponse.statusText,
      headers: new Headers(axiosResponse.headers as any),
      json: async () => axiosResponse.data,
      text: async () => JSON.stringify(axiosResponse.data),
      blob: async () => new Blob([JSON.stringify(axiosResponse.data)]),
      arrayBuffer: async () => new ArrayBuffer(0),
      clone: () => this,
    };
  } catch (error: any) {
    console.error('Custom fetch error:', error.message);
    throw error;
  }
};

// Create Supabase client with axios-based fetch (임시로 더미 클라이언트)
let supabase;
if (supabaseUrl && supabaseKey && supabaseUrl !== "https://dummy.supabase.co") {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
    global: {
      fetch: customFetch as any,
    },
  });
} else {
  // 더미 Supabase 클라이언트 (개발 모드)
  supabase = {
    from: () => ({
      select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) })
    })
  };
}

// ===== Utility Functions =====
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

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

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ===== API Endpoints =====

/**
 * Test endpoint
 * GET /api/taein/test
 */
router.get("/test", (req: Request, res: Response) => {
  sendSuccess(res, { developer: "taein" }, "Taein's API works!");
});

/**
 * Sign up a new user
 * POST /api/taein/signup
 * Body: { email: string, name: string }
 */
router.post("/signup", asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    // Validate input
    if (!email || !name) {
      return sendError(res, "Email and name are required", 400);
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return sendError(res, "User with this email already exists", 409);
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    sendSuccess(res, newUser, "User created successfully", 201);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
}));

/**
 * Sign in a user
 * POST /api/taein/signin
 * Body: { email: string }
 */
router.post("/signin", asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return sendError(res, "Email is required", 400);
    }

    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return sendError(res, "No account found with this email", 404);
    }

    sendSuccess(res, user, "Sign in successful");
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
}));

export default router;
