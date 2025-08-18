import { XMLParser } from "fast-xml-parser";
import { CourseFileType, CourseXMLType } from "../../type/course.type";
import { TimePlaceFileType } from "../../type/timeplace.type";

export default function parseCoursesFromXML(XMLCourses: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    trimValues: true,
  });

  const rawSubject = parser.parse(XMLCourses).response.subject;

  const subjects: CourseXMLType[] = Array.isArray(rawSubject)
    ? rawSubject
    : [rawSubject];

  const courses: CourseFileType[] = subjects.map((course) => {
    const timeplaces: TimePlaceFileType[] | undefined = course.timeplace
      ? (Array.isArray(course.timeplace)
          ? course.timeplace
          : [course.timeplace]
        ).map((tp) => ({
          day: +tp["@_day"],
          start: +tp["@_start"],
          end: +tp["@_end"],
          place: tp["@_place"],
        }))
      : undefined;

    return {
      ...(timeplaces && { timeplace: timeplaces }),
      id: course["@_id"],
      code: course["@_code"],
      name: course["@_name"],
      professor: course["@_professor"],
      type: course["@_type"],
      grade: course["@_grade"],
      time: course["@_time"],
      place: course["@_place"],
      credit: +course["@_credit"],
      popular: +course["@_popular"],
      target: course["@_target"],
      notice: course["@_notice"],
      lectureId: course["@_lectureId"],
      lectureRate: course["@_lectureRate"],
      misc1: course["@_misc1"],
      misc2: course["@_misc2"],
      misc3: course["@_misc3"],
      misc4: course["@_misc4"],
    };
  });

  return courses;
}
