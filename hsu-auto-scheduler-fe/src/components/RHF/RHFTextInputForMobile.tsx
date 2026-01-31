"use client";

import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";
import { ComponentProps, FocusEvent } from "react";
import { CustomInput } from "../ui/CustomInput";
import clsx from "clsx";

type Props<T extends FieldValues> = {
  id: string;
  name: Path<T>;
  labelText: string;
  fixValueFuncOnBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
} & ComponentProps<"input">;

export default function RHFTextInputForMobile<T extends FieldValues>({
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

  // event를 받아서 onBlur에 넘겨주고, 상태 변경 처리
  const handleInputOnBlurOverride = (
    e: React.FocusEvent<HTMLInputElement>,
    RHFOnBlur: () => void,
  ) => {
    if (fixValueFuncOnBlur) {
      fixValueFuncOnBlur(e);
    }

    RHFOnBlur();
  };

  return (
    <div className="text-xs">
      <label
        htmlFor={id}
        className={clsx("block", "text-hsu text-xs font-semibold", "mb-2 ml-2")}
      >
        {labelText}
      </label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <CustomInput
            {...field}
            type={type || "text"}
            id={id}
            className={clsx("", className)}
            onBlur={(e) => handleInputOnBlurOverride(e, field.onBlur)}
            {...props}
          />
        )}
      />
      {errors[name] && (
        <p className="text-xxs pl-2 text-red-600">
          {String(errors[name].message)}
        </p>
      )}
    </div>
  );
}
