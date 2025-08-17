import { test } from "@playwright/test";
import mkdirSemester from "../utils/mkdirSemester";
import getMajors from "../api/getMajors";
import parseMajorsFromXML from "../utils/parseXML/parseMajorsFromXML";
import saveMajorsToJson from "../utils/saveJson/saveMajorsToJson";
import { MajorFileType } from "../type/major.type";
import { accumulateCourses } from "../api/getCourses";
import { CourseFileType } from "../type/course.type";
import saveCoursesToJson from "../utils/saveJson/saveCoursesToJson";
import { TARGET_SEMESTER } from "../targetSemeter";

const TEST_FUNC_TIME_OUT = 1000 * 60 * 60;

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

test("전공 및 강의 긁어오기", async ({ page, context }) => {
  // 테스트 함수 타임아웃 1시간으로 정의
  test.setTimeout(TEST_FUNC_TIME_OUT);

  // 학기 폴더 생성
  await mkdirSemester(TARGET_SEMESTER);

  await context.addCookies([
    {
      name: "etsid",
      value:
        "s%3AyPXUF0aQh7Xh7eDgWYPf_GiVpylkKqt3.H5OOiQavQm%2FmQP45zHo4ycD9QTw2V65WSjb41oLCa5w",
      domain: ".everytime.kr",
      path: "/",
      httpOnly: true,
    },
  ]);

  await page.goto("https://everytime.kr/timetable");

  await page.waitForTimeout(1000);

  const XMLMajors = await getMajors(page, TARGET_SEMESTER);
  const fileMajors: MajorFileType[] = parseMajorsFromXML(XMLMajors);
  const isSuccessSaveMajors = await saveMajorsToJson(
    TARGET_SEMESTER,
    fileMajors
  );

  if (!isSuccessSaveMajors) {
    return;
  }

  await page.waitForTimeout(1200);

  for (const major of fileMajors.slice(0, fileMajors.length)) {
    const major_id = major.id;
    const major_name = major.major_name;

    const fileCourses: CourseFileType[] = await accumulateCourses(
      page,
      TARGET_SEMESTER,
      major_id
    );

    const isSuccessSaveCourses = await saveCoursesToJson(
      TARGET_SEMESTER,
      major_id,
      fileCourses
    );

    if (!isSuccessSaveCourses) {
      return;
    }
    console.log(
      `${major.order}/${fileMajors.length - 1} ${major_name}: ${
        fileCourses.length
      }개 강의 저장 성공`
    );

    await page.waitForTimeout(Math.random() * (5000 - 2000) + 2000);
  }
});
