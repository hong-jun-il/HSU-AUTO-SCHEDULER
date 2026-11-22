# 📅 HSU-AUTO-SCHEDULER

## 사이트 URL(서버 중단): https://hsu-auto-scheduler.vercel.app/
1차 배포: 2025-08-18 ~ 2025-08-27

2차 배포: 2026-02-01 ~ 2026-02-20

사용자의 제약 조건을 기반으로,
최적의 대학 시간표 조합을 추천하는 웹 서비스입니다.

<img width="1594" height="766" alt="image" src="https://github.com/user-attachments/assets/52b62b94-ba93-4768-8082-f32f840afeb3" />
<img width="1600" height="730" alt="image" src="https://github.com/user-attachments/assets/012bd2b3-1f8c-491a-bb39-6d0114932236" />

## 🛠 Tech Stack
 ### Front-End

   - Next.js (App Router), TypeScript

   - TanStack Query – 서버 상태 관리

   - Zustand (Persist) – 클라이언트 전역 상태 및 세션 유지

   - React-hook-form – 복잡한 조건 입력 폼 관리

   - Tailwind CSS, Framer Motion

### Back-End & Data

- NestJS – 메인 API 서버

- FastAPI – 시간표 추천 엔진

- Google OR-Tools (CP-SAT Solver) – 최적화 문제 해결

- MySQL (TypeORM)

### Infra

- Docker

- AWS EC2

## 모바일 환경

<img width="297" height="524" alt="image" src="https://github.com/user-attachments/assets/889832fa-4d6c-42c5-bdf1-9aa6f30567e4" />
<img width="293" height="533" alt="image" src="https://github.com/user-attachments/assets/fd730cf3-8695-4035-ad93-ea60ae38d5ed" />



## 📘 Related Posts

Velog: https://velog.io/@grt1022rt/hsu-auto-scheduler-prologue

## 📁 Project Structure

| 폴더 | 설명 |
| --- | --- |
| `hsu-auto-scheduler-fe` | Next.js 프론트엔드 |
| `hsu-auto-scheduler-be` | NestJS 메인 API 서버 |
| `ortools-scheduler` | FastAPI + OR-Tools 시간표 추천 엔진 |
| `hsu-auto-scheduler-scraper` | 종정시 시간표 수집·변환·전송 (`npm run scrape -- 2026-2`) ([사용법](hsu-auto-scheduler-scraper/README.md)) |
| `sql` | DB 초기화 스크립트(`init.sql`), DDL, 마이그레이션 |
| `nginx` | 리버스 프록시 설정 |

## 🤝 Commit Convention

커밋 메시지는 반드시 아래 접두어 중 하나로 시작합니다.

```
<접두어>: <변경 내용 요약>
```

| 접두어 | 용도 |
| --- | --- |
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `refactor` | 동작 변경 없는 코드 구조 개선 |
| `chore` | 설정, 빌드, 의존성, 파일 이동 등 |
| `docs` | 문서 수정 |
| `style` | 포맷팅 등 로직과 무관한 변경 |
| `test` | 테스트 추가·수정 |

예: `feat: 이수구분 복전선 추가`, `fix: nginx ssl 인증서 경로 수정`

브랜치는 `main`에서 `<접두어>/<작업명>` 형태로 만들어 작업합니다. (예: `feat/merge-scraper`)
