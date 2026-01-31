"use client";

import { SelectOptionType } from "@/types/selectOption.type";
import {
  Controller,
  FieldValues,
  Path,
  PathValue,
  useFormContext,
} from "react-hook-form";
import CustomSelectBox from "../ui/CustomSelectBox";
import useFocusState from "@/hooks/common/useFocusState";
import CloseIcon from "@/assets/icons/CloseIcon";
import clsx from "clsx";
import { courseFilterDefaultValues } from "@/types/schemas/filter.schema";

type Props<T extends FieldValues> = {
  name: Path<T>;
  items: SelectOptionType[];
  labelText: string;
  placeholder: string;
  className?: string;
};

export default function RHFCustomSelectForMobile<T extends FieldValues>({
  name,
  items,
  labelText,
  placeholder,
  className,
}: Props<T>) {
  const {
    control,
    formState: { errors },
    getValues,
    setValue,
  } = useFormContext<T>();

  const { onFocus, onBlur } = useFocusState();

  const handleOnBlurOverride = (RHFOnBlur: () => void) => {
    onBlur();
    RHFOnBlur();
  };

  const handleResetField = () => {
    setValue(
      name,
      courseFilterDefaultValues[
        name as keyof typeof courseFilterDefaultValues
      ] as PathValue<T, Path<T>>,
    );
  };

  const value = getValues(name);

  return (
    <div className="">
      <label
        htmlFor={name}
        className={clsx("block", "text-hsu text-xs font-semibold", "mb-2 ml-2")}
      >
        {labelText}
      </label>
      <div className="relative">
        {value && (
          <button
            className="absolute top-1/2 right-5 z-20 -translate-y-1/2"
            onClick={handleResetField}
          >
            <CloseIcon width={12} />
          </button>
        )}
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <CustomSelectBox
              {...field}
              id={name}
              items={items}
              placeholder={placeholder}
              className={clsx(
                "w-full truncate pr-10",
                className,
                value && "appearance-none",
              )}
              onFocus={onFocus}
              onBlur={() => handleOnBlurOverride(field.onBlur)}
            />
          )}
        />
      </div>
      {errors[name] && (
        <p className="text-xxs pl-3 whitespace-nowrap text-red-600">
          {String(errors[name].message)}
        </p>
      )}
    </div>
  );
}
