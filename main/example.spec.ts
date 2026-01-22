import { test } from "@playwright/test";
import mkdirSemester from "../utils/mkdirSemester";
import getMajors from "../api/everytime/getMajors";
import parseMajorsFromXML from "../utils/parseXML/parseMajorsFromXML";
import saveMajorsToJson from "../utils/saveJson/saveMajorsToJson";
import { MajorFileType } from "../type/major.type";
import { accumulateCourses } from "../api/everytime/getEveryTimeCourses";
import saveCoursesToJson from "../utils/saveJson/saveCoursesToJson";
import { TARGET_SEMESTER } from "../constants/TARGET_SEMESTER";
import readMajorFile from "../utils/readMajorFile";
import getHSUINFOCourses from "../api/hsu_info/getHSUINFOCourses";
import parseHSUInfoCoursesFromXML from "../utils/parseXML/parseHSUInfoCoursesFromXML";
import { EverytimeCourseType } from "../type/course.type";
import { HSUInfoXMLCourseType } from "../type/HSUInfo/HSUInfoXMLCourse.type";
import overrideCourseFile from "../utils/saveJson/overrideCourseFile";

const TEST_FUNC_TIME_OUT = 1000 * 60 * 60;
const semester = TARGET_SEMESTER;

test.use({
  locale: "ko-KR",
  channel: "chrome",
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
  extraHTTPHeaders: {
    "sec-ch-ua":
      '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
    "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  },
});

test("에브리타임: 전공 및 강의 긁어오기", async ({ page, context }) => {
  // 테스트 함수 타임아웃 1시간으로 정의
  test.setTimeout(TEST_FUNC_TIME_OUT);

  // 학기 폴더 생성
  await mkdirSemester(semester);

  await context.addCookies([
    {
      name: "etsid",
      value:
        "s%3A_9Vg6omAlTWKfgETULCabDehw7b-CcyC.jwR9eAvDCPr6aUdBPcJQHHBaI%2FGrvDa8v70Liorf5YA",
      domain: ".everytime.kr",
      path: "/",
      httpOnly: true,
    },
  ]);

  await page.goto("https://everytime.kr/timetable");

  await page.waitForTimeout(1000);

  const XMLMajors = await getMajors(page, semester);
  const fileMajors: MajorFileType[] = parseMajorsFromXML(XMLMajors);
  const isSuccessSaveMajors = await saveMajorsToJson(semester, fileMajors);

  if (!isSuccessSaveMajors) {
    return;
  }

  await page.waitForTimeout(1200);

  for (const major of fileMajors.slice(0, fileMajors.length)) {
    const major_id = major.id;
    const major_name = major.major_name;

    const fileCourses: EverytimeCourseType[] = await accumulateCourses(
      page,
      semester,
      major_id,
    );

    const isSuccessSaveCourses = await saveCoursesToJson(
      semester,
      major_id,
      fileCourses,
    );

    if (!isSuccessSaveCourses) {
      return;
    }
    console.log(
      `${major.order}/${fileMajors.length - 1} ${major_name}: ${
        fileCourses.length
      }개 강의 저장 성공`,
    );

    await page.waitForTimeout(Math.random() * (5000 - 2000) + 2000);
  }
});

test("종정시: 수업계획서 코드 긁어오기", async ({ page }) => {
  await page.goto("https://info.hansung.ac.kr/jsp/haksa/siganpyo_aui.jsp");

  const majors = await readMajorFile(semester);

  for (const major of majors) {
    const major_id = major.id;
    const major_code = major.major_code;
    const major_name = major.major_name;
    const order = major.order;

    const XMLCourses = await getHSUINFOCourses(page, semester, major_code);
    const courses: HSUInfoXMLCourseType[] =
      parseHSUInfoCoursesFromXML(XMLCourses);

    overrideCourseFile(semester, major_id, courses);

    console.log(
      `${order}/${
        majors.length - 1
      }: ${major_id} - ${major_name}(${major_code}) 파일 덮어쓰기 성공`,
    );
  }
});
