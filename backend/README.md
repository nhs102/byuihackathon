# 🚀 Hackathon Backend

A modular Express + Supabase backend designed for fast, conflict-free team collaboration.

## 📁 Structure

```
backend/
├── taein/              # Taein's module
│   ├── index.ts        # Routes (required)
│   ├── controller.ts   # Controllers (optional)
│   ├── service.ts      # Business logic (optional)
│   └── types.ts        # Types (optional)
│
├── hyun/               # Hyun's module
│   └── index.ts
│
├── gisuck/             # Gisuck's module
│   └── index.ts
│
├── sangmin/            # Sangmin's module
│   └── index.ts
│
├── shared/             # Shared utilities
│   ├── supabase.ts     # Supabase client
│   ├── types.ts        # Shared types
│   └── utils.ts        # Helper functions
│
├── app.ts              # Main server entry point
└── package.json
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run the Server

```bash
npm run dev
```

Server will run on: **http://localhost:5000**

## 🎯 API Endpoints

Each developer has their own API namespace:

| Developer | Base URL | Test Endpoint |
|-----------|----------|---------------|
| Taein | `/api/taein` | GET `/api/taein/test` |
| Hyun | `/api/hyun` | GET `/api/hyun/test` |
| Gisuck | `/api/gisuck` | GET `/api/gisuck/test` |
| Sangmin | `/api/sangmin` | GET `/api/sangmin/test` |

**Health Check:** GET `/health`

## 👨‍💻 Developer Guide

### Working in Your Module

Each developer works **only in their own folder**. This prevents merge conflicts!

#### Example: Taein's workflow

1. **Navigate to your folder:**
   ```bash
   cd backend/taein
   ```

2. **Edit `index.ts` to add routes:**
   ```typescript
   router.get("/my-feature", asyncHandler(async (req, res) => {
     const data = await myService();
     sendSuccess(res, data, "Success!");
   }));
   ```

3. **Optional: Create `service.ts` for business logic:**
   ```typescript
   export const myService = async () => {
     const { data, error } = await supabase
       .from('my_table')
       .select('*');
     
     if (error) throw error;
     return data;
   };
   ```

4. **Optional: Create `types.ts` for your types:**
   ```typescript
   export interface MyData {
     id: string;
     name: string;
   }
   ```

### File Organization Options

**Option 1: Simple (Just index.ts)**
```
taein/
└── index.ts  # All code in one file
```

**Option 2: Organized (Recommended for complex features)**
```
taein/
├── index.ts       # Routes only
├── controller.ts  # Request handlers
├── service.ts     # Business logic & DB calls
└── types.ts       # TypeScript types
```

## 🔧 Using Shared Utilities

### Supabase Client

```typescript
import supabase from "../shared/supabase.js";

const { data, error } = await supabase
  .from('users')
  .select('*');
```

### Response Helpers

```typescript
import { sendSuccess, sendError } from "../shared/utils.js";

// Success response
sendSuccess(res, { id: 1, name: "test" }, "Data retrieved");

// Error response
sendError(res, "Something went wrong", 400);
```

### Async Handler

```typescript
import { asyncHandler } from "../shared/utils.js";

router.get("/data", asyncHandler(async (req, res) => {
  // Errors are automatically caught
  const data = await fetchData();
  sendSuccess(res, data);
}));
```

## 📝 Example: Adding a New Feature

Let's say **Taein** wants to add a user profile endpoint:

**1. Add route in `taein/index.ts`:**
```typescript
router.get("/profile/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const profile = await getUserProfile(id);
  sendSuccess(res, profile);
}));
```

**2. Add service function in `taein/service.ts`:**
```typescript
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};
```

**3. Test it:**
```bash
curl http://localhost:5000/api/taein/profile/123
```

## 🧪 Testing Endpoints

### Using cURL

```bash
# Test endpoint
curl http://localhost:5000/api/taein/test

# POST request
curl -X POST http://localhost:5000/api/taein/something \
  -H "Content-Type: application/json" \
  -d '{"name":"test"}'

# With authentication (if implemented)
curl http://localhost:5000/api/taein/data \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Thunder Client / Postman

1. GET `http://localhost:5000/health` - Check server is running
2. GET `http://localhost:5000/api/taein/test` - Test your endpoint

## 🗃️ Supabase Integration

### Basic Query

```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*');

if (error) throw error;
```

### Insert Data

```typescript
const { data, error } = await supabase
  .from('table_name')
  .insert({ name: 'John', email: 'john@example.com' })
  .select()
  .single();
```

### Update Data

```typescript
const { data, error } = await supabase
  .from('table_name')
  .update({ name: 'Jane' })
  .eq('id', userId)
  .select()
  .single();
```

### Delete Data

```typescript
const { error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', userId);
```

## 🚨 Common Patterns

### Authentication Middleware

If you need to protect routes:

```typescript
// In your index.ts
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return sendError(res, "No token provided", 401);
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return sendError(res, "Invalid token", 401);
  }
  
  req.user = user;
  next();
};

// Use it
router.get("/protected", requireAuth, asyncHandler(async (req, res) => {
  sendSuccess(res, req.user);
}));
```

### Error Handling

Always use `asyncHandler` for async routes:

```typescript
// ✅ Good
router.get("/data", asyncHandler(async (req, res) => {
  const data = await supabase.from('table').select();
  sendSuccess(res, data);
}));

// ❌ Bad - errors won't be caught
router.get("/data", async (req, res) => {
  const data = await supabase.from('table').select();
  sendSuccess(res, data);
});
```

## 📊 Response Format

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🔥 Hot Tips for Hackathons

1. **Start Simple** - Begin with just `index.ts`, add files as needed
2. **Test Early** - Test endpoints as you build them
3. **Use Shared Utils** - Don't reinvent the wheel
4. **Comment Your Code** - Help teammates understand your API
5. **Commit Often** - Small commits = less conflicts
6. **Communicate** - Let team know what endpoints you're building

## 🐛 Troubleshooting

### Port already in use
```bash
# Change PORT in .env
PORT=5001
```

### Supabase connection error
- Check your `.env` file has correct credentials
- Verify Supabase project is active

### Import errors
- Make sure to use `.js` extension in imports (TypeScript requirement)
- Example: `import supabase from "../shared/supabase.js"`

### CORS errors
- Update `CLIENT_URL` in `.env`
- Check `app.ts` CORS configuration

## 📚 Additional Resources

- [Express.js Docs](https://expressjs.com/)
- [Supabase Docs](https://supabase.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Team Workflow

1. Each developer works in their own folder
2. Create routes in `index.ts`
3. Test endpoints locally
4. Commit and push changes
5. Minimal merge conflicts! 🎉

---

**Happy Hacking! 🚀**

