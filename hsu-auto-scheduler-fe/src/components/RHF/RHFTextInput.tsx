"use client";

import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";
import { ComponentProps, FocusEvent } from "react";
import { CustomInput } from "../ui/CustomInput";
import clsx from "clsx";
import useFocusState from "@/hooks/common/useFocusState";

type Props<T extends FieldValues> = {
  id: string;
  name: Path<T>;
  labelText: string;
  fixValueFuncOnBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
} & ComponentProps<"input">;

export default function RHFTextInput<T extends FieldValues>({
  type,
  id,
  name,
  labelText,
  fixValueFuncOnBlur,
  className,
  ...props
}: Props<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const { isFocus, onFocus, onBlur } = useFocusState();

  // event를 받아서 onBlur에 넘겨주고, 상태 변경 처리
  const handleInputOnBlurOverride = (
    e: React.FocusEvent<HTMLInputElement>,
    RHFOnBlur: () => void,
  ) => {
    if (fixValueFuncOnBlur) {
      fixValueFuncOnBlur(e);
    }

    RHFOnBlur();
    onBlur();
  };

  return (
    <div className="h-16 text-xs">
      <label
        htmlFor={id}
        className={clsx(
          "flex h-full cursor-pointer items-center gap-2 rounded-lg px-3",
          "border-border-hsu bg-light-hsu border-2 transition-colors duration-200",
          isFocus && "border-hsu",
        )}
      >
        <span className="inline-block whitespace-nowrap">{labelText}</span>
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <CustomInput
              {...field}
              type={type || "text"}
              id={id}
              className={clsx("rounded-0 !h-fit border-none !p-0", className)}
              onFocus={onFocus}
              onBlur={(e) => handleInputOnBlurOverride(e, field.onBlur)}
              {...props}
            />
          )}
        />
      </label>
      {errors[name] && (
        <p className="pl-2 text-red-600">{String(errors[name].message)}</p>
      )}
    </div>
  );
}
