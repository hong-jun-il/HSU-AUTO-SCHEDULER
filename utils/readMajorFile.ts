import path from "path";
import fs from "fs/promises";
import { MajorFileType } from "../type/major.type";

export default async function readMajorFile(semester: string) {
  const majorsDir = path.resolve(process.cwd(), `${semester}`);
  const majors: MajorFileType[] = JSON.parse(
    await fs.readFile(`${majorsDir}/majors.json`, "utf-8")
  );

  return majors;
}
