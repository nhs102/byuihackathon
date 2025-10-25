import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import middleware
import { authenticateUser } from "./middleware/auth.js";

// Import routes from each developer's folder
import taeinRoutes from "./taein/index.js";
import hyunRoutes from "./hyun/index.js";
import gisuckRoutes from "./gisuck/index.js";
import sangminRoutes from "./sangmin/index.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount each developer's routes
app.use("/api/taein", taeinRoutes);
app.use("/api/hyun", hyunRoutes); // 인증 미들웨어 제거 - hyun 라우트 내부에서 선택적으로 처리
app.use("/api/gisuck", gisuckRoutes);
app.use("/api/sangmin", sangminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.name || "Error",
    message: err.message || "Internal Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API endpoints:`);
  console.log(`   - http://localhost:${PORT}/api/taein`);
  console.log(`   - http://localhost:${PORT}/api/hyun`);
  console.log(`   - http://localhost:${PORT}/api/gisuck`);
  console.log(`   - http://localhost:${PORT}/api/sangmin`);
});

