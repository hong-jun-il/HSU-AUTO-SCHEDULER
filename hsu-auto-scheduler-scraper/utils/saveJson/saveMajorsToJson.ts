import path from "path";
import fs from "fs/promises";

import { MajorFileType } from "../../type/major.type";

export default async function saveMajorsToJson(
  semester: string,
  fileMajors: MajorFileType[]
) {
  const dir = path.resolve(process.cwd(), semester);
  const file = path.join(dir, "majors.json");

  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(file, JSON.stringify(fileMajors, null, 2), "utf-8");

    return true;
  } catch (error) {
    throw new Error(`${semester} Make File "majors.json" ERROR!`);
  }
}
