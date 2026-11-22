/*
 * 종정시 시간표 내보내기 (브라우저 콘솔용)
 *
 * 사용법
 *   1. 평소 쓰는 Chrome에서 https://info.hansung.ac.kr/jsp/haksa/siganpyo_aui.jsp 를 연다.
 *   2. 개발자도구(⌥⌘I) → Console 탭에 이 파일 내용을 통째로 붙여넣고 Enter.
 *   3. 끝나면 hsuinfo-<학기>.json 파일이 다운로드된다. (전공 약 110개, 3~5분)
 *   4. 그 파일을 HSU-data-scrapper 폴더에 두고 `npm run send -- hsuinfo-2026-2.json`.
 *
 * 학기를 바꾸려면 아래 SEMESTER만 수정한다. ("2026-2" → 2026년 2학기, 여름 3 / 겨울 4)
 * 서버 부담을 줄이려고 요청 사이에 1.5~2.5초씩 쉰다.
 */
(async function exportHsuInfo({ SEMESTER = "2026-2", LIMIT = Infinity, DOWNLOAD = true } = {}) {
  const [year, term] = SEMESTER.split("-");
  const yearhakgi = `${year}${term}`;
  const DATA_URL = "/jsp/haksa/siganpyo_aui_data.jsp";
  const FIELDS = [
    "kwamokcode", "kwamokname", "isugubun", "hakjum", "juya", "bunban", "haknean",
    "haknean_limit", "prof", "classroom", "plan", "bigo", "kwamok_gubun",
  ];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  if (!location.href.includes("siganpyo_aui.jsp")) {
    throw new Error("종정시 시간표 페이지(siganpyo_aui.jsp)에서 실행해 주세요.");
  }

  async function post(query, body) {
    for (let attempt = 1; ; attempt++) {
      try {
        const res = await fetch(`${DATA_URL}${query}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Accept: "application/xml, text/xml, */*; q=0.01",
            info: "info.hansung.ac.kr",
          },
          body,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = new TextDecoder("euc-kr").decode(await res.arrayBuffer());
        return new DOMParser().parseFromString(text, "text/xml");
      } catch (err) {
        if (attempt >= 3) throw new Error(`${query} ${body} 요청 실패: ${err.message}`);
        console.warn(`재시도 ${attempt}/2: ${body} (${err.message})`);
        await sleep(5000 * attempt);
      }
    }
  }
  const text = (el, tag) => (el.getElementsByTagName(tag)[0]?.textContent ?? "").trim();

  // 1) 전공 목록
  const majorXml = await post("?gubun=jungonglist", `syearhakgi=${yearhakgi}`);
  const majors = [...majorXml.getElementsByTagName("item")]
    .map((item, order) => {
      const code = text(item, "tcd");
      const name = text(item, "tnm").replace(/^\[[^\]]*\]\s*/, "");
      return { code, name, order };
    })
    .filter((m) => m.code)
    .slice(0, LIMIT);
  if (majors.length === 0) throw new Error(`${SEMESTER} 학기 전공 목록이 비어 있어요.`);
  console.log(`${SEMESTER}: 전공 ${majors.length}개 수집 시작`);

  // 2) 전공별 강의
  for (const [i, major] of majors.entries()) {
    const xml = await post("", `gubun=history&syearhakgi=${yearhakgi}&sjungong=${major.code}`);
    major.courses = [...xml.getElementsByTagName("row")].map((row) =>
      Object.fromEntries(FIELDS.map((f) => [f, text(row, f)])),
    );
    console.log(`${i + 1}/${majors.length} [${major.code}] ${major.name}: ${major.courses.length}개`);
    await sleep(1500 + Math.random() * 1000);
  }

  const result = {
    source: "info.hansung.ac.kr siganpyo_aui_data.jsp",
    semester: SEMESTER,
    fetchedAt: new Date().toISOString(),
    majors,
  };
  const total = majors.reduce((n, m) => n + m.courses.length, 0);
  console.log(`완료: 전공 ${majors.length}개, 강의 ${total}개`);

  if (DOWNLOAD) {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `hsuinfo-${SEMESTER}.json`,
    });
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  window.__hsuExport = result;
  return { semester: SEMESTER, majors: majors.length, courses: total };
})();
