"use client";

import {
  CPSATFilterDefaultValues,
  CPSATFilterSchema,
} from "@/types/schemas/filter.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";

type Props = {
  children: ReactNode;
};

export default function CPSATFilterFormProvider({ children }: Props) {
  const method = useForm({
    mode: "all",
    resolver: zodResolver(CPSATFilterSchema),
    defaultValues: CPSATFilterDefaultValues,
  });

  return <FormProvider {...method}>{children}</FormProvider>;
}
