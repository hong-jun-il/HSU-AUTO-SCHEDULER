/*
 * 종정시 내보내기 파일 → 백엔드 전송
 *
 *   npm run send -- hsuinfo-2026-2.json --dry-run   # 변환만 하고 결과를 확인 (전송 안 함)
 *   npm run send -- hsuinfo-2026-2.json             # 실제 전송
 *
 * 내보내기 파일은 console/export-hsuinfo.js 를 종정시 페이지 콘솔에서 실행해 만든다.
 */
import fs from "fs/promises";
import path from "path";
import { postSemester } from "./api/post/postSemester";
import { postMajors } from "./api/post/postMajors";
import postCourses from "./api/post/postCourses";
import { buildCourse } from "./utils/buildCourse";
import { CourseDBType } from "./type/course.type";
import { HSUInfoExport } from "./type/HSUInfo/HSUInfoExport.type";

type BuiltMajor = { code: string; name: string; courses: CourseDBType[] };

function buildAll(data: HSUInfoExport) {
  const warnings: string[] = [];
  const errors: string[] = [];
  const majors: BuiltMajor[] = data.majors.map((major) => {
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
  return { majors, warnings, errors };
}

// 내보내기 파일 하나를 변환해 전송한다. 실패하면 예외를 던진다.
export async function sendFile(file: string, { dryRun = false } = {}) {
  const data: HSUInfoExport = JSON.parse(await fs.readFile(path.resolve(file), "utf-8"));
  const [year, term] = data.semester.split("-").map(Number);
  if (!year || !term) throw new Error(`파일의 semester 값이 이상해요: "${data.semester}"`);

  const { majors, warnings, errors } = buildAll(data);
  const total = majors.reduce((n, m) => n + m.courses.length, 0);
  console.log(`${data.semester} (수집 ${data.fetchedAt}): 전공 ${majors.length}개, 강의 ${total}개 변환`);
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

// npm run send -- <파일> [--dry-run] 으로 직접 실행했을 때
if (require.main === module) {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) {
    console.error("사용법: npm run send -- <hsuinfo-학기.json> [--dry-run]");
    process.exit(1);
  }
  sendFile(file, { dryRun: args.includes("--dry-run") }).catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
