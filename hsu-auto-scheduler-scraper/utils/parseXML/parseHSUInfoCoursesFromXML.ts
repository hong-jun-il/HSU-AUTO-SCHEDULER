import { XMLParser } from "fast-xml-parser";
import { HSUInfoXMLCourseType } from "../../type/HSUInfo/HSUInfoXMLCourse.type";

export default function parseHSUInfoCoursesFromXML(XMLCourses: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    trimValues: true,
  });

  const rawrows = parser.parse(XMLCourses).rows.row;

  const rows: HSUInfoXMLCourseType[] = Array.isArray(rawrows)
    ? rawrows
    : [rawrows];

  return rows;
}
