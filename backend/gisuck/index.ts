// PLACEHOLDER - gisuck 담당 영역 (AI 스케줄링)
// 이 파일은 gisuck이 실제 코드로 교체할 예정
import express from "express";
const router = express.Router();

// 테스트 엔드포인트
router.get("/test", (req, res) => {
  res.json({ developer: "gisuck", status: "placeholder" });
});

// AI 스케줄링 관련 엔드포인트들 - 빈 상태
router.post("/customize-schedule", (req, res) => {
  res.json({ success: true, message: "Placeholder - will be implemented by gisuck" });
});

router.post("/confirm-schedule", (req, res) => {
  res.json({ success: true, message: "Placeholder - will be implemented by gisuck" });
});

router.get("/active-schedule/:userId", (req, res) => {
  res.json({ success: true, data: null, message: "Placeholder - will be implemented by gisuck" });
});

router.post("/stop-schedule", (req, res) => {
  res.json({ success: true, message: "Placeholder - will be implemented by gisuck" });
});

export default router;