// ==UserScript==
// @name         HSU 종정시 시간표 내보내기
// @namespace    hsu-auto-scheduler
// @version      1.0.0
// @description  종정시 시간표 페이지에서 학기 전체 강의를 hsuinfo-<학기>.json 으로 내려받는다
// @match        https://info.hansung.ac.kr/jsp/haksa/siganpyo_aui.jsp*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

/*
 * 동작
 *   - 주소 끝이 #export=2026-2 이면 페이지가 열리자마자 그 학기를 받아 다운로드한다.
 *     (`npm run scrape -- 2026-2` 가 이 주소로 Chrome을 연다)
 *   - 그냥 페이지를 열면 오른쪽 아래에 "내보내기" 버튼이 생긴다.
 *     페이지의 학년도·학기 드롭다운에서 고른 학기를 받는다.
 *   - Tampermonkey 없이 이 파일을 개발자도구 콘솔에 붙여넣어도 같은 버튼이 생긴다.
 *
 * 서버 부담을 줄이려고 요청 사이에 1.5~2.5초씩 쉰다. (전공 약 110개, 3~5분)
 */
(function () {
  "use strict";

  const DATA_URL = "/jsp/haksa/siganpyo_aui_data.jsp";
  const FIELDS = [
    "kwamokcode", "kwamokname", "isugubun", "hakjum", "juya", "bunban", "haknean",
    "haknean_limit", "prof", "classroom", "plan", "bigo", "kwamok_gubun",
  ];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const text = (el, tag) => (el.getElementsByTagName(tag)[0]?.textContent ?? "").trim();

  // ---- 화면 표시 ----------------------------------------------------------
  const box = document.createElement("div");
  box.style.cssText =
    "position:fixed;right:16px;bottom:16px;z-index:99999;background:#fff;border:1px solid #888;" +
    "border-radius:8px;padding:10px 12px;font:13px/1.5 sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.2);max-width:320px";
  const status = document.createElement("div");
  const button = document.createElement("button");
  button.textContent = "선택한 학기 내보내기";
  button.style.cssText = "margin-top:6px;padding:4px 10px;cursor:pointer";
  box.append(status, button);
  document.body.appendChild(box);
  const show = (msg) => { status.textContent = msg; console.log(`[HSU 내보내기] ${msg}`); };

  // ---- 요청 --------------------------------------------------------------
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
        const xml = new TextDecoder("euc-kr").decode(await res.arrayBuffer());
        return new DOMParser().parseFromString(xml, "text/xml");
      } catch (err) {
        if (attempt >= 3) throw new Error(`요청 실패 (${body}): ${err.message}`);
        show(`재시도 ${attempt}/2: ${err.message}`);
        await sleep(5000 * attempt);
      }
    }
  }

  // ---- 내보내기 -----------------------------------------------------------
  // semester: "2026-2" (여름 -3, 겨울 -4)
  async function exportSemester(semester) {
    if (!/^\d{4}-[1-4]$/.test(semester)) throw new Error(`학기 형식이 이상해요: "${semester}"`);
    const [year, term] = semester.split("-");
    const yearhakgi = `${year}${term}`;

    const majorXml = await post("?gubun=jungonglist", `syearhakgi=${yearhakgi}`);
    const majors = [...majorXml.getElementsByTagName("item")]
      .map((item, order) => ({
        code: text(item, "tcd"),
        name: text(item, "tnm").replace(/^\[[^\]]*\]\s*/, ""),
        order,
      }))
      .filter((m) => m.code);
    if (majors.length === 0) throw new Error(`${semester} 학기 전공 목록이 비어 있어요.`);

    for (const [i, major] of majors.entries()) {
      show(`${semester}: ${i + 1}/${majors.length} [${major.code}] ${major.name}`);
      const xml = await post("", `gubun=history&syearhakgi=${yearhakgi}&sjungong=${major.code}`);
      major.courses = [...xml.getElementsByTagName("row")].map((row) =>
        Object.fromEntries(FIELDS.map((f) => [f, text(row, f)])),
      );
      await sleep(1500 + Math.random() * 1000);
    }

    const result = {
      source: "info.hansung.ac.kr siganpyo_aui_data.jsp",
      semester,
      fetchedAt: new Date().toISOString(),
      majors,
    };
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `hsuinfo-${semester}.json`,
    });
    document.body.appendChild(a);
    a.click();
    a.remove();

    const total = majors.reduce((n, m) => n + m.courses.length, 0);
    show(`완료: ${semester} 전공 ${majors.length}개, 강의 ${total}개 → hsuinfo-${semester}.json`);
    window.__hsuExport = result;
    return result;
  }

  let running = false;
  async function run(semester) {
    if (running) return;
    running = true;
    button.disabled = true;
    try {
      await exportSemester(semester);
    } catch (err) {
      show(`실패: ${err.message}`);
    } finally {
      running = false;
      button.disabled = false;
    }
  }

  // 페이지 드롭다운 값 "20262" → "2026-2"
  button.addEventListener("click", () => {
    const value = document.querySelector("#yearhakgi")?.value ?? "";
    if (!/^\d{5}$/.test(value)) return show("학년도·학기를 먼저 선택해 주세요.");
    run(`${value.slice(0, 4)}-${value.slice(4)}`);
  });

  const auto = location.hash.match(/export=(\d{4}-[1-4])/);
  if (auto) {
    history.replaceState(null, "", location.pathname + location.search); // 새로고침 시 다시 받지 않도록
    run(auto[1]);
  } else {
    show("학기를 고르고 버튼을 누르면 시간표를 내려받아요.");
  }
})();
