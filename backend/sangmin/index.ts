import express, { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables. Check your .env file.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ===== 유틸리티 함수들 =====
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

/**
 * 홈화면 메인 데이터 조회
 * GET /api/sangmin/home
 */
router.get("/home", asyncHandler(async (req: Request, res: Response) => {
  try {
    // 홈화면에 필요한 데이터들을 조회
    const homeData = {
      hero: {
        title: "브랜드 아이덴티티 디자인 시스템",
        subtitle: "일관성 있고 강력한 브랜드 경험을 만들어보세요",
        cta: "시작하기"
      },
      features: [
        {
          id: 1,
          title: "컬러 팔레트",
          description: "브랜드에 맞는 완벽한 컬러 조합",
          icon: "🎨"
        },
        {
          id: 2,
          title: "타이포그래피",
          description: "일관된 폰트 시스템",
          icon: "📝"
        },
        {
          id: 3,
          title: "컴포넌트",
          description: "재사용 가능한 UI 컴포넌트",
          icon: "🧩"
        }
      ],
      stats: {
        totalUsers: 1250,
        activeProjects: 89,
        templatesCreated: 156
      }
    };

    sendSuccess(res, homeData, "홈화면 데이터를 성공적으로 조회했습니다.");
  } catch (error) {
    sendError(res, "홈화면 데이터 조회 중 오류가 발생했습니다.", 500);
  }
}));

/**
 * 인기 템플릿 조회
 * GET /api/sangmin/popular-templates
 */
router.get("/popular-templates", asyncHandler(async (req: Request, res: Response) => {
  try {
    const templates = [
      {
        id: 1,
        name: "모던 비즈니스",
        category: "비즈니스",
        thumbnail: "/templates/modern-business.jpg",
        downloads: 1250,
        rating: 4.8
      },
      {
        id: 2,
        name: "크리에이티브 스튜디오",
        category: "크리에이티브",
        thumbnail: "/templates/creative-studio.jpg",
        downloads: 980,
        rating: 4.7
      },
      {
        id: 3,
        name: "미니멀 디자인",
        category: "미니멀",
        thumbnail: "/templates/minimal.jpg",
        downloads: 2100,
        rating: 4.9
      }
    ];

    sendSuccess(res, templates, "인기 템플릿을 성공적으로 조회했습니다.");
  } catch (error) {
    sendError(res, "템플릿 조회 중 오류가 발생했습니다.", 500);
  }
}));

/**
 * 최근 프로젝트 조회
 * GET /api/sangmin/recent-projects
 */
router.get("/recent-projects", asyncHandler(async (req: Request, res: Response) => {
  try {
    // 실제로는 Supabase에서 사용자의 최근 프로젝트를 조회
    const projects = [
      {
        id: 1,
        name: "새로운 브랜드 아이덴티티",
        lastModified: "2024-01-15T10:30:00Z",
        status: "진행중"
      },
      {
        id: 2,
        name: "웹사이트 리뉴얼",
        lastModified: "2024-01-14T15:45:00Z",
        status: "완료"
      }
    ];

    sendSuccess(res, projects, "최근 프로젝트를 성공적으로 조회했습니다.");
  } catch (error) {
    sendError(res, "프로젝트 조회 중 오류가 발생했습니다.", 500);
  }
}));

/**
 * 사용자 통계 조회
 * GET /api/sangmin/user-stats
 */
router.get("/user-stats", asyncHandler(async (req: Request, res: Response) => {
  try {
    const stats = {
      totalProjects: 12,
      templatesUsed: 8,
      designsCreated: 45,
      lastLogin: "2024-01-15T09:00:00Z"
    };

    sendSuccess(res, stats, "사용자 통계를 성공적으로 조회했습니다.");
  } catch (error) {
    sendError(res, "사용자 통계 조회 중 오류가 발생했습니다.", 500);
  }
}));

/**
 * 롤모델 검색 API
 * GET /api/sangmin/role-models?search=검색어
 */
router.get("/role-models", asyncHandler(async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    
    // 롤모델 데이터 (실제로는 Supabase에서 조회)
    const roleModels = [
      {
        id: '1',
        name: 'Elon Musk',
        quote: 'When something is important enough, you do it even if the odds are not in your favor.',
        imageUrl: '/images/elon.png',
        accentColor: '#3b82f6',
        isFeatured: true,
      },
      {
        id: '2',
        name: 'Russell M. Nelson',
        quote: 'The joy we feel has little to do with the circumstances of our lives and everything to do with the focus of our lives.',
        imageUrl: '/images/russell.png',
        accentColor: '#8b5cf6',
        isPopular: true,
      },
      {
        id: '3',
        name: 'Michael Jordan',
        quote: 'I\'ve failed over and over again in my life. And that is why I succeed.',
        imageUrl: '/images/image.png',
        accentColor: '#ef4444',
        isFeatured: true,
      },
      {
        id: '4',
        name: 'Donald Trump',
        quote: 'What separates the winners from the losers is how a person reacts to each new twist of fate.',
        imageUrl: '/images/trump.png',
        accentColor: '#f59e0b',
      }
    ];

    // 검색어가 있으면 필터링, 없으면 전체 반환
    let filteredModels = roleModels;
    if (search && typeof search === 'string') {
      filteredModels = roleModels.filter(model => 
        model.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    sendSuccess(res, filteredModels, "롤모델 검색 결과를 성공적으로 조회했습니다.");
  } catch (error) {
    sendError(res, "롤모델 검색 중 오류가 발생했습니다.", 500);
  }
}));

/**
 * Test endpoint for Sangmin
 * GET /api/sangmin/test
 */
router.get("/test", (req: Request, res: Response) => {
  sendSuccess(res, { developer: "sangmin" }, "Sangmin's API works!");
});

export default router;

