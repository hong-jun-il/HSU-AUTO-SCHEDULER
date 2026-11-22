import {
  DELIVERY_METHOD_MAP,
  JUYA_MAP,
  REQUIREMENT_TYPE_MAP,
} from "../constants/MAP_OBJ";
import { CourseDBType } from "../type/course.type";
import { HSUInfoRawCourse } from "../type/HSUInfo/HSUInfoExport.type";
import { parseClassroom } from "./parseClassroom";

// 종정시 강의 한 줄 → 백엔드로 보낼 CourseDBType
// 매핑되지 않는 값은 warnings 로 돌려준다 (필드는 undefined 로 남는다)
export function buildCourse(row: HSUInfoRawCourse): {
  course: CourseDBType;
  warnings: string[];
} {
  const warnings: string[] = [];
  const id = `${row.kwamokcode}-${row.bunban} ${row.kwamokname}`;

  const requirement_type = REQUIREMENT_TYPE_MAP[row.isugubun.trim()];
  if (!requirement_type) warnings.push(`${id}: 매핑 없는 이수구분 "${row.isugubun}"`);

  const delivery_method = DELIVERY_METHOD_MAP[row.kwamok_gubun.trim()];
  if (!delivery_method) warnings.push(`${id}: 매핑 없는 수업방식 "${row.kwamok_gubun}"`);

  const day_or_night = JUYA_MAP[row.juya.trim()];
  if (!day_or_night) warnings.push(`${id}: 매핑 없는 주야 "${row.juya}"`);

  const gradeText = row.haknean.trim();
  const grade = gradeText === "전학년" ? 0 : Number(gradeText);
  if (Number.isNaN(grade)) warnings.push(`${id}: 해석할 수 없는 학년 "${row.haknean}"`);

  const credit = Number(row.hakjum.trim());
  if (Number.isNaN(credit)) warnings.push(`${id}: 해석할 수 없는 학점 "${row.hakjum}"`);

  const limitText = row.haknean_limit.trim();
  const grade_limit = limitText ? Number(limitText) : null;
  if (Number.isNaN(grade_limit)) warnings.push(`${id}: 해석할 수 없는 학년제한 "${row.haknean_limit}"`);

  const plan = row.plan.trim();
  const { online_hour, offline_schedules } = parseClassroom(row.classroom);

  return {
    course: {
      code: row.kwamokcode.trim(),
      name: row.kwamokname.replace(/\s+/g, " ").trim(),
      credit,
      requirement_type,
      grade,
      grade_limit,
      section: row.bunban.trim(),
      delivery_method,
      day_or_night,
      professors: row.prof.trim(),
      online_hour,
      plan_code: plan && plan.toLowerCase() !== "x" ? plan : null,
      remark: row.bigo.trim() || null,
      classroom_raw: row.classroom,
      offline_schedules,
    },
    warnings,
  };
}
