"use client";

import useGetCourses from "@/hooks/queries/useGetCourses";
import { useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import CourseFiltersContainer from "./course/filters/CourseFiltersContainer";
import {
  CourseFilterType,
  CPSATFilterType,
} from "@/types/schemas/filter.schema";
import CourseListContainer from "./course/list/CourseListContainer";

export default function CourseTab() {
  const [search, setSearch] = useState<string>("");

  const { control: courseFilterControl } = useFormContext<CourseFilterType>();
  const { control: CPSATFilterControl } = useFormContext<CPSATFilterType>();

  const [
    semester_id,
    major_id,
    grade,
    day_or_night,
    no_class_days,
    has_lunch_break,
    personal_schedules,
    selected_courses,
  ] = useWatch({
    control: courseFilterControl,
    name: [
      "semester_id",
      "major_id",
      "grade",
      "day_or_night",
      "no_class_days",
      "has_lunch_break",
      "personal_schedules",
      "selected_courses",
    ],
  });

  const maxCredit = useWatch({
    control: CPSATFilterControl,
    name: "max_credit",
  });

  const filters: CourseFilterType = useMemo(() => {
    return {
      semester_id,
      major_id: major_id || null,
      search: search || null,
      grade: grade || null,
      day_or_night: day_or_night || null,
      no_class_days,
      has_lunch_break,
      personal_schedules,
      selected_courses,
    };
  }, [
    semester_id,
    major_id,
    search,
    grade,
    day_or_night,
    no_class_days,
    has_lunch_break,
    personal_schedules,
    selected_courses,
  ]);

  const { data, isLoading, hasNextPage, fetchNextPage } =
    useGetCourses(filters);

  const courses = data?.pages;

  const hasEnoughData = useMemo(() => {
    if (!courses) return false;

    let sum = 0;
    for (const course of courses) {
      sum += course.credit;
      if (sum >= maxCredit) return true;
    }

    return false;
  }, [courses, maxCredit]);

  return (
    <div className="h-full w-full space-y-8">
      <CourseFiltersContainer
        hasEnoughData={hasEnoughData}
        search={search}
        setSearch={setSearch}
      />
      <CourseListContainer
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isLoading={isLoading}
        courses={data?.pages}
      />
    </div>
  );
}
