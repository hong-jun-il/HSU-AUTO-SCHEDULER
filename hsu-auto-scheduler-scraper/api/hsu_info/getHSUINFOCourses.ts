import { Page } from "@playwright/test";

export default async function getHSUINFOCourses(
  page: Page,
  semester: string,
  major_code: string,
) {
  const [year, term] = semester.split("-");

  const res = await page.request.post(
    "https://info.hansung.ac.kr/jsp/haksa/siganpyo_aui_data.jsp",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "application/xml, text/xml, */*; q=0.01",
        info: "info.hansung.ac.kr",
        Origin: "https://info.hansung.ac.kr",
        Referer: "https://info.hansung.ac.kr/jsp/haksa/siganpyo_aui.jsp",
      },
      data: `gubun=history&syearhakgi=${year}${term}&sjungong=${major_code}`,
    },
  );

  if (!res.ok) {
    throw new Error(`${semester}학기 ${major_code} HTTP ERROR!`);
  }

  const buffer = await res.body();

  try {
    const decoder = new TextDecoder("euc-kr");
    return decoder.decode(buffer);
  } catch (error) {
    console.warn("EUC-KR 디코딩 실패, UTF-8로 폴백:", error);
    return new TextDecoder("utf-8").decode(buffer);
  }
}
