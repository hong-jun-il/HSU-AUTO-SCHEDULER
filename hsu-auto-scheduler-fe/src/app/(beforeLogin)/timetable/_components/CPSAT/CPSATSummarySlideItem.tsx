"use client";

import { RequirementTypeKorMap } from "@/enums/requirement_type.enum";
import { WeekdayKorMap, WeekdayOrder } from "@/enums/weekday.enum";
import { CPSATSolutionType } from "@/types/CPSATSolution.type";
import { formatTimeString } from "@/utils/formatTimeString";
import clsx from "clsx";

type Props = {
  result: CPSATSolutionType;
};

export default function CPSATSummarySlideItem({ result }: Props) {
  const noClassDaysInKor = result.no_class_days.map(
    (day) => WeekdayKorMap[day],
  );
  const summaryItems = [
    { label: "총 학점", value: `${result.total_credit}학점` },
    { label: "전기", value: `${result.total_major_basic_credit}학점` },
    { label: "전필", value: `${result.total_major_required_credit}학점` },
    { label: "전선", value: `${result.total_major_elective_credit}학점` },
    {
      label: "오프라인 강의",
      value: `${result.total_offline_course_count}과목`,
    },
    { label: "온라인 강의", value: `${result.total_online_course_count}과목` },
    { label: "공강 요알", value: `${noClassDaysInKor.join(", ")}` },
    {
      label: "강의 간 간격 총 합",
      value: `${Math.floor(result.total_course_gap / 60)}시간 ${result.total_course_gap % 60}분`,
    },
  ];

  return (
    <div className={clsx("flex shrink-0 flex-col gap-10", "h-full w-full p-5")}>
      <div
        className={clsx(
          "border-border-hsu rounded-2xl border-2 p-10",
          "bg-light-hsu",
        )}
      >
        <h3
          className={clsx(
            "mb-8 flex items-center gap-3",
            "text-hsu font-bold",
            "text-base max-sm:text-sm",
          )}
        >
          <span
            className={clsx(
              "h-10 w-10 rounded-full",
              "flex items-center justify-center",
              "text-xxs text-white",
              "bg-hsu",
            )}
          >
            📊
          </span>
          시간표 통계
        </h3>

        <ul
          className={clsx(
            "grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-10",
          )}
        >
          {summaryItems.map((item, i) => (
            <li
              key={i}
              className={clsx(
                "rounded-xl bg-white px-7 py-5",
                "border-border-hsu border",
              )}
            >
              <h4 className="text-course-info-text-base-gray mb-2 text-xs">
                {item.label}
              </h4>
              <div className="text-hsu text-sm font-bold">{item.value}</div>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={clsx(
          "border-border-hsu rounded-2xl border-2 p-10",
          "bg-light-hsu",
        )}
      >
        <h3
          className={clsx(
            "mb-8 flex items-center gap-3",
            "text-hsu font-bold",
            "text-base max-sm:text-sm",
          )}
        >
          <span
            className={clsx(
              "h-10 w-10 rounded-full",
              "flex items-center justify-center",
              "text-xxs text-white",
              "bg-hsu",
            )}
          >
            📊
          </span>
          과목별 상세 정보
        </h3>

        <ul className="space-y-3">
          {result.selected_courses.map((selectedCourse) => {
            const offlineScheduleString = selectedCourse.offline_schedules
              .sort((a, b) => WeekdayOrder[a.day] - WeekdayOrder[b.day])
              .map((os) => {
                const startTimeString = formatTimeString(os.start_time);
                const endTimeString = formatTimeString(os.end_time);

                const day = WeekdayKorMap[os.day];

                return `${day} ${startTimeString}~${endTimeString}`;
              });

            return (
              <li
                key={selectedCourse.id}
                className={clsx(
                  "border-border-hsu-100 rounded-xl border",
                  "bg-white px-10 py-5",
                  "font-bold",
                  "flex items-center gap-3",
                  "max-sm:flex-col max-sm:items-start max-sm:justify-center",
                )}
              >
                <span
                  className={clsx(
                    "text-[#333]",
                    "whitespace-nowrap",
                    "text-sm max-sm:text-xs",
                  )}
                >
                  {selectedCourse.name}({selectedCourse.section})(
                  {selectedCourse.requirement_types
                    .map((rt) => RequirementTypeKorMap[rt])
                    .join("/")}
                  )
                </span>

                <span
                  className={clsx("text-[#333]", "max-sm:text-xxs text-xs")}
                >
                  {selectedCourse.professors}
                </span>

                <p
                  className={clsx(
                    "text-hsu",
                    "flex gap-3",
                    "max-sm:text-xxs text-xs",
                    "max-sm:flex-col",
                  )}
                >
                  {offlineScheduleString.map((off, i) => (
                    <span key={i} className="whitespace-nowrap">
                      {off}
                    </span>
                  ))}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
