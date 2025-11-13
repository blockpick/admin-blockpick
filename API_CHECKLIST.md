# API 구현 체크리스트

Swagger 문서: https://api-dev.blockpick.net/swagger-ui/index.html#/

이 문서는 현재 코드베이스에 구현된 API와 Swagger 문서를 비교하여 누락된 API를 확인하기 위한 체크리스트입니다.

## 📋 체크리스트 사용법

1. Swagger 문서에서 각 엔드포인트 확인
2. 아래 체크리스트에서 해당 API 찾기
3. 구현 여부 확인 후 체크박스 업데이트
4. 누락된 API는 `❌ 미구현` 표시
5. 구현된 API는 `✅ 구현됨` 표시

---

## 🔐 1. Authentication API (`/admin/auth/*`)

**파일**: `src/lib/api/auth.service.ts`

| Method | Endpoint | 설명 | 상태 | 비고 |
|--------|----------|------|------|------|
| POST | `/admin/auth/login` | 관리자 로그인 | ✅ 구현됨 | `authService.login()` |
| POST | `/admin/auth/refresh` | 토큰 갱신 | ✅ 구현됨 | `authService.refreshToken()` |
| POST | `/admin/auth/verify` | 토큰 검증 | ✅ 구현됨 | `authService.verifyToken()` |
| POST | `/admin/auth/logout` | 로그아웃 | ✅ 구현됨 | `authService.logoutServer()` (서버 로그아웃) |
| GET | `/admin/auth/me` | 현재 사용자 정보 | ✅ 구현됨 | `authService.getCurrentUser()` |

**체크 항목**:
- [x] Swagger에서 추가 엔드포인트 확인
- [x] 로그아웃 API 엔드포인트 구현 완료

---

## 👥 2. User Management API (`/admin/users/*`)

**파일**: `src/lib/api/user.service.ts`

| Method | Endpoint | 설명 | 상태 | 비고 |
|--------|----------|------|------|------|
| GET | `/admin/users` | 사용자 목록 조회 | ✅ 구현됨 | `userService.getUsers()` |
| GET | `/admin/users/{id}` | 사용자 상세 조회 | ✅ 구현됨 | `userService.getUserById()` |
| POST | `/admin/users` | 사용자 생성 | ✅ 구현됨 | `userService.createUser()` |
| PUT | `/admin/users/{id}` | 사용자 수정 | ✅ 구현됨 | `userService.updateUser()` |
| DELETE | `/admin/users/{id}` | 사용자 삭제 | ✅ 구현됨 | `userService.deleteUser()` |
| PATCH | `/admin/users/role` | 사용자 역할 변경 | ✅ 구현됨 | `userService.updateUserRole()` |
| GET | `/admin/users/stats` | 사용자 통계 | ✅ 구현됨 | `userService.getUserStats()` |

**체크 항목**:
- [x] Swagger에서 추가 엔드포인트 확인
- [x] 사용자 통계 API 구현 완료
- [x] 사용자 검색 API 확인 (필터 파라미터로 구현됨)
- [x] 사용자 필터링 옵션 확인 (UserFilterParams로 구현됨)

---

## 🎮 3. Game Management API (`/admin/games/*`)

**파일**: `src/lib/api/game.service.ts`

| Method | Endpoint | 설명 | 상태 | 비고 |
|--------|----------|------|------|------|
| GET | `/admin/games` | 게임 목록 조회 | ✅ 구현됨 | `gameService.getGames()` |
| GET | `/admin/games/{id}` | 게임 상세 조회 | ✅ 구현됨 | `gameService.getGameById()` |
| PUT | `/admin/games` | 게임 수정 | ✅ 구현됨 | `gameService.updateGame()` |
| PUT | `/admin/games/{id}/force-end` | 게임 강제 종료 | ✅ 구현됨 | `gameService.forceEndGame()` |
| GET | `/admin/games/type/{type}` | 타입별 게임 조회 | ✅ 구현됨 | `gameService.getGamesByType()` |
| GET | `/admin/games/status/{status}` | 상태별 게임 조회 | ✅ 구현됨 | `gameService.getGamesByStatus()` |
| GET | `/admin/games/stats` | 게임 통계 | ✅ 구현됨 | `gameService.getGameStats()` |
| GET | `/admin/games/search` | 게임 검색 | ✅ 구현됨 | `gameService.searchGames()` |
| GET | `/admin/games/recommended` | 추천 게임 조회 | ✅ 구현됨 | `gameService.getRecommendedGames()` |
| GET | `/admin/games/date-range` | 날짜 범위별 게임 조회 | ✅ 구현됨 | `gameService.getGamesByDateRange()` |
| DELETE | `/admin/games/{id}` | 게임 삭제 | ✅ 구현됨 | `gameService.deleteGame()` |
| GET | `/admin/games/{id}/leaderboard` | 게임 리더보드 | ✅ 구현됨 | `gameService.getGameLeaderboard()` |

