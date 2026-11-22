/*
 * 수집한 학기 파일 → 백엔드 전송
 *
 *   npm run send -- 2026-2              # data/hsuinfo-2026-2.json 을 전송
 *   npm run send -- 2026-2 --dry-run    # 변환 결과만 data/hsuinfo-2026-2.payload.json 으로 저장
 *   npm run send -- <파일.json>          # 다른 위치의 내보내기 파일을 전송
 *
 * 파일은 `npm run scrape -- <학기>` 가 data/ 에 만든다.
 */
import fs from "fs/promises";
import path from "path";
import { postSemester } from "../api/post/postSemester";
import { postMajors } from "../api/post/postMajors";
import postCourses from "../api/post/postCourses";
import { buildCourse } from "../utils/buildCourse";
import { CourseDBType } from "../type/course.type";
import { HSUInfoExport } from "../type/HSUInfo/HSUInfoExport.type";

type BuiltMajor = { code: string; name: string; courses: CourseDBType[] };

function buildAll(data: HSUInfoExport) {
  const warnings: string[] = [];
  const errors: string[] = [];
  // 종정시 전공 목록에는 그 학기 강의가 없는 전공도 섞여 있어서 뺀다
  const skipped = data.majors.filter((major) => major.courses.length === 0);
  const majors: BuiltMajor[] = data.majors.filter((major) => major.courses.length > 0).map((major) => {
    const courses: CourseDBType[] = [];
    for (const row of major.courses) {
      try {
        const built = buildCourse(row);
        courses.push(built.course);
        warnings.push(...built.warnings.map((w) => `[${major.code}] ${w}`));
      } catch (err) {
        errors.push(`[${major.code}] ${row.kwamokcode}-${row.bunban}: ${(err as Error).message}`);
      }
    }
    return { code: major.code, name: major.name, courses };
  });
  return { majors, skipped, warnings, errors };
}

// 내보내기 파일 하나를 변환해 전송한다. 실패하면 예외를 던진다.
export const DATA_DIR = path.resolve(__dirname, "../data");
export const SEMESTER_PATTERN = /^\d{4}-[1-4]$/;
export const dataFileFor = (semester: string) => path.join(DATA_DIR, `hsuinfo-${semester}.json`);

// 내보내기 파일 하나를 변환해 전송한다. expectedSemester가 있으면 파일 안의 학기와 같아야 한다.
export async function sendFile(
  file: string,
  { dryRun = false, expectedSemester }: { dryRun?: boolean; expectedSemester?: string } = {},
) {
  const data: HSUInfoExport = JSON.parse(await fs.readFile(path.resolve(file), "utf-8"));
  if (!SEMESTER_PATTERN.test(data.semester ?? "")) {
    throw new Error(`파일의 semester 값이 이상해요: "${data.semester}"`);
  }
  if (expectedSemester && data.semester !== expectedSemester) {
    throw new Error(`요청한 학기(${expectedSemester})와 파일의 학기(${data.semester})가 달라서 전송하지 않아요: ${file}`);
  }
  const [year, term] = data.semester.split("-").map(Number);

  const { majors, skipped, warnings, errors } = buildAll(data);
  const total = majors.reduce((n, m) => n + m.courses.length, 0);
  console.log(`${data.semester} (수집 ${data.fetchedAt}): 전공 ${majors.length}개, 강의 ${total}개 변환`);
  if (skipped.length) {
    console.log(`강의가 없는 전공 ${skipped.length}개는 보내지 않아요: ${skipped.map((m) => `[${m.code}] ${m.name}`).join(", ")}`);
  }
  if (warnings.length) console.warn(`경고 ${warnings.length}건:\n  ${warnings.join("\n  ")}`);
  if (errors.length) {
    throw new Error(`변환 실패 ${errors.length}건 — 전송하지 않아요:\n  ${errors.join("\n  ")}`);
  }

  if (dryRun) {
    const out = path.resolve(file.replace(/\.json$/, "") + ".payload.json");
    await fs.writeFile(out, JSON.stringify({ year, term, majors }, null, 2), "utf-8");
    console.log(`--dry-run: 전송하지 않았어요. 변환 결과: ${out}`);
    return;
  }

  if (!process.env.BASE_URL) throw new Error(".env 에 BASE_URL 이 없어요.");

  const { data: semester } = await postSemester({ year, term });
  const semesterId = semester!.id;
  console.log(await postMajors(semesterId, majors.map(({ code, name }) => ({ code, name }))));

  const failed: string[] = [];
  for (const major of majors) {
    try {
      await postCourses({ semesterId, code: major.code, name: major.name, courses: major.courses });
      console.log(`[${major.code}] ${major.name}: ${major.courses.length}개 전송`);
    } catch (err) {
      failed.push(`[${major.code}] ${(err as Error).message}`);
    }
  }
  if (failed.length) {
    throw new Error(`전송 실패 ${failed.length}건:\n  ${failed.join("\n  ")}`);
  }
  console.log("전송 완료");
}

// npm run send -- <학기 | 파일.json> [--dry-run]
async function main() {
  const args = process.argv.slice(2);
  const target = args.find((a) => !a.startsWith("--"));
  const dryRun = args.includes("--dry-run");
  if (!target) {
    console.error("사용법: npm run send -- <학기, 예: 2026-2 | 파일.json> [--dry-run]");
    process.exit(1);
  }

  if (SEMESTER_PATTERN.test(target)) {
    const file = dataFileFor(target);
    try {
      await fs.access(file);
    } catch {
      throw new Error(`${file} 이 없어요. 먼저 \`npm run scrape -- ${target}\` 로 받아 주세요.`);
    }
    await sendFile(file, { dryRun, expectedSemester: target });
  } else if (target.endsWith(".json")) {
    await sendFile(target, { dryRun });
  } else {
    throw new Error(`학기(예: 2026-2)나 .json 파일 경로를 주세요: "${target}"`);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
