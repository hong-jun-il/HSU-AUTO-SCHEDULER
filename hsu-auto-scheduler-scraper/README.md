# hsu-auto-scheduler-scraper

한성대 종합정보시스템(종정시) 시간표를 받아 백엔드 DB 형식으로 변환·전송합니다.

## 사용법

1. Chrome에서 https://info.hansung.ac.kr/jsp/haksa/siganpyo_aui.jsp 를 엽니다.
2. 개발자도구 Console에 [`console/export-hsuinfo.js`](console/export-hsuinfo.js) 내용을 붙여넣고 실행합니다.
   - 받을 학기는 파일 안의 `SEMESTER` 값(예: `2026-2`, 여름 `-3`, 겨울 `-4`)으로 정합니다.
   - 다운로드 폴더에 `hsuinfo-<학기>.json`이 저장됩니다.
3. 이 폴더에서 변환을 확인하고 전송합니다.

```bash
npm ci
npm run send -- ~/Downloads/hsuinfo-2026-2.json --dry-run   # 변환만 (전송 안 함)
npm run send -- ~/Downloads/hsuinfo-2026-2.json             # 실제 전송 (.env 의 BASE_URL)
```

## 참고

- 종정시 데이터 요청은 자동화 도구(curl, Node, Playwright)에서 차단되므로 실제 브라우저에서 받습니다.
- 교시 → 시각 변환 규칙은 [`utils/parseClassroom.ts`](utils/parseClassroom.ts) 주석에 있습니다.
- `main/`, `api/everytime/` 등 에브리타임 기반 수집 코드는 더 이상 사용하지 않습니다.
