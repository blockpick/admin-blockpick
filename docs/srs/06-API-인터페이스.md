# 6. API 인터페이스 명세

## 6.1 Base URL 및 환경

| 환경 | Base URL |
|------|----------|
| 개발(Dev) | `https://api-dev.blockpick.net` |
| 환경변수 | `NEXT_PUBLIC_API_URL` |
| Swagger UI | `https://api-dev.blockpick.net/swagger-ui/index.html` |
| OpenAPI 문서 | `https://api-dev.blockpick.net/v3/api-docs` |

---

## 6.2 인증 헤더 규격

모든 `/admin/**` API (로그인/갱신 제외)에 필수 포함:

```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

파일 업로드 시:
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

---

## 6.3 공통 응답 형식

### 성공 응답

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "설명 메시지",
  "data": { ... }
}
```

### 에러 응답

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "에러 메시지"
}
```

### 공통 에러 코드

| HTTP 상태 | 코드 | 설명 |
|-----------|------|------|
| 400 | `BAD_REQUEST` | 잘못된 요청 파라미터 |
| 400 | `SETTLEMENT_FAILED` | 게임 정산 실패 |
| 401 | `INVALID_CREDENTIALS` | 이메일/비밀번호 불일치 |
| 401 | `INVALID_TOKEN` | 토큰 유효하지 않음 |
| 401 | `USER_NOT_FOUND` | 사용자 없음 |
| 403 | `FORBIDDEN` | 권한 없음 |
| 404 | `NOT_FOUND` | 리소스 없음 |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 |

---

## 6.4 페이지네이션 규격 (Spring Page)

### 요청 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `page` | Int | 0 | 페이지 번호 (0부터 시작) |
| `size` | Int | 20 | 페이지 크기 |
| `sortBy` | String | `createdAt` | 정렬 기준 필드 |
| `sortDirection` | String | `DESC` | 정렬 방향 (`ASC` / `DESC`) |

### 응답 구조

```json
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": { "sorted": true, "direction": "DESC", "property": "createdAt" }
  },
  "totalElements": 100,
  "totalPages": 5,
  "first": true,
  "last": false,
  "number": 0,
  "size": 20
}
```

> **주의**: `GET /admin/users`는 현재 페이지네이션 미지원, 전체 목록을 한 번에 반환한다.

---

## 6.5 에러 코드 목록

| 코드 | HTTP | 발생 API | 설명 |
|------|------|---------|------|
| `INVALID_CREDENTIALS` | 401 | POST /admin/auth/login | 이메일/비밀번호 불일치 |
| `FORBIDDEN` | 403 | POST /admin/auth/login | USER 역할 로그인 시도 |
| `INVALID_TOKEN` | 401 | POST /admin/auth/verify, POST /admin/auth/refresh | 토큰 만료 또는 유효하지 않음 |
| `USER_NOT_FOUND` | 401 | POST /admin/auth/verify | 토큰 사용자 없음 |
| `SETTLEMENT_FAILED` | 400 | POST /admin/games/{id}/settle | 정산 실패 |
| `INTERNAL_ERROR` | 500 | 전체 | 서버 내부 오류 |

---

## 6.6 REST API 엔드포인트 요약 테이블

### 인증 (Authentication)

| 메서드 | 경로 | 설명 | 인증 필요 |
|--------|------|------|-----------|
| POST | `/admin/auth/login` | 관리자 로그인 | X |
| POST | `/admin/auth/refresh` | Access Token 갱신 | X |
| POST | `/admin/auth/verify` | 토큰 검증 + 관리자 정보 | Bearer |
| POST | `/admin/auth/logout` | 로그아웃 | Bearer |
| GET | `/admin/auth/me` | 현재 사용자 정보 | Bearer |

### 유저 관리 (Users)

| 메서드 | 경로 | 설명 | 인증 필요 |
|--------|------|------|-----------|
| GET | `/admin/users` | 전체 유저 목록 (페이지네이션 미지원) | ADMIN |
| GET | `/admin/users/{id}` | 유저 상세 조회 | ADMIN |
| POST | `/admin/users` | 유저 생성 | ADMIN |
| PUT | `/admin/users/{id}` | 유저 정보 수정 | ADMIN |
| DELETE | `/admin/users/{id}` | 유저 삭제 | ADMIN |
| PATCH | `/admin/users/role` | 유저 역할 변경 | ADMIN |
| GET | `/admin/users/stats` | 유저 통계 | ADMIN |

### 게임 관리 (Games)

| 메서드 | 경로 | 설명 | 인증 필요 |
|--------|------|------|-----------|
| GET | `/admin/games` | 게임 목록 (Spring Page) | ADMIN |
| GET | `/admin/games/{id}` | 게임 상세 조회 | ADMIN |
| PUT | `/admin/games` | 게임 수정 (body에 id 포함) | ADMIN |
| DELETE | `/admin/games/{id}` | 게임 삭제 | ADMIN |
| PUT | `/admin/games/{id}/force-end` | 게임 강제 종료 | ADMIN |
| POST | `/admin/games/{id}/settle` | 게임 정산 | ADMIN |
| GET | `/admin/games/type/{type}` | 타입별 게임 조회 | ADMIN |
| GET | `/admin/games/status/{status}` | 상태별 게임 조회 | ADMIN |
| GET | `/admin/games/search` | 제목 검색 (`?title=`) | ADMIN |
| GET | `/admin/games/date-range` | 날짜 범위 조회 | ADMIN |
| GET | `/admin/games/recommended` | 추천 게임 조회 | ADMIN |
| GET | `/admin/games/stats` | 게임 통계 | ADMIN |
| GET | `/admin/games/{id}/leaderboard` | 게임 리더보드 | ADMIN |

### 상품 관리 (Products)

| 메서드 | 경로 | 설명 | 인증 필요 |
|--------|------|------|-----------|
| GET | `/admin/products` | 상품 목록 (Spring Page) | ADMIN |
| GET | `/admin/products/{id}` | 상품 상세 조회 | ADMIN |
| POST | `/admin/products` | 상품 생성 | ADMIN |
| PUT | `/admin/products` | 상품 수정 (body에 id 포함) | ADMIN |
| DELETE | `/admin/products/{id}` | 상품 삭제 | ADMIN |
| GET | `/admin/products/search` | 상품명 검색 (`?name=`) | ADMIN |
| GET | `/admin/products/brand/{brand}` | 브랜드별 조회 | ADMIN |
| GET | `/admin/products/sku/{sku}` | SKU로 조회 | ADMIN |
| GET | `/admin/products/categories` | 카테고리 목록 | ADMIN |
| GET | `/admin/products/stats` | 상품 통계 | ADMIN |

### 게임-상품 통합 관리 (Game-Product Management)

| 메서드 | 경로 | 설명 | 인증 필요 |
|--------|------|------|-----------|
| GET | `/admin/game-product-management/games/{gameId}/products` | 게임의 상품 슬롯 목록 | ADMIN |
| GET | `/admin/game-product-management/games/{gameId}/products/ordered` | 순서대로 상품 목록 | ADMIN |
| GET | `/admin/game-product-management/games/{gameId}/products/all-details` | 전체 상세 조회 | ADMIN |
| GET | `/admin/game-product-management/games/{gameId}/products/count` | 상품 개수 | ADMIN |
| GET | `/admin/game-product-management/games/{gameId}/grand-prizes` | 그랜드 프라이즈 조회 | ADMIN |
| PUT | `/admin/game-product-management/games/{gameId}/grand-prizes` | 그랜드 프라이즈 설정 | ADMIN |
| GET | `/admin/game-product-management/game-products/{id}` | 슬롯 상세 조회 | ADMIN |
| POST | `/admin/game-product-management/game-products` | 슬롯 생성 | ADMIN |
| PUT | `/admin/game-product-management/game-products` | 슬롯 수정 | ADMIN |
| DELETE | `/admin/game-product-management/game-products/{id}` | 슬롯 삭제 | ADMIN |
| DELETE | `/admin/game-product-management/game-products/{id}/complete` | 슬롯 + 지역 설정 완전 삭제 | ADMIN |
| POST | `/admin/game-product-management/games/{gameId}/products/{productId}/link` | 기존 상품 연결 | ADMIN |
| POST | `/admin/game-product-management/games/{gameId}/products/complete` | 상품 생성 + 연결 통합 | ADMIN |
| PUT | `/admin/game-product-management/games/{gameId}/products/reorder` | 순서 재정렬 | ADMIN |
| POST | `/admin/game-product-management/game-products/{id}/regions` | 지역 설정 추가 | ADMIN |
| PUT | `/admin/game-product-management/game-products/{id}/regions/{regionId}` | 지역 설정 수정 | ADMIN |
| DELETE | `/admin/game-product-management/game-products/{id}/regions/{regionId}` | 지역 설정 삭제 | ADMIN |
| GET | `/admin/game-product-management/games/{gameId}/products/stats` | 게임 상품 통계 | ADMIN |

### 블록체인 관리 (Blockchain)

| 메서드 | 경로 | 설명 | 인증 필요 |
|--------|------|------|-----------|
| POST | `/admin/blockchain/games` | 게임 생성 + 컨트랙트 배포 | ADMIN |
| POST | `/admin/blockchain/games/{gameId}/contract-deployed` | 배포 완료 처리 | ADMIN |
| POST | `/admin/blockchain/games/{gameId}/contract-deployment-failed` | 배포 실패 처리 | ADMIN |
| POST | `/admin/blockchain/games/{gameId}/verify-contract` | 컨트랙트 수동 검증 | ADMIN |
| GET | `/admin/blockchain/entries/{entryId}/status` | 엔트리 상태 조회 | ADMIN |
| GET | `/admin/blockchain/transactions/{txHash}` | 트랜잭션 조회 | ADMIN |
| GET | `/admin/blockchain/games/{gameId}/contract` | 컨트랙트 정보 조회 | ADMIN |

### 시스템 모니터링 (Monitoring)

| 메서드 | 경로 | 설명 | 인증 필요 |
|--------|------|------|-----------|
| GET | `/admin/monitoring/health` | 시스템 헬스 상태 | ADMIN |
| GET | `/admin/monitoring/events` | 이벤트 발행 상태 | ADMIN |
| GET | `/admin/monitoring/transactions` | 트랜잭션 처리 상태 | ADMIN |
| POST | `/admin/monitoring/events/{eventId}/retry` | 이벤트 재발행 | ADMIN |
| GET | `/admin/monitoring/logs` | 시스템 로그 | ADMIN |
| GET | `/admin/monitoring/metrics` | 성능 메트릭 | ADMIN |

### 파일 업로드 (Storage)

| 메서드 | 경로 | 설명 | 인증 필요 |
|--------|------|------|-----------|
| POST | `/admin/storage/upload/image` | 단일 이미지 업로드 | ADMIN |
| POST | `/admin/storage/upload/images` | 다중 이미지 업로드 | ADMIN |
| DELETE | `/admin/storage/files/{fileId}` | 파일 삭제 | ADMIN |
| GET | `/admin/storage/files` | 파일 목록 | ADMIN |
| GET | `/admin/storage/files/{fileId}` | 파일 정보 | ADMIN |

### 대시보드 (Dashboard)

| 메서드 | 경로 | 설명 | 인증 필요 |
|--------|------|------|-----------|
| GET | `/admin/dashboard/stats` | 종합 통계 | ADMIN |
| GET | `/admin/dashboard/charts/{type}` | 차트 데이터 | ADMIN |
| GET | `/admin/dashboard/activities` | 최근 활동 내역 | ADMIN |

---

*작성일: 2026-02-24*
*버전: 1.0*
