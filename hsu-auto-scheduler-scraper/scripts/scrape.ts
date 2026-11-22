/*
 * 명령 하나로 수집 → 변환 → 전송
 *
 *   npm run scrape -- 2026-2            # 실제 전송
 *   npm run scrape -- 2026-2 --dry-run  # 변환 결과만 data/hsuinfo-2026-2.payload.json 으로 저장
 *
 * 1. Chrome으로 종정시 시간표 페이지를 #export=<학기> 를 붙여 연다.
 * 2. Tampermonkey 스크립트(console/hsuinfo-export.user.js)가 그 학기를 받아 다운로드한다.
 * 3. 다운로드 폴더에 새 hsuinfo-<학기>*.json 이 생기면 data/ 로 옮긴다.
 * 4. scripts/send.ts 로 변환·전송한다.
 *
 * 환경변수: DOWNLOAD_DIR (기본 ~/Downloads), SCRAPE_TIMEOUT_MIN (기본 15)
 */
import fs from "fs/promises";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { dataFileFor, DATA_DIR, sendFile } from "./send";

const PAGE_URL = "https://info.hansung.ac.kr/jsp/haksa/siganpyo_aui.jsp";
const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR || path.join(os.homedir(), "Downloads");
const TIMEOUT_MS = Number(process.env.SCRAPE_TIMEOUT_MIN || 15) * 60_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 다운로드 폴더에서 startedAt 이후 생긴 hsuinfo-<학기>.json (또는 " (1)" 등이 붙은 것)을 기다린다
async function waitForDownload(semester: string, startedAt: number): Promise<string> {
  const pattern = new RegExp(`^hsuinfo-${semester.replace("-", "\\-")}( \\(\\d+\\))?\\.json$`);
  const deadline = Date.now() + TIMEOUT_MS;
  let lastSize = -1;
  let candidate = "";

  while (Date.now() < deadline) {
    const names = (await fs.readdir(DOWNLOAD_DIR)).filter((n) => pattern.test(n));
    let newest = { name: "", mtime: 0 };
    for (const name of names) {
      const { mtimeMs } = await fs.stat(path.join(DOWNLOAD_DIR, name));
      if (mtimeMs >= startedAt && mtimeMs > newest.mtime) newest = { name, mtime: mtimeMs };
    }
    if (newest.name) {
      const full = path.join(DOWNLOAD_DIR, newest.name);
      const { size } = await fs.stat(full);
      // 크기가 두 번 연속 같으면 다운로드가 끝난 것으로 본다
      if (full === candidate && size === lastSize && size > 0) return full;
      candidate = full;
      lastSize = size;
    }
    await sleep(2000);
  }
  throw new Error(
    `${TIMEOUT_MS / 60_000}분 안에 ${DOWNLOAD_DIR} 에 hsuinfo-${semester}.json 이 생기지 않았어요.\n` +
      "Chrome 창 오른쪽 아래 상태 상자와 Tampermonkey 스크립트가 켜져 있는지 확인해 주세요.",
  );
}

async function main() {
  const args = process.argv.slice(2);
  const semester = args.find((a) => !a.startsWith("--"));
  const dryRun = args.includes("--dry-run");
  if (!semester || !/^\d{4}-[1-4]$/.test(semester)) {
    console.error("사용법: npm run scrape -- <학기, 예: 2026-2> [--dry-run]   (1·2학기, 여름 3, 겨울 4)");
    process.exit(1);
  }

  const startedAt = Date.now() - 1000;
  const url = `${PAGE_URL}#export=${semester}`;
  console.log(`Chrome으로 종정시를 열어요: ${url}`);
  await promisify(execFile)("open", ["-a", "Google Chrome", url]);

  console.log(`다운로드를 기다려요 (${DOWNLOAD_DIR}, 보통 3~5분)...`);
  const downloaded = await waitForDownload(semester, startedAt);

  await fs.mkdir(DATA_DIR, { recursive: true });
  const target = dataFileFor(semester);
  await fs.copyFile(downloaded, target);
  await fs.unlink(downloaded);
  console.log(`받은 파일을 옮겼어요: ${target}`);

  await sendFile(target, { dryRun, expectedSemester: semester });
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