**체크 항목**:
- [x] Swagger에서 게임 생성 API 확인 (블록체인 서비스 사용)
- [x] 게임 삭제 API 구현 완료
- [x] 게임 리더보드 API 구현 완료
- [ ] 게임 엔트리 관련 API 확인 (블록체인 서비스에 일부 포함)

---

## 🛍️ 4. Product Management API (`/admin/products/*`)

**파일**: `src/lib/api/product.service.ts`

| Method | Endpoint | 설명 | 상태 | 비고 |
|--------|----------|------|------|------|
| GET | `/admin/products` | 상품 목록 조회 | ✅ 구현됨 | `productService.getProducts()` |
| GET | `/admin/products/{id}` | 상품 상세 조회 | ✅ 구현됨 | `productService.getProductById()` |
| GET | `/admin/products/sku/{sku}` | SKU로 상품 조회 | ✅ 구현됨 | `productService.getProductBySku()` |
| GET | `/admin/products/search` | 상품 검색 | ✅ 구현됨 | `productService.searchProducts()` |
| GET | `/admin/products/brand/{brand}` | 브랜드별 상품 조회 | ✅ 구현됨 | `productService.getProductsByBrand()` |
| POST | `/admin/products` | 상품 생성 | ✅ 구현됨 | `productService.createProduct()` |
| PUT | `/admin/products` | 상품 수정 | ✅ 구현됨 | `productService.updateProduct()` |
| DELETE | `/admin/products/{id}` | 상품 삭제 | ✅ 구현됨 | `productService.deleteProduct()` |
| GET | `/admin/products/categories` | 상품 카테고리 목록 | ✅ 구현됨 | `productService.getCategories()` |
| GET | `/admin/products/stats` | 상품 통계 | ✅ 구현됨 | `productService.getProductStats()` |

**체크 항목**:
- [x] Swagger에서 추가 엔드포인트 확인
- [x] 상품 카테고리 관련 API 구현 완료
- [x] 상품 이미지 업로드 API 확인 (Storage 서비스 사용)
- [x] 상품 통계 API 구현 완료

---

## 🎯 5. Game-Product Management API (`/admin/game-product-management/*`)

**파일**: `src/lib/api/game-product.service.ts`

| Method | Endpoint | 설명 | 상태 | 비고 |
|--------|----------|------|------|------|
| GET | `/admin/game-product-management/games/{gameId}/products` | 게임의 상품 목록 | ✅ 구현됨 | `gameProductService.getGameProducts()` |
| GET | `/admin/game-product-management/games/{gameId}/products/ordered` | 순서대로 정렬된 상품 목록 | ✅ 구현됨 | `gameProductService.getGameProductsOrdered()` |
| GET | `/admin/game-product-management/games/{gameId}/products/all-details` | 전체 상세 정보 포함 상품 목록 | ✅ 구현됨 | `gameProductService.getCompleteGameProducts()` |
| GET | `/admin/game-product-management/games/{gameId}/products/count` | 상품 개수 조회 | ✅ 구현됨 | `gameProductService.getGameProductCount()` |
| GET | `/admin/game-product-management/games/{gameId}/grand-prizes` | 그랜드 프라이즈 상품 조회 | ✅ 구현됨 | `gameProductService.getGrandPrizeProducts()` |
| PUT | `/admin/game-product-management/games/{gameId}/grand-prizes` | 그랜드 프라이즈 설정 | ✅ 구현됨 | `gameProductService.setGrandPrizeProducts()` |
| GET | `/admin/game-product-management/game-products/{id}` | 게임 상품 상세 조회 | ✅ 구현됨 | `gameProductService.getGameProduct()` |
| POST | `/admin/game-product-management/game-products` | 게임 상품 슬롯 생성 | ✅ 구현됨 | `gameProductService.createGameProduct()` |
| PUT | `/admin/game-product-management/game-products` | 게임 상품 슬롯 수정 | ✅ 구현됨 | `gameProductService.updateGameProduct()` |
| DELETE | `/admin/game-product-management/game-products/{id}` | 게임 상품 슬롯 삭제 | ✅ 구현됨 | `gameProductService.deleteGameProduct()` |
| DELETE | `/admin/game-product-management/game-products/{gameProductId}/complete` | 게임에서 상품 완전 제거 | ✅ 구현됨 | `gameProductService.removeProductFromGame()` |
| POST | `/admin/game-product-management/games/{gameId}/products/{productId}/link` | 기존 상품을 게임에 연결 | ✅ 구현됨 | `gameProductService.linkExistingProductToGame()` |
| POST | `/admin/game-product-management/games/{gameId}/products/complete` | 상품 생성 및 게임 연결 통합 | ✅ 구현됨 | `gameProductService.addProductToGame()` |
| PUT | `/admin/game-product-management/games/{gameId}/products/reorder` | 게임 상품 순서 변경 | ✅ 구현됨 | `gameProductService.reorderGameProducts()` |
| POST | `/admin/game-product-management/game-products/{gameProductId}/regions` | 지역 설정 추가 | ✅ 구현됨 | `gameProductService.addRegionSettings()` |
| PUT | `/admin/game-product-management/game-products/{gameProductId}/regions/{regionId}` | 지역 설정 수정 | ✅ 구현됨 | `gameProductService.updateRegionSettings()` |
| DELETE | `/admin/game-product-management/game-products/{gameProductId}/regions/{regionId}` | 지역 설정 삭제 | ✅ 구현됨 | `gameProductService.deleteRegionSettings()` |
| GET | `/admin/game-product-management/games/{gameId}/products/stats` | 게임 상품 통계 | ✅ 구현됨 | `gameProductService.getGameProductStats()` |

