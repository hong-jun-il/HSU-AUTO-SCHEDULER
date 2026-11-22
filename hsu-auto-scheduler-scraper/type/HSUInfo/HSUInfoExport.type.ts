// console/export-hsuinfo.js 가 내려받는 JSON 파일의 형태

// 종정시 siganpyo_aui_data.jsp 응답의 <row> 한 줄 (모든 값은 문자열 그대로)
export type HSUInfoRawCourse = {
  kwamokcode: string; // 과목코드 (예: P010182)
  kwamokname: string; // 과목명
  isugubun: string; // 이수구분 (전필, 전선, ...)
  hakjum: string; // 학점
  juya: string; // 주 / 야 / 합
  bunban: string; // 분반 (A, N, 7, ...)
  haknean: string; // 학년 ("2", "전학년")
  haknean_limit: string; // 학년제한 (대부분 빈 값)
  prof: string; // 교수 (여러 명이면 쉼표)
  classroom: string; // 강의실+시간 문자열 (예: "상상관503 월8M~9M / 상상관604 수8M~9M")
  plan: string; // 수업계획서 코드 ("X"면 없음)
  bigo: string; // 비고
  kwamok_gubun: string; // 수업방식 (대면수업, BL, 온라인100%)
};

export type HSUInfoExportMajor = {
  code: string; // 전공코드 (예: P012)
  name: string; // 전공명
  order: number;
  courses: HSUInfoRawCourse[];
};

export type HSUInfoExport = {
  source: string;
  semester: string; // "2026-2"
  fetchedAt: string;
  majors: HSUInfoExportMajor[];
};
