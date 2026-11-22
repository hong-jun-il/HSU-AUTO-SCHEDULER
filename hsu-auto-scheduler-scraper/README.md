# hsu-auto-scheduler-scraper

한성대 종합정보시스템(종정시) 시간표를 받아 백엔드 DB 형식으로 변환·전송합니다.

```bash
npm run scrape -- 2026-2            # Chrome으로 받아서 바로 전송
npm run scrape -- 2026-2 --dry-run  # 받아서 변환 결과만 확인 (전송 안 함)
npm run send -- 2026-2              # 이미 받은 data/hsuinfo-2026-2.json 을 다시 전송
```

학기는 `년도-학기`로 씁니다. 1·2학기는 `-1`·`-2`, 여름학기는 `-3`, 겨울학기는 `-4`입니다.

## 처음 한 번만 할 설정

1. Chrome에 [Tampermonkey](https://www.tampermonkey.net/) 확장 프로그램을 설치합니다.
2. Chrome 주소창에 `chrome://extensions`를 열고 오른쪽 위 **개발자 모드**를 켭니다. (Tampermonkey 스크립트 실행에 필요)
3. Tampermonkey 대시보드 → **새 스크립트**에서 기본 내용을 모두 지우고 [`console/hsuinfo-export.user.js`](console/hsuinfo-export.user.js) 내용을 붙여넣어 저장합니다.
   - 터미널에서 `pbcopy < console/hsuinfo-export.user.js`로 복사하면 빠짐없이 복사됩니다.
4. Chrome 설정 → 다운로드에서 **다운로드 전에 각 파일의 저장 위치 확인**을 끕니다.
5. 이 폴더에서 `npm ci`, 그리고 `.env`에 `BASE_URL=<백엔드 주소>`와 `ADMIN_TOKEN=<백엔드의 ADMIN_TOKEN 값>`을 넣습니다.
   - 운영 서버의 저장 API는 nginx에서 막혀 있어서 SSH 터널(`ssh -N -L 5000:localhost:5000 <서버>`)을 열고 `BASE_URL=http://localhost:5000`으로 보냅니다.

## 동작

1. `npm run scrape -- 2026-2`가 Chrome으로 종정시 시간표 페이지를 `#export=2026-2`를 붙여 엽니다.
2. Tampermonkey 스크립트가 그 학기의 전공 목록과 강의를 받습니다. 진행 상황은 페이지 오른쪽 아래에 보입니다. (3~5분, 요청 사이 1.5~2.5초 대기)
3. `hsuinfo-2026-2.json`이 다운로드 폴더에 저장되면 명령이 2~4초 안에 `data/`로 옮깁니다.
4. 강의를 DB 형식으로 변환하고, 문제가 없으면 학기 하나를 요청 하나(`PUT /admin/semesters/<학기>`)로 백엔드에 보냅니다.
   - 변환 실패가 하나라도 있으면 아무것도 보내지 않습니다.
   - 요청한 학기와 파일 안의 학기가 다르면 보내지 않습니다.
   - 백엔드는 그 학기를 한 트랜잭션으로 통째로 교체합니다. 실패하면 아무것도 바뀌지 않고, 같은 파일을 다시 보내도 결과가 같습니다.
   - 이번 수집에 없는 분반(폐강)은 지워지고, 이미 있던 분반은 id가 유지됩니다.
   - 같은 분반이 전공마다 다르게 오면 백엔드가 충돌 목록과 함께 거절합니다.

환경변수: `BASE_URL`(필수), `ADMIN_TOKEN`(필수, 백엔드와 같은 값), `DOWNLOAD_DIR`(기본 `~/Downloads`), `SCRAPE_TIMEOUT_MIN`(기본 15분)

## 수동으로 받기

- Tampermonkey가 켜진 상태로 종정시 시간표 페이지를 열면 오른쪽 아래에 **선택한 학기 내보내기** 버튼이 생깁니다. 페이지 드롭다운에서 학기를 고르고 누르면 됩니다.
- Tampermonkey 없이 `console/hsuinfo-export.user.js` 내용을 개발자도구 콘솔에 붙여넣어도 같은 버튼이 생깁니다.
- 이렇게 받은 파일은 다운로드 폴더에 남으니 경로를 지정해 보냅니다: `npm run send -- ~/Downloads/hsuinfo-2026-2.json`

## 폴더 구조

| 경로 | 역할 |
| --- | --- |
| `console/hsuinfo-export.user.js` | Tampermonkey 스크립트. 종정시에서 학기 데이터를 받아 JSON으로 저장 |
| `scripts/scrape.ts` | `npm run scrape`: Chrome 열기 → 다운로드 대기 → `data/`로 이동 → 전송 |
| `scripts/send.ts` | `npm run send`: 변환 후 백엔드 전송 |
| `utils/parseClassroom.ts` | 강의실·교시 문자열 → 요일/시작/끝/장소. 교시 → 시각 규칙은 파일 주석 참고 |
| `utils/buildCourse.ts` | 종정시 강의 한 줄 → 백엔드 강의 형식 |
| `api/putSemester.ts` | 백엔드 학기 저장 API(`PUT /admin/semesters/<학기>`) 호출 |
| `constants/MAP_OBJ.ts` | 한글 값(전필, BL, 주 …) → enum 매핑 |
| `type/` | 내보내기 파일 형식, 백엔드 전송 형식, enum |

## 참고

- 종정시 데이터 요청은 자동화 도구(curl, Node, Playwright)에서 차단되므로 평소 쓰는 Chrome에서 받습니다.
- 에브리타임·Playwright 기반의 예전 수집 코드는 제거했습니다. 필요하면 git 기록에서 찾을 수 있습니다.
