import { Page } from "@playwright/test";
import parseCoursesFromXML from "../../utils/parseXML/parseCoursesFromXML";
import { randomDelay } from "../../utils/randomDelay";
import { EverytimeCourseType } from "../../type/course.type";

export async function getEveryTimeCourses(
  page: Page,
  semester: string,
  major_id: string,
  pageIndex: number,
) {
  const [year, term] = semester.split("-");

  const res = await page.request.post(
    "https://api.everytime.kr/find/timetable/subject/list",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "*/*",
        Referer: "https://everytime.kr/",
        Origin: "https://everytime.kr",
      },
      data: `categoryId=${major_id}&campusId=195&year=${year}&semester=${term}&limitNum=50&startNum=${
        pageIndex * 50
      }`,
    },
  );

  if (!res.ok) {
    throw new Error(`${semester} ${major_id} get Course HTTP ERROR!`);
  }

  return res.text();
}

export async function accumulateCourses(
  page: Page,
  semester: string,
  major_id: string,
) {
  let pageIndex = 0;
  let allCourses: EverytimeCourseType[] = [];

  while (1) {
    const XMLCourses = await getEveryTimeCourses(
      page,
      semester,
      major_id,
      pageIndex,
    );
    const coursesInCurPage = parseCoursesFromXML(XMLCourses);

    allCourses.push(...coursesInCurPage);

    if (coursesInCurPage.length < 50) {
      break;
    } else {
      pageIndex++;
    }

    await randomDelay();
  }

  return allCourses;
}
