import { Page } from "@playwright/test";

export default async function getMajors(page: Page, semester: string) {
  const [year, term] = semester.split("-");

  const res = await page.request.post(
    "https://api.everytime.kr/find/timetable/subject/filter/list",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "*/*",
        Referer: "https://everytime.kr/",
        Origin: "https://everytime.kr",
      },
      data: `year=${year}&semester=${term}`,
    }
  );

  if (!res.ok) {
    throw new Error(`${semester} Get Majors HTTP ERROR!`);
  }

  // xml이기 때문에 text()
  return res.text();
}