**체크 항목**:
- [x] Swagger에서 지역 설정 관련 추가 API 확인
- [x] 지역 설정 수정/삭제 API 구현 완료
- [x] 게임 상품 통계 API 구현 완료

---

## ⛓️ 6. Blockchain API (`/admin/blockchain/*`)

**파일**: `src/lib/api/blockchain.service.ts`

| Method | Endpoint | 설명 | 상태 | 비고 |
|--------|----------|------|------|------|
| POST | `/admin/blockchain/games` | 블록체인 게임 생성 | ✅ 구현됨 | `blockchainService.createGameWithBlockchain()` |
| POST | `/admin/blockchain/games/{gameId}/contract-deployment-failed` | 컨트랙트 배포 실패 처리 | ✅ 구현됨 | `blockchainService.handleContractDeploymentFailed()` |
| POST | `/admin/blockchain/games/{gameId}/contract-deployed` | 컨트랙트 배포 성공 처리 | ✅ 구현됨 | `blockchainService.handleContractDeployed()` |
| GET | `/admin/blockchain/entries/{entryId}/status` | 엔트리 상태 조회 | ✅ 구현됨 | `blockchainService.getEntryStatus()` |
| GET | `/admin/blockchain/transactions/{txHash}` | 트랜잭션 조회 | ✅ 구현됨 | `blockchainService.getTransaction()` |
| GET | `/admin/blockchain/games/{gameId}/contract` | 컨트랙트 정보 조회 | ✅ 구현됨 | `blockchainService.getContractInfo()` |

**체크 항목**:
- [x] Swagger에서 추가 블록체인 관련 API 확인
- [x] 트랜잭션 조회 API 구현 완료
- [x] 컨트랙트 정보 조회 API 구현 완료
- [ ] 블록체인 이벤트 관련 API 확인

---

## 📦 7. Storage API (`/admin/storage/upload/*`)

**파일**: `src/lib/api/storage.service.ts`

| Method | Endpoint | 설명 | 상태 | 비고 |
|--------|----------|------|------|------|
| POST | `/admin/storage/upload/image` | 단일 이미지 업로드 | ✅ 구현됨 | `storageService.uploadImage()` |
| POST | `/admin/storage/upload/images` | 다중 이미지 업로드 | ✅ 구현됨 | `storageService.uploadImages()` |
| DELETE | `/admin/storage/files/{fileId}` | 파일 삭제 | ✅ 구현됨 | `storageService.deleteFile()` |
| GET | `/admin/storage/files` | 파일 목록 조회 | ✅ 구현됨 | `storageService.getFiles()` |
| GET | `/admin/storage/files/{fileId}` | 파일 정보 조회 | ✅ 구현됨 | `storageService.getFileInfo()` |

**체크 항목**:
- [x] Swagger에서 파일 삭제 API 확인
- [x] 파일 목록 조회 API 구현 완료
- [x] 파일 정보 조회 API 구현 완료
- [ ] 다른 파일 타입 업로드 API 확인 (비디오, 문서 등)

