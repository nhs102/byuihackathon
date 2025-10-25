// PLACEHOLDER - hyun 담당 영역 (태스크 관리 & 랭킹)
// 이 파일은 hyun이 실제 코드로 교체할 예정
import express from "express";
const router = express.Router();

// 테스트 엔드포인트
router.get("/test", (req, res) => {
  res.json({ developer: "hyun", status: "placeholder" });
});

// 나머지 엔드포인트들은 빈 상태로 유지
router.get("/users/me/active-tasks", (req, res) => {
  res.json({ success: true, data: [], message: "Placeholder - will be implemented by hyun" });
});

router.get("/users/:userId/active-tasks", (req, res) => {
  res.json({ success: true, data: [], message: "Placeholder - will be implemented by hyun" });
});

router.post("/tasks/:taskId/start", (req, res) => {
  res.json({ success: true, message: "Placeholder - will be implemented by hyun" });
});

router.post("/tasks/:taskId/complete", (req, res) => {
  res.json({ success: true, message: "Placeholder - will be implemented by hyun" });
});

router.post("/users/:userId/cancel-schedule", (req, res) => {
  res.json({ success: true, message: "Placeholder - will be implemented by hyun" });
});

router.get("/rankings", (req, res) => {
  res.json({ success: true, data: [], message: "Placeholder - will be implemented by hyun" });
});

export default router;