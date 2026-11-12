# 리뷰 지침

claude-review-plugin이 PR을 검토할 때 `CLAUDE.md`와 함께 읽는 파일입니다. `CLAUDE.md`의 규칙 가운데 lint, 타입 검사, 테스트가 잡지 못하는 것만 적었습니다.

## 볼 것

- `eslint-plugin-boundaries`가 놓친 MVVM 레이어 위반: View가 Model의 데이터를 직접 가져오거나, ViewModel이 UI를 다루는 경우
- `src/features/*/models/` 밖에서 `@/@types/api`를 import하는 경우
- `common/components/ui/` primitive가 `useTranslation`이나 도메인 로직을 쓰거나, 영어 문구를 하드코딩한 경우
- `index.stories.tsx`가 없거나 `Default`와 `Mobile` story가 빠진 컴포넌트
- 기본값(한국어) 없는 `t()` 호출, `.astro`에서 frontmatter 밖에서 부른 `t()`, 빌드 중 `i18n.changeLanguage` 호출
- `QueryProvider`로 감싸지 않은 island
- 빌드 시점 API 호출에 `throwOnError: true`가 빠진 경우
- 빌드 뒤에 생기는 id를 path param(`[id]`)으로 받는 라우트. query string으로 받아야 한다
- `.env.development`, `.env.production`에 들어간 비밀 값
- stale closure, effect 순서, 실행되지 않는 캐시 무효화
- 쓸모없는 추상화: 구현이 하나뿐인 인터페이스, 바뀌지 않는 값의 설정, 전달만 하는 래퍼
- 코드나 이름을 되풀이하는 주석은 [사소]로 짚는다: 다음 줄이 하는 일을 풀어 쓴 주석, 함수나 타입, prop 이름을 다시 말하는 JSDoc. 주석은 코드가 말하지 못하는 것, 곧 왜 이렇게 해야 하는지와 다르게 짜면 무엇이 깨지는지만 적는다

## 보지 않을 것

- ESLint, Prettier, TypeScript가 이미 잡는 것
- 생성 파일: `src/@types/`, `public/mockServiceWorker.js`, `bun.lock`
