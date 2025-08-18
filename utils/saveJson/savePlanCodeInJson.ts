import path from "path";
import fs from "fs/promises";
import { HSUCourseType } from "../../type/HSUInfo/HSUInfoCourseType";
import { CourseFileType } from "../../type/course.type";

export default async function savePlanCodeInJson(
  semester: string,
  major_id: string,
  courses: HSUCourseType[]
) {
  const dir = path.resolve(process.cwd(), `${semester}/courses`);
  const file = path.join(dir, `${major_id}.json`);
  const file_courses: CourseFileType[] = JSON.parse(
    await fs.readFile(`${file}`, "utf-8")
  );

  const added_plan_code_courses = [];

  for (const course of courses) {
    const class_section = course.bunban;
    const course_code = course.kwamokcode;
    const code = `${course_code}-${class_section}`;

    const target_course = file_courses.find((tc) => tc.code === code);

    if (!target_course) {
      throw new Error(
        `${semester}학기 ${course.kwamokname} (${code})를 파일 내에서 찾지 못함!`
      );
    }

    const newCourseData = {
      ...target_course,
      plan_code: course.plan,
    };

    added_plan_code_courses.push(newCourseData);
  }

  if (added_plan_code_courses.length !== file_courses.length) {
    throw new Error(
      `${semester}학기 ${major_id}의 파일 내 강의 개수와 새로 만들어질 강의 개수가 다름!`
    );
  }

  try {
    await fs.writeFile(
      file,
      JSON.stringify(added_plan_code_courses, null, 2),
      "utf-8"
    );
  } catch (error) {
    throw new Error(`${semester} Make File "${major_id}.json" ERROR!`);
  }
}
