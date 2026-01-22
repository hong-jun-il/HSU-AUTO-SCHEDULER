import path from "path";
import fs from "fs/promises";
import {
  EverytimeCourseType,
  OverridedCourseType,
} from "../../type/course.type";
import { HSUInfoXMLCourseType } from "../../type/HSUInfo/HSUInfoXMLCourse.type";

// 이수 구분(type), 학년(grade), 강의계획서 코드(plan_code)를 덮어씌움
export default async function overrideCourseFile(
  semester: string,
  major_id: string,
  courses: HSUInfoXMLCourseType[],
) {
  const dir = path.resolve(process.cwd(), `${semester}/courses/`);
  const file = path.join(dir, `${major_id}.json`);
  const file_courses: EverytimeCourseType[] = JSON.parse(
    await fs.readFile(`${file}`, "utf-8"),
  );

  const added_plan_code_courses = [];

  for (const course of courses) {
    const section = course.bunban;
    const course_code = course.kwamokcode;
    const type = course.isugubun;
    const grade = course.haknean === "전학년" ? 0 : +course.haknean;
    const plan = course.plan.toLowerCase() === "x" ? null : course.plan;

    const code = `${course_code}-${section}`;

    const target_course = file_courses.find((tc) => tc.code === code);

    if (!target_course) {
      console.warn(
        `${semester}학기 ${major_id} ${course.kwamokname} (${code})를 파일 내에서 찾지 못함!`,
      );
      continue;
    }

    const newCourseData: OverridedCourseType = {
      ...target_course,
      type,
      grade: grade,
      remark: course.bigo || null,
      plan_code: plan,
    };

    added_plan_code_courses.push(newCourseData);
  }

  try {
    await fs.writeFile(
      file,
      JSON.stringify(added_plan_code_courses, null, 2),
      "utf-8",
    );
  } catch (error) {
    throw new Error(`${semester} Make File "${major_id}.json" ERROR!`);
  }
}
