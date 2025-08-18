import {
  CourseDBType,
  CourseFileTypeWithPlanCodeType,
} from "../../type/course.type";
import parseDayOrNight from "../../utils/parseDayOrNight";
import parseOfflineSchedules from "../../utils/parseOfflineSchedules";

export default async function postCourses(
  semester_id: string,
  major_code: string,
  courses: CourseFileTypeWithPlanCodeType[]
) {
  const courseData: CourseDBType[] = courses.map((course) => {
    const offline_schedules = course.timeplace
      ? parseOfflineSchedules(course.timeplace)
      : [];

    const [course_code, class_section] = course.code.split("-");
    const [delivery_method, day_or_night_string, grade_limit_string] =
      course.notice.split(", ");

    const day_or_night = parseDayOrNight(day_or_night_string);

    const grade = course.grade.replace("전학년", "0");
    const grade_limit = grade_limit_string
      ? Number(grade_limit_string.replace("학년제한:", "").trim())
      : null;

    let online = 0;
    if (course.time.includes("온라인강좌")) {
      const [onlineString] = course.time.split(" / ");
      online = Number(onlineString.replace(/온라인강좌|시간/g, "")) || 0;
    }

    return {
      semester_id,
      course_code,
      course_name: course.name,
      professor_names: course.professor,
      completion_type: course.type,
      delivery_method,
      credit: course.credit,
      day_or_night,
      class_section,
      grade,
      grade_limit,
      online_hour: online,
      plan_code: course.plan_code,
      offline_schedules,
    };
  });

  const res = await fetch("http://localhost:80/crawler/course-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      semester_id,
      major_code,
      courses: courseData,
    }),
  });

  if (!res.ok) {
    throw new Error(`Post Course: ${semester_id}-${major_code} HTTP ERROR!`);
  }

  return res.json();
}
