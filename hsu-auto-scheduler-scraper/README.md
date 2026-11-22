# hsu-auto-scheduler-scraper

한성대 종합정보시스템(종정시) 시간표를 받아 백엔드 DB 형식으로 변환·전송합니다.

```bash
npm run scrape -- 2026-2            # Chrome으로 받아서 바로 전송
npm run scrape -- 2026-2 --dry-run  # 받아서 변환 결과만 확인 (전송 안 함)
```

학기는 `년도-학기`로 씁니다. 1·2학기는 `-1`·`-2`, 여름학기는 `-3`, 겨울학기는 `-4`입니다.

## 처음 한 번만 할 설정

1. Chrome에 [Tampermonkey](https://www.tampermonkey.net/) 확장 프로그램을 설치합니다.
2. Chrome 주소창에 `chrome://extensions`를 열고 오른쪽 위 **개발자 모드**를 켭니다. (Tampermonkey 스크립트 실행에 필요)
3. Tampermonkey 대시보드 → **새 스크립트**에 [`console/hsuinfo-export.user.js`](console/hsuinfo-export.user.js) 내용을 붙여넣고 저장합니다.
4. Chrome 설정 → 다운로드에서 **다운로드 전에 각 파일의 저장 위치 확인**을 끕니다.
5. 이 폴더에서 `npm ci`, 그리고 `.env`에 `BASE_URL=<백엔드 주소>`를 넣습니다.

## 동작

1. `npm run scrape -- 2026-2`가 Chrome으로 종정시 시간표 페이지를 `#export=2026-2`를 붙여 엽니다.
2. Tampermonkey 스크립트가 그 학기의 전공 목록과 강의를 받습니다. 진행 상황은 페이지 오른쪽 아래에 보입니다. (3~5분, 요청 사이 1.5~2.5초 대기)
3. `hsuinfo-2026-2.json`이 다운로드 폴더에 저장되면 명령이 그 파일을 `data/`로 옮깁니다.
4. 강의를 DB 형식으로 변환하고, 문제가 없으면 학기 → 전공 → 전공별 강의 순으로 백엔드에 보냅니다.
   - 변환 실패가 하나라도 있으면 아무것도 보내지 않습니다.
   - 한 전공 전송이 실패해도 나머지는 계속 보내고, 실패 목록을 마지막에 보여줍니다.

환경변수: `DOWNLOAD_DIR`(기본 `~/Downloads`), `SCRAPE_TIMEOUT_MIN`(기본 15분)

## 수동으로 받기

- Tampermonkey가 켜진 상태로 종정시 시간표 페이지를 열면 오른쪽 아래에 **선택한 학기 내보내기** 버튼이 생깁니다. 페이지 드롭다운에서 학기를 고르고 누르면 됩니다.
- Tampermonkey 없이 `console/hsuinfo-export.user.js` 내용을 개발자도구 콘솔에 붙여넣어도 같은 버튼이 생깁니다.
- 받은 파일은 `npm run send -- <파일 경로> [--dry-run]`으로 보냅니다.

## 참고

- 종정시 데이터 요청은 자동화 도구(curl, Node, Playwright)에서 차단되므로 평소 쓰는 Chrome에서 받습니다.
- 교시 → 시각 변환 규칙은 [`utils/parseClassroom.ts`](utils/parseClassroom.ts) 주석에 있습니다.
- `main/`, `api/everytime/` 등 에브리타임·Playwright 기반 수집 코드는 더 이상 사용하지 않습니다.
