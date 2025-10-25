// PLACEHOLDER - sangmin 담당 영역 (홈화면 & 콘텐츠)
// 이 파일은 sangmin이 실제 코드로 교체할 예정
import express from "express";
const router = express.Router();

// 테스트 엔드포인트
router.get("/test", (req, res) => {
  res.json({ developer: "sangmin", status: "placeholder" });
});

// 홈화면 & 콘텐츠 관련 엔드포인트들 - 빈 상태
router.get("/home", (req, res) => {
  res.json({ success: true, data: {}, message: "Placeholder - will be implemented by sangmin" });
});

router.get("/role-models", (req, res) => {
  res.json({ success: true, data: [], message: "Placeholder - will be implemented by sangmin" });
});

router.get("/popular-templates", (req, res) => {
  res.json({ success: true, data: [], message: "Placeholder - will be implemented by sangmin" });
});

router.get("/recent-projects", (req, res) => {
  res.json({ success: true, data: [], message: "Placeholder - will be implemented by sangmin" });
});

router.get("/user-stats", (req, res) => {
  res.json({ success: true, data: {}, message: "Placeholder - will be implemented by sangmin" });
});

export default router;