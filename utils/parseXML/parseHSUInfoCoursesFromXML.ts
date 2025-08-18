import { XMLParser } from "fast-xml-parser";
import { HSUCourseType } from "../../type/HSUInfo/HSUInfoCourseType";

export default function parseHSUInfoCoursesFromXML(XMLCourses: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    trimValues: true,
  });

  const rawrows = parser.parse(XMLCourses).rows.row;

  const rows: HSUCourseType[] = Array.isArray(rawrows) ? rawrows : [rawrows];

  return rows;
}
