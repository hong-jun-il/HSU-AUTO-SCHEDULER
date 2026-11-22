import path from "path";
import fs from "fs/promises";

export default async function mkdirSemester(semester: string) {
  const dir = path.resolve(process.cwd(), semester);

  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    throw new Error(`${semester} 폴더 생성 실패`);
  }
}
