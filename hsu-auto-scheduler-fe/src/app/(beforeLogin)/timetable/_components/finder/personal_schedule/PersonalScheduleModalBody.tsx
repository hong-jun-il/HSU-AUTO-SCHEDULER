import { CustomInput } from "@/components/ui/CustomInput";
import clsx from "clsx";
import PersonalScheduleItem from "./PersonalScheduleItem";
import { Control, Controller, FieldArrayWithId } from "react-hook-form";
import { PersonalScheduleType } from "@/types/schemas/personal_schedule.schema";
import { OfflineScheduleType } from "@/types/schemas/offline_schedule.schema";

type Props = {
  control: Control<PersonalScheduleType>;
  fields: FieldArrayWithId<PersonalScheduleType>[];
  onAppend: () => void;
  onRemove: (index: number) => void;
  onChange: (
    index: number,
    fieldName: keyof OfflineScheduleType,
    value: OfflineScheduleType[keyof OfflineScheduleType],
  ) => void;
};

export default function PersonalScheduleModalBody({
  control,
  fields,
  onAppend,
  onRemove,
  onChange,
}: Props) {
  return (
    <div className="p-10">
      <div className="flex flex-col gap-10">
        <div>
          <label
            htmlFor="personal_schedule_name"
            className="text-hsu mb-5 block text-sm font-semibold"
          >
            스케줄 이름
          </label>
          <Controller
            name="personal_schedule_name"
            control={control}
            render={({ field }) => (
              <CustomInput
                {...field}
                id="personal_schedule_name"
                placeholder="예) 알바"
                maxLength={20}
                className="focus:border-deep-hsu focus:bg-white focus:shadow-[0_0_0_3px_rgba(68,114,196,0.1)]"
              />
            )}
          />
        </div>

        <div className="bg-light-hsu border-border-hsu max-h-[60dvh] overflow-y-auto rounded-lg border-2 p-7">
          <div className="mb-8 flex items-center justify-between">
            <span className="text-hsu text-sm font-semibold">일정 목록</span>
            <button
              type="button"
              className={clsx(
                "rounded-lg px-5 py-4 text-xs font-semibold text-white transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(40,167,69,0.3)]",
                "disabled:cursor-not-allowed",
                "bg-[linear-gradient(135deg,_#28a745_0%,_#20c997_100%)]",
                "disabled:pointer-events-none disabled:opacity-0",
              )}
              onClick={onAppend}
              disabled={fields.length === 5}
            >
              + 일정 추가
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {fields.map((field, index) => (
              <PersonalScheduleItem
                key={field.id}
                index={index}
                control={control}
                onRemove={onRemove}
                onChange={onChange}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
