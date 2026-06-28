import { type Article } from "./article";

/**
 * Mock data source. Stands in for the future API layer and follows the same
 * rules: only feature ViewModels read from here, never Views directly.
 */

export const FEATURED_ARTICLES: Article[] = [
  {
    category: "분류 없음",
    title: "빠른 콘텐츠와 느린 식사법",
    author: "지스트 신문사",
    publishedAt: "2025년 12월 26일",
    href: "#",
    mainImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  },
  {
    category: "4컷 만화/만평",
    title: "[만평] 화석연료 사용",
    author: "지스트 신문사",
    publishedAt: "15시간 전",
    href: "#",
    mainImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  },
  {
    category: "학술·연구",
    title: "AI가 논문을 읽는 시대: 연구 생산성은 어디까지 올라갈까",
    author: "지스트 신문사",
    publishedAt: "2일 전",
    href: "#",
    mainImage:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop",
  },
  {
    category: "문화",
    title: "캠퍼스 공연 후기: 작은 무대가 만든 큰 여운",
    author: "지스트 신문사",
    publishedAt: "2026. 1. 20",
    href: "#",
    mainImage:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop",
  },
];

export const TREND_ARTICLES: Article[] = [
  {
    category: "사회",
    title: "2025 APEC Among Engineers",
    author: "장도윤",
    publishedAt: "15시간 전",
    href: "#",
    thumbnailImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
  },
  {
    category: "대학",
    title: "학생들 '호실 부족' 우려... 대학생활관 현황과 대책은",
    author: "장도윤",
    publishedAt: "2026. 1. 26",
    href: "#",
    thumbnailImage:
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&h=200&fit=crop",
  },
  {
    category: "오피니언",
    title: "대학의 공공성과 등록금: 우리는 무엇을 기대해야 하나",
    author: "지스트 신문사",
    publishedAt: "3시간 전",
    href: "#",
    thumbnailImage:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200&h=200&fit=crop",
  },
  {
    category: "현장르포",
    title: "눈 내린 아침, 학생회관 앞 풍경 스케치",
    author: "지스트 신문사",
    publishedAt: "어제",
    href: "#",
    thumbnailImage:
      "https://images.unsplash.com/photo-1489587025925-546f830d612e?w=200&h=200&fit=crop",
  },
  {
    category: "기획·특집",
    title: "실험실 안전, 체크리스트로 끝낼 수 있을까",
    author: "지스트 신문사",
    publishedAt: "2026. 1. 18",
    href: "#",
    thumbnailImage:
      "https://images.unsplash.com/photo-1581093588401-22d3b2a2b6c1?w=200&h=200&fit=crop",
  },
];

export function getArticlesByCategory(
  label: string,
  seed: string,
  count = 3,
): Article[] {
  return Array.from({ length: count }).map((_, idx) => ({
    category: label,
    title: `${label} 목업 기사 ${idx + 1}`,
    author: "지스트 신문사",
    publishedAt: idx === 0 ? "방금 전" : idx === 1 ? "3시간 전" : "어제",
    href: "#",
    thumbnailImage: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&sig=${seed}-${idx}`,
  }));
}
