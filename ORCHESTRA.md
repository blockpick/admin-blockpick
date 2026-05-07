# BlockPick Admin 오케스트레이션

## 프로젝트 정보
- 이름: admin-blockpick
- 유형: 관리자 대시보드 (외부 백엔드 API 연동)
- 경로: /Users/simjaehyeong/Desktop/adrock/admin-blockpick
- 스캔일: 2026-02-24
- 기술스택: Next.js 16, React 19, TypeScript 5, Tailwind CSS 3.4, shadcn/ui, TanStack Query 5, React Hook Form + Zod, Recharts, next-themes
- 패키지 매니저: pnpm
- 백엔드: 외부 API (https://api-dev.blockpick.net)
- API 스펙: ADMIN_API_SPEC.md (claude-planning-kit 프로젝트)

## 프로젝트 특성
> 이 프로젝트는 **프론트엔드 전용** 관리자 대시보드입니다.
> - DB 스키마(Prisma)는 해당 없음 (외부 백엔드 사용)
> - API 라우트는 인증 프록시 4개만 존재 (실제 API 호출은 서비스 레이어에서 직접)
> - 블록체인(Polygon) 관리 기능 포함

---

## 진행 현황

### Phase 1: 기획
| ID | 단계 | 상태 | 산출물 | 비고 |
|----|------|------|--------|------|
| 1a | 자료 수집/분석 | [x] | ADMIN_API_SPEC.md (42KB), FEATURE_PLANNING.md (26KB), API_CHECKLIST.md (15KB), ARCHITECTURE.md (8KB) | 2026-02-24 완료 |
| 1b | SRS 생성 | [x] | docs/srs/ (7개 파일, 59KB) | 01~07 전체 생성 완료 (2026-02-24) |
| 1c | 기능명세서 | [x] | docs/functional-spec/ (10개 파일, 67KB) | 00~09 표준 형식 생성, API 67개 엔드포인트 반영 (2026-02-24) |
| 1d | 화면설계 md | [x] | docs/screen-design/ (13개 파일, 80KB) | 00-개요 + 10~19 화면별 설계 완료 (2026-02-24) |

### Phase 2: 디자인
| ID | 단계 | 상태 | 산출물 | 비고 |
|----|------|------|--------|------|
| 2a | 디자인 토큰 | [x] | docs/screen-design/01-디자인-토큰.md (7.5KB) | HSL 값, 간격, 둥글기, 타이포그래피 문서화 (2026-02-24) |
| 2b | 공통 컴포넌트 스펙 | [x] | docs/screen-design/03-공통-컴포넌트.md (19.3KB) | UI 21개 + Shared 7개 + Layout 4개 + Feature 14개 Props 스펙 (2026-02-24) |
| 2c | 화면설계서 pen | [ ] | - | pen/ 폴더 없음, .pen 파일 없음 |

### Phase 3: 퍼블리싱
| ID | 단계 | 상태 | 산출물 | 비고 |
|----|------|------|--------|------|
| 3a | 프로젝트 세팅 | [x] | package.json, tailwind.config.ts, tsconfig.json, next.config.ts | 23 deps + 7 devDeps |
| 3b | DB 스키마 | [-] | - | 해당없음 (외부 백엔드 사용) |
| 3c | 공통 레이아웃 | [x] | admin-layout.tsx, header.tsx, sidebar.tsx, theme-toggle.tsx | 사이드바 토글/축소, 모바일 반응형, 브레드크럼, 한국어 UI 완료 (2026-02-24) |
| 3d | UI 컴포넌트 | [x] | src/components/ui/ (21개) | shadcn/ui 기반 완비 |
| 3e | 페이지 퍼블 | [x] | 13개 페이지 (dashboard, users, games, products, blockchain, monitoring, storage, settings, profile, login 등) | 전체 한국어화 완료 (2026-02-24) |

### Phase 4: 프론트앱
| ID | 단계 | 상태 | 산출물 | 비고 |
|----|------|------|--------|------|
| 4a | API 라우트 | [x] | /api/auth/login, logout, me, refresh (4개) | 인증 프록시 + 서비스 레이어에서 직접 API 호출 (구조상 완료) |
| 4b | 상태관리 | [x] | src/lib/hooks/ (11개 훅) | TanStack Query 기반 |
| 4c | API 연동 | [x] | src/lib/api/ (11개 서비스) | auth, user, game, product, game-product, blockchain, monitoring, storage, dashboard |
| 4d | 비즈니스 로직 | [x] | src/lib/ (services + hooks + types) | 완비 |
| 4e | 외부 연동 | [~] | blockchain.service.ts | 블록체인만, 기타 외부 연동 없음 |

### Phase 5: TC
| ID | 단계 | 상태 | 산출물 | 비고 |
|----|------|------|--------|------|
| 5a | TC 리스트 생성 | [x] | tests/tc-list/ (10개 파일, 98개 TC) | High 39 / Medium 40 / Low 19 (2026-02-24) |
| 5b | 단위 테스트 | [ ] | - | 테스트 파일 0개 |
| 5c | E2E 테스트 | [ ] | - | 미착수 |

### Phase 6: Living Spec
| ID | 단계 | 상태 | 산출물 | 비고 |
|----|------|------|--------|------|
| 6a | Spec JSON Export | [x] | spec-data/ (13개 JSON + _manifest.json) | 화면 11개 매핑 완료 (2026-02-24) |
| 6b | SpecLabel 적용 | [x] | 12개 페이지에 SpecLabel 래핑 | 개발 모드 전용, 전역 토글 지원 (2026-02-24) |
| 6c | 정합성 검증 | [x] | src/lib/utils/spec-check.ts | CLI 유틸 생성 완료 (2026-02-24) |

---

## 현재 통계

| 항목 | 수량 |
|------|------|
| 총 컴포넌트 | 49개 (UI 21 + Feature 14 + Shared 7 + Layout 4 + Page 3) |
| 총 페이지 | 13개 |
| API 라우트 | 4개 (인증 프록시) |
| API 서비스 | 11개 |
| 커스텀 훅 | 11개 |
| 타입 정의 파일 | 9개 |

---

## 알려진 문제 (API 스펙 vs 코드 갭)

> ADMIN_API_SPEC.md 대비 코드 누락 항목 (2026-02-24 분석)

### ~~필수 수정 (운영 필수)~~ — 2026-02-24 완료
1. ~~**게임 정산 API 미구현**~~ → `settleGame()` + `useSettleGame` 훅 + UI 버튼 추가 완료
2. ~~**GameType `PRIME` 누락**~~ → game.ts, create/edit-game-dialog, filter-bar에 PRIME 추가 완료
3. ~~**컨트랙트 수동 검증 미구현**~~ → `verifyContract()` + `useVerifyContract` 훅 + UI 버튼 추가 완료

### ~~타입 불일치~~ — 2026-02-24 완료
4. ~~User 재화 필드~~ → `shoppingCash/eventPoint/participationPoint` 추가 (하위호환 유지)
5. ~~상품 검색 파라미터~~ → `q` → `name` 변경 완료
6. ~~EntryStatusResult 구조~~ → 스펙 필드 (`txHash/errorCode/errorMessage`) 추가 완료
7. ~~UploadImageResponse~~ → `thumbnailUrl` 등 구체 타입으로 변경 완료
8. ~~GameStats~~ → `{ statusStats, typeStats }` 구체화 완료
9. ~~GameDto: `hasInstantPrize`~~ → optional 필드 추가 완료

### ~~UX 문제~~ — 2026-02-24 대부분 완료
10. ~~사이드바 토글/축소 기능 없음~~ → 접기/펼치기 + localStorage 상태 유지 완료
11. ~~모바일 반응형 없음~~ → Sheet 기반 모바일 사이드바 + 햄버거 메뉴 완료
12. 검색바 더미 (기능 없음) — 향후 구현
13. 알림벨 더미 (기능 없음) — 향후 구현 (백엔드 미구현)
14. ~~브레드크럼 없음~~ → page-header.tsx에 pathname 기반 자동 브레드크럼 추가 완료
15. ~~UI 전체 영문~~ → 전체 페이지/컴포넌트 한국어화 완료
16. 게임-상품 지역 설정 UI "준비 중" — 향후 구현

---

## 다음 단계 제안

### 즉시 실행 가능 (코드 수정)
1. **API 스펙 갭 수정** (settle, PRIME, verify-contract) → Phase 4c 보완
2. **UX 개선** (사이드바 토글, 반응형, 한국어화) → Phase 3c/3e 보완
3. **타입 정합성** (User, GameStats, Upload 타입 수정) → Phase 4d 보완

### 문서화 필요 (Phase 1~2 보완)
4. ADMIN_API_SPEC.md를 프로젝트 내로 이동/복사
5. docs/functional-spec/ 형식으로 기능명세서 정리
6. docs/screen-design/ 화면설계 문서 생성

### 테스트 (Phase 5)
7. TC 리스트 생성 (기능명세서 기반)
8. E2E 테스트 셋업 (Playwright)

---

## 변경 이력
- 2026-02-24: 프로젝트 스캔 완료, ORCHESTRA.md 초기 생성
- 2026-02-24: API 스펙 갭 수정 완료 (settle, PRIME, verify-contract + 타입 6건)
- 2026-02-24: UX 개선 완료 (사이드바 토글/모바일 반응형/브레드크럼/한국어 UI)
- 2026-02-24: 전체 빌드 검증 통과 (tsc 0 errors, Next.js 18/18 pages)
- 2026-02-24: Phase 1b SRS 생성 완료 (7개 파일, 59KB)
- 2026-02-24: Phase 1c 기능명세서 생성 완료 (10개 파일, 67KB)
- 2026-02-24: Phase 1d+2a+2b 화면설계+디자인 문서 생성 완료 (13개 파일, 80KB)
- 2026-02-24: Phase 5a TC 리스트 생성 완료 (10개 파일, 98개 TC)
