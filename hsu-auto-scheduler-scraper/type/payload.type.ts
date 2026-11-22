import { CourseDBType } from "./course.type";

// 백엔드 PUT /admin/semesters/{학기} 로 보내는 학기 하나 전체
// (--dry-run 이 data/hsuinfo-<학기>.payload.json 으로 저장하는 내용과 같다)
export type SemesterPayload = {
  year: number;
  term: number;
  scraped_at: string; // 종정시 수집 시각 (내보내기 파일의 fetchedAt)
  majors: MajorPayload[];
};

// 전공 하나와 그 전공 목록에 나오는 분반들. 같은 분반이 여러 전공에 나오면 서버가 합친다
export type MajorPayload = {
  code: string;
  name: string;
  courses: CourseDBType[];
};

// 백엔드 응답: 저장한 행 수
export type IngestResult = {
  semester_id: string;
  majors: number;
  courses: number;
  lectures: number;
  deleted_lectures: number;
  major_courses: number;
  offline_schedules: number;
};
