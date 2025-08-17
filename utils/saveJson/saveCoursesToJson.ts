import path from "path";
import fs from "fs/promises";
import { CourseFileType } from "../../type/course.type";

export default async function saveCoursesToJson(
  semester: string,
  major_id: string,
  fileCourses: CourseFileType[]
) {
  const dir = path.resolve(process.cwd(), `${semester}/courses`);
  const file = path.join(dir, `${major_id}.json`);

  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(file, JSON.stringify(fileCourses, null, 2), "utf-8");

    return true;
  } catch (error) {
    throw new Error(`${semester} Make File "${major_id}.json" ERROR!`);
  }
}
