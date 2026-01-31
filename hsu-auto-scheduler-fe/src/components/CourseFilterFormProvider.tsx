"use client";

import {
  courseFilterDefaultValues,
  courseFilterSchema,
} from "@/types/schemas/filter.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";

type Props = {
  children: ReactNode;
};

export default function CourseFilterFormProvider({ children }: Props) {
  const method = useForm({
    mode: "all",
    resolver: zodResolver(courseFilterSchema),
    defaultValues: courseFilterDefaultValues,
  });

  return <FormProvider {...method}>{children}</FormProvider>;
}
