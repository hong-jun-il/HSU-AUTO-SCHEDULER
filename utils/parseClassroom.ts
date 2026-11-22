import { WeekdayEnum } from "../type/enums/weekday.enum";
import { TimePlaceDBType } from "../type/timeplace.type";

/*
 * 종정시 classroom 문자열 → 온라인 시간 + 오프라인 시간표
 *
 *   "탐구관307  수4~5,목2M~3M"
 *   "상상관503 월8M~9M / 상상관604 수8M~9M"
 *   "온라인강좌 1.5시간 / 상상관603 수8M~9M"
 *   "온라인강좌 3시간", "사이버", " "  → 오프라인 시간표 없음
 *
 * 교시 규칙 (2026-2학기 전 강의 1,487개를 에브리타임 시간표와 대조해 확인)
 *   - 주간 N교시(1~9): (8+N):00부터 60분. 앞 30분이 "N", 뒤 30분이 "NM".
 *   - 야간 N교시(10~): 18:00 + (N-10)*55분부터 55분. 반쪽(27.5분)은 5분 단위로 반올림.
 *   - "a~b" = a의 시작부터 b의 끝까지.
 *   - 예외: 14M 종료는 22:30 (에브리타임 1건 기준, 공식 시간표로 미확인).
 */

const DAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;
const WEEKDAYS: WeekdayEnum[] = [
  WeekdayEnum.MON,
  WeekdayEnum.TUE,
  WeekdayEnum.WED,
  WeekdayEnum.THU,
  WeekdayEnum.FRI,
  WeekdayEnum.SAT,
  WeekdayEnum.SUN,
];

// 시간 토큰 없이 오는 것으로 확인된 값들 → 오프라인 시간표 없음
const NO_SCHEDULE_SEGMENTS = new Set(["", "사이버"]);

const round5 = (minutes: number) => Math.round(minutes / 5) * 5;

// 교시 라벨("4", "4M", "12M") → 분 단위 [시작, 끝]
export function periodToMinutes(label: string): { start: number; end: number } {
  const m = label.match(/^(\d+)(M?)$/);
  if (!m) throw new Error(`알 수 없는 교시: "${label}"`);
  const n = Number(m[1]);
  const isSecondHalf = m[2] === "M";
  if (n < 1 || n > 14) throw new Error(`범위를 벗어난 교시: "${label}"`);

  const slotStart = n < 10 ? (8 + n) * 60 : 18 * 60 + (n - 10) * 55;
  const slotLength = n < 10 ? 60 : 55;
  const half = slotLength / 2;

  const start = round5(slotStart + (isSecondHalf ? half : 0));
  let end = round5(slotStart + (isSecondHalf ? slotLength : half));
  if (label === "14M") end = 22 * 60 + 30;

  return { start, end };
}

const TIME_TOKEN = /^([월화수목금토일])(\d+M?)~(\d+M?)$/;

export function parseClassroom(classroom: string): {
  online_hour: number;
  offline_schedules: TimePlaceDBType[];
} {
  let online_hour = 0;
  const offline_schedules: TimePlaceDBType[] = [];

  for (const rawSegment of classroom.split(" / ")) {
    const segment = rawSegment.trim();

    const online = segment.match(/^온라인강좌\s*([\d.]+)\s*시간$/);
    if (online) {
      online_hour = Number(online[1]);
      continue;
    }
    if (NO_SCHEDULE_SEGMENTS.has(segment)) continue;

    // "장소 시간토큰,시간토큰" — 장소에는 공백이 들어갈 수 있어서 마지막 덩어리를 시간으로 본다
    const m = segment.match(/^(.*?)\s+(\S+)$/);
    const tokens = m ? m[2].split(",") : [];
    if (!m || !tokens.every((t) => TIME_TOKEN.test(t))) {
      throw new Error(`해석할 수 없는 강의실/시간: "${segment}" (원문: "${classroom}")`);
    }

    const place = m[1].replace(/\s+/g, " ").trim();
    for (const token of tokens) {
      const [, day, from, to] = token.match(TIME_TOKEN)!;
      const start_time = periodToMinutes(from).start;
      const end_time = periodToMinutes(to).end;
      if (end_time <= start_time) {
        throw new Error(`시작이 끝보다 늦은 시간: "${token}" (원문: "${classroom}")`);
      }
      offline_schedules.push({
        day: WEEKDAYS[DAYS.indexOf(day as (typeof DAYS)[number])],
        start_time,
        end_time,
        place,
      });
    }
  }

  return { online_hour, offline_schedules };
}
