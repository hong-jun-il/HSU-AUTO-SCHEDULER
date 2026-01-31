/* 
  개인 스케줄 폼 내부의 데이터 상태 관리와 dispatch들을 모아놓은 훅
  일정 추가, 삭제, 제출, 수정 시 초기화 세팅을 담당
*/

import { OfflineScheduleType } from "@/types/schemas/offline_schedule.schema";
import {
  createOfflineScheduleDefaultValue,
  PersonalScheduleType,
} from "@/types/schemas/personal_schedule.schema";
import { SubmitHandler, useFieldArray, useFormContext } from "react-hook-form";
import useMarkPersonalSchedule from "./useMarkPersonalSchedule";
import { useTimetableStore } from "@/store/timetable/timetableStore";
import { useShallow } from "zustand/shallow";
import { useLayoutEffect } from "react";
import usePersonalScheduleModal from "./usePersonalScheduleModal";
import useCurrentSemester from "../../common/useCurrentSemester";
import useRemarkPersonalSchedule from "./useRemarkPersonalSchedule";

export default function usePersonalScheduleForm() {
  const currentSemester = useCurrentSemester();

  const {
    ensurePersonalSchedulesSemesterInitialized,
    formType,
    selectedPersonalSchedule,
    setSelectedPersonalSchedule,
    ensureTimeSelectionInitialized,
  } = useTimetableStore(
    useShallow((state) => ({
      ensurePersonalSchedulesSemesterInitialized:
        state.ensurePersonalSchedulesSemesterInitialized,
      ensureTimeSelectionInitialized: state.ensureTimeSelectionInitialized,
      formType: state.formType,
      selectedPersonalSchedule: state.selectedPersonalSchedule,
      setSelectedPersonalSchedule: state.setSelectedPersonalSchedule,
      updatePersonalSchedule: state.updatePersonalSchedule,
    })),
  );

  const { control, setValue, handleSubmit, reset } =
    useFormContext<PersonalScheduleType>();
  const { append, fields, remove } = useFieldArray({
    control,
    name: "offline_schedules",
  });
  const { addPersonalScheduleAndMark } = useMarkPersonalSchedule();
  const { updatePersonalScheduleAndRemark } = useRemarkPersonalSchedule();
  const { handleClosePersonalScheduleModal } = usePersonalScheduleModal();

  useLayoutEffect(() => {
    if (formType === "edit" && selectedPersonalSchedule) {
      reset(selectedPersonalSchedule);
    } else {
      setSelectedPersonalSchedule(null);
    }
  }, [formType, selectedPersonalSchedule, reset, setSelectedPersonalSchedule]);

  const onAppend = () => {
    ensurePersonalSchedulesSemesterInitialized(currentSemester);
    ensureTimeSelectionInitialized(currentSemester);
    append(createOfflineScheduleDefaultValue());
  };

  const onRemove = (index: number) => {
    if (fields.length === 1) {
      alert("개인 스케줄에는 최소 하나의 일정이 있어야 합니다!");
      return;
    }

    remove(index);
  };

  const onChange = (
    index: number,
    fieldName: keyof OfflineScheduleType,
    value: OfflineScheduleType[keyof OfflineScheduleType],
  ) => {
    setValue(`offline_schedules.${index}.${fieldName}`, value);
  };

  const onSubmit: SubmitHandler<PersonalScheduleType> = (data) => {
    if (formType === "add") {
      const { success, message } = addPersonalScheduleAndMark(data);

      if (!success) {
        alert(message);
        return;
      }
    } else {
      const { success, message } = updatePersonalScheduleAndRemark(data);

      if (!success) {
        alert(message);
        return;
      }
    }

    handleClosePersonalScheduleModal();
  };

  const submitHandler = handleSubmit(onSubmit);

  return { control, fields, onAppend, onRemove, onChange, submitHandler };
}