---

## 📊 8. Monitoring API (`/admin/monitoring/*`)

**파일**: `src/lib/api/monitoring.service.ts`

| Method | Endpoint | 설명 | 상태 | 비고 |
|--------|----------|------|------|------|
| GET | `/admin/monitoring/health` | 시스템 헬스 체크 | ✅ 구현됨 | `monitoringService.getHealthStatus()` |
| GET | `/admin/monitoring/transactions` | 트랜잭션 상태 조회 | ✅ 구현됨 | `monitoringService.getTransactionStatus()` |
| GET | `/admin/monitoring/events` | 이벤트 상태 조회 | ✅ 구현됨 | `monitoringService.getEventStatus()` |
| POST | `/admin/monitoring/events/{eventId}/retry` | 실패한 이벤트 재시도 | ✅ 구현됨 | `monitoringService.retryEvent()` |
| GET | `/admin/monitoring/logs` | 시스템 로그 조회 | ✅ 구현됨 | `monitoringService.getLogs()` |
| GET | `/admin/monitoring/metrics` | 성능 메트릭 조회 | ✅ 구현됨 | `monitoringService.getMetrics()` |

**체크 항목**:
- [x] Swagger에서 추가 모니터링 API 확인
- [x] 로그 조회 API 구현 완료
- [x] 성능 메트릭 API 구현 완료
- [ ] 알림 설정 API 확인

---

## 📈 9. Dashboard API

**파일**: `src/lib/api/dashboard.ts`

| Method | Endpoint | 설명 | 상태 | 비고 |
|--------|----------|------|------|------|
| GET | `/admin/dashboard/stats` | 대시보드 통계 | ✅ 구현됨 | `dashboardService.getStats()` |
| GET | `/admin/dashboard/charts/{type}` | 차트 데이터 조회 | ✅ 구현됨 | `dashboardService.getChartData()` |
| GET | `/admin/dashboard/activities` | 최근 활동 조회 | ✅ 구현됨 | `dashboardService.getRecentActivities()` |

**체크 항목**:
- [x] Swagger에서 대시보드 관련 API 확인
- [x] 통계 데이터 API 구현 완료
- [x] 차트 데이터 API 구현 완료

---

## 🔍 누락된 API 확인 절차

1. **Swagger 문서 열기**: https://api-dev.blockpick.net/swagger-ui/index.html#/
2. **각 섹션별로 확인**:
   - Authentication
   - User Management
   - Game Management
   - Product Management
   - Game-Product Management
   - Blockchain
   - Storage
   - Monitoring
   - Dashboard (또는 기타)
3. **각 엔드포인트 확인**:
   - Method (GET, POST, PUT, DELETE, PATCH)
   - Endpoint 경로
   - Request/Response 스키마
4. **위 체크리스트와 비교**:
   - 구현된 API: ✅ 표시
   - 미구현 API: ❌ 표시 및 구현 계획 수립
5. **추가 발견된 API**:
   - 새로운 섹션 추가
   - 또는 기존 섹션에 추가

---

## 📝 구현 우선순위

### 높은 우선순위
- [ ] 게임 생성 API (블록체인 통합) - ✅ 이미 구현됨
- [ ] 사용자 관리 필수 기능
- [ ] 상품 관리 필수 기능

### 중간 우선순위
- [ ] 게임-상품 연동 기능
- [ ] 블록체인 관련 기능
- [ ] 파일 업로드 기능

### 낮은 우선순위
- [ ] 모니터링 기능
- [ ] 통계 및 대시보드
- [ ] 기타 유틸리티 기능

---

## 🐛 알려진 이슈

1. **game-product.service.ts 파싱 에러** (188번 줄)
   - 현재 수정됨: `Promise<GameProductRegionDto[]>` 사용
   - 이전: `Promise<GameProductDto['regions']>` (타입 인덱싱 문제)

2. **게임 생성 API**
   - 직접 POST `/admin/games` 엔드포인트 없음
   - 블록체인 서비스를 통한 생성만 가능: `POST /admin/blockchain/games`

---

## 📚 참고 자료

- Swagger UI: https://api-dev.blockpick.net/swagger-ui/index.html#/
- API Base URL: `https://api-dev.blockpick.net`
- 프로젝트 API 서비스: `src/lib/api/`

---

**마지막 업데이트**: 2024년 (현재 날짜로 업데이트 필요)
**체크리스트 작성자**: 개발팀
**다음 리뷰 예정일**: Swagger 문서 업데이트 시

