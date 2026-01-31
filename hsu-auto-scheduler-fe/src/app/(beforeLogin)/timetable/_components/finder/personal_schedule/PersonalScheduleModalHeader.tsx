import CloseIcon from "@/assets/icons/CloseIcon";
import { useTimetableStore } from "@/store/timetable/timetableStore";
import clsx from "clsx";
import { useShallow } from "zustand/shallow";

type Props = {
  handleClosePersonalScheduleModal: () => void;
};

export default function PersonalScheduleModalHeader({
  handleClosePersonalScheduleModal,
}: Props) {
  const { formType } = useTimetableStore(
    useShallow((state) => ({
      formType: state.formType,
    })),
  );

  return (
    <div className="bg-hsu/90 flex items-center justify-between px-10 py-6">
      <h3 className="max-md:text-md text-lg font-bold text-white max-sm:text-base">
        {formType === "edit" ? "개인 스케줄 변경" : "개인 스케줄 추가"}
      </h3>
      <div
        className={clsx(
          "w-14 cursor-pointer rounded-full bg-white/20 p-4 transition-all duration-200",
          "hover:rotate-z-90 hover:bg-white/30",
        )}
        onClick={handleClosePersonalScheduleModal}
      >
        <CloseIcon fill="white" />
      </div>
    </div>
  );
}
