/* 
    개인 스케줄 모달을 열고 닫는데 필요한 dispatch들을 모아놓은 훅
    개인 스케줄 추가, 수정, 닫기, 삭제 버튼의 상태 관리 및 액션들을 담당

    수정 시 수정 대상의 개인 스케줄을 selectedPersonalSchedule라는 전역 상태로 관리하는 이유는
    usePersonalScheduleModal은 useFormContext로 묶인 modal의 외부에서 호출하는 훅인데,
    useFormContext의 reset을 호출해버리면 폼 컨텍스트 범위 외부에서 호출하는 일이 되어버리기 때문.
    selectedPersonalSchedule에 타겟을 설정하고, 폼 내부의 데이터 및 액션을 다루는 usePersonalScheduleForm에서
    해당 전역 상태를 읽어서 reset으로 데이터를 초기화 시키고, 이후 저장 및 취소 등을 하였을 때 이 훅의 handleClosePersonalScheduleModal를 호출하여 모든 상태 복구
*/

import { useTimetableStore } from "@/store/timetable/timetableStore";
import { useShallow } from "zustand/shallow";
import useUnmarkPersonalSchedule from "./useUnmarkPersonalSchedule";
import useCurrentSemester from "../../common/useCurrentSemester";

export default function usePersonalScheduleModal() {
  const currentSemester = useCurrentSemester();

  const {
    setPersonalScheduleModalOpen,
    setSelectedPersonalSchedule,
    setFormType,
    setPersonalScheduleModalClose,
    personalSchedules,
  } = useTimetableStore(
    useShallow((state) => ({
      setPersonalScheduleModalOpen: state.setPersonalScheduleModalOpen,
      setSelectedPersonalSchedule: state.setSelectedPersonalSchedule,
      setFormType: state.setFormType,
      setPersonalScheduleModalClose: state.setPersonalScheduleModalClose,
      personalSchedules: state.personalSchedules,
    })),
  );

  const { deletePersonalScheduleAndUnMark } = useUnmarkPersonalSchedule();

  // 개인 스케줄 추가: 모달 열기, 수정 모드로 전환
  const handleAddPersonalSchedule = () => {
    setPersonalScheduleModalOpen();
    setFormType("add");
  };

  // 개인 스케줄 수정: 타겟 개인 스케줄 초기화, 모달 열기, 수정 모드로 전환
  const handleEditPersonalSchedule = (targetId: string) => {
    const targetPersonalSchedule = personalSchedules[currentSemester].find(
      (ps) => ps.id === targetId,
    );

    if (targetPersonalSchedule) {
      setSelectedPersonalSchedule(targetPersonalSchedule);
      setPersonalScheduleModalOpen();
      setFormType("edit");
    }
  };

  // 개인 스케줄 삭제: 개인 스케줄 목록에서 삭제, 타임셀렉션 언마킹
  const handleDeletePersonalSchedule = (
    targetPersonalScheduleId: string,
    personalScheduleName: string,
  ) => {
    deletePersonalScheduleAndUnMark(
      targetPersonalScheduleId,
      personalScheduleName,
    );
  };

  // 개인 스케줄 닫기: selectedPersonalSchedule을 null로 초기화, add 모드로 변경, 모달 닫기
  const handleClosePersonalScheduleModal = () => {
    setSelectedPersonalSchedule(null);
    setFormType("add");
    setPersonalScheduleModalClose();
  };

  return {
    handleAddPersonalSchedule,
    handleEditPersonalSchedule,
    handleDeletePersonalSchedule,
    handleClosePersonalScheduleModal,
  };
}
