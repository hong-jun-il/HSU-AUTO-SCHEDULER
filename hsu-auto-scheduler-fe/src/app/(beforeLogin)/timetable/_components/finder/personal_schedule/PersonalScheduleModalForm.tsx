"use client";

import usePersonalScheduleForm from "@/hooks/CourseFinder/PersonalSchedule/usePersonalScheduleForm";
import PersonalScheduleModalBody from "./PersonalScheduleModalBody";
import PersonalScheduleModalFooter from "./PersonalScheduleModalFooter";
import PersonalScheduleModalHeader from "./PersonalScheduleModalHeader";
import usePersonalScheduleModal from "@/hooks/CourseFinder/PersonalSchedule/usePersonalScheduleModal";

export default function PersonalScheduleModalForm() {
  const { handleClosePersonalScheduleModal } = usePersonalScheduleModal();
  const { control, fields, onAppend, onRemove, onChange, submitHandler } =
    usePersonalScheduleForm();

  return (
    <form
      className="w-[90dvw] max-w-300 overflow-hidden rounded-3xl bg-white"
      onClick={(e) => e.stopPropagation()}
      onSubmit={submitHandler}
    >
      <PersonalScheduleModalHeader
        handleClosePersonalScheduleModal={handleClosePersonalScheduleModal}
      />
      <PersonalScheduleModalBody
        control={control}
        fields={fields}
        onAppend={onAppend}
        onRemove={onRemove}
        onChange={onChange}
      />
      <PersonalScheduleModalFooter
        handleClosePersonalScheduleModal={handleClosePersonalScheduleModal}
      />
    </form>
  );
}
