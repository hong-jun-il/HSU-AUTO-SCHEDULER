import { CourseDBType } from "../../type/course.type";

type PostCourseType = {
  semesterId: string;
  code: string;
  name: string;
  courses: CourseDBType[];
};

export default async function postCourses({
  semesterId,
  code,
  name,
  courses,
}: PostCourseType) {
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
      courses,
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Post Course: 전공코드${code}: ${name} 강의 저장 HTTP ERROR! (${res.status})`,
    );
  }

  return res.json();
}
