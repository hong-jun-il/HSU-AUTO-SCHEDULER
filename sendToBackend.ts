import fs from "fs/promises";
import path from "path";
import { TARGET_SEMESTER } from "./constants/TARGET_SEMESTER";
import { MajorFileType } from "./type/major.type";
import { CourseFileTypeWithPlanCodeType } from "./type/course.type";
import { postSemester } from "./api/post/postSemester";
import { postMajors } from "./api/post/postMajors";
import postCourses from "./api/post/postCourses";

const semester_id = TARGET_SEMESTER;

async function sendToBackend() {
  const majorsDir = path.resolve(process.cwd(), `${semester_id}`);
  const majors: MajorFileType[] = JSON.parse(
    await fs.readFile(`${majorsDir}/majors.json`, "utf-8")
  );

  const postSemesterRes = await postSemester(TARGET_SEMESTER);
  console.log(postSemesterRes);
  const postMajorRes = await postMajors(TARGET_SEMESTER, majors);
  console.log(postMajorRes);

  for (const index in majors) {
    const major_id = majors[index].id;
    const major_code = majors[index].major_code;
    const major_name = majors[index].major_name;

    const courseDir = path.resolve(
      process.cwd(),
      `${TARGET_SEMESTER}/courses/`
    );
    const courses: CourseFileTypeWithPlanCodeType[] = JSON.parse(
      await fs.readFile(`${courseDir}/${major_id}.json`, "utf-8")
    );

    const postCourseRes = await postCourses(semester_id, major_code, courses);

    console.log(postCourseRes);
  }
}
sendToBackend();
