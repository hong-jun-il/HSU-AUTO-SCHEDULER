import {
  DAY_OR_NIGHT_MAP,
  DELIVERY_METHOD_MAP,
  REQUIREMENT_TYPE_MAP,
} from "../../constants/MAP_OBJ";
import { CourseDBType, OverridedCourseType } from "../../type/course.type";
import parseOfflineSchedules from "../../utils/parseOfflineSchedules";

type PostCourseType = {
  semesterId: string;
  code: string;
  name: string;
  courses: OverridedCourseType[];
};

export default async function postCourses({
  semesterId,
  code,
  name,
  courses,
}: PostCourseType) {
  const courseData: CourseDBType[] = courses.map((course) => {
    const offline_schedules = course.timeplace
      ? parseOfflineSchedules(course.timeplace)
      : [];

    const [course_code, section] = course.code.split("-");
    const [delivery_method_string, day_or_night_string, grade_limit_string] =
      course.notice.split(", ");

    const parsed_requiredment_type = REQUIREMENT_TYPE_MAP[course.type];
    const parsed_delivery_method = DELIVERY_METHOD_MAP[delivery_method_string];
    const parsed_day_or_night = DAY_OR_NIGHT_MAP[day_or_night_string];

    const grade_limit = grade_limit_string
      ? Number(grade_limit_string.replace("학년제한:", "").trim())
      : null;

    let online_hour = 0;
    if (course.time.includes("온라인강좌")) {
      const [onlineString] = course.time.split(" / ");
      online_hour = Number(onlineString.replace(/온라인강좌|시간/g, "")) || 0;
    }

    return {
      code: course_code,
      name: course.name,
      credit: course.credit,
      requirement_type: parsed_requiredment_type,
      grade: course.grade,
      grade_limit,
      section,
      delivery_method: parsed_delivery_method,
      day_or_night: parsed_day_or_night,
      professors: course.professor,
      online_hour,
      plan_code: course.plan_code,
      remark: course.remark,
      offline_schedules,
    };
  });

  const res = await fetch(`${process.env.BASE_URL}/crawler/save-courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      semesterId,
      major: {
        code,
        name,
      },
      courses: courseData,
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Post Course: 전공코드${code}: ${name} 강의 저장 HTTP ERROR!`,
    );
  }

  return res.json();
}
