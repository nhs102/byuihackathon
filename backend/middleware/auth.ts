import { Request, Response, NextFunction } from 'express';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Extend Express Request to include user
export interface RequestWithUser extends Request {
  user?: SupabaseUser;
}

/**
 * Authentication middleware that verifies Supabase JWT token
 */
export const authenticateUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    // Extract the token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Auth verification failed:', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token.'
      });
    }

    // Attach the user to the request object
    req.user = user;
    
    console.log(`✅ Authenticated user: ${user.id} (${user.email})`);
    
    next();
  } catch (error: any) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed.'
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        req.user = user;
        console.log(`✅ Optional auth - user identified: ${user.id}`);
      }
    }
    
    next();
  } catch (error) {
    // Don't fail, just continue without user
    console.warn('Optional auth failed, continuing without user');
    next();
  }
};
