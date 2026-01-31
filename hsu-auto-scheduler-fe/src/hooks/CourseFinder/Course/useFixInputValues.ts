import {
  CPSATFilterDefaultValues,
  CPSATFilterType,
} from "@/types/schemas/filter.schema";
import { FocusEvent } from "react";
import { useFormContext } from "react-hook-form";

export default function useFixInputValues() {
  const { setValue } = useFormContext<CPSATFilterType>();

  const fixValueMaxCreditOnBlur = (event: FocusEvent<HTMLInputElement>) => {
    const maxCredit = event.target.value;

    if (maxCredit === "") {
      alert("최대 학점을 입력해주세요.");
      setValue("max_credit", CPSATFilterDefaultValues.max_credit);
      return;
    }

    if (+maxCredit <= 0 || +maxCredit > 21) {
      alert("최대 학점은 0학점 이상 혹은 21학점 이하여야 합니다.");
      setValue("max_credit", CPSATFilterDefaultValues.max_credit);
      return;
    }
  };

  const fixValueMajorBasicOnBlur = (event: FocusEvent<HTMLInputElement>) => {
    const majorFoundation = event.target.value;

    if (majorFoundation === "") {
      setValue("major_basic", CPSATFilterDefaultValues.major_basic);
      return;
    }

    if (+majorFoundation < 0 || +majorFoundation > 21) {
      alert("전공 기초는 0학점 이상 혹은 21학점 이하여야 합니다.");
      setValue("major_basic", CPSATFilterDefaultValues.major_basic);
      return;
    }
  };

  const fixValueMajorRequired = (event: FocusEvent<HTMLInputElement>) => {
    const majorRequired = event.target.value;

    if (majorRequired === "") {
      setValue("major_required", CPSATFilterDefaultValues.major_required);
      return;
    }

    if (+majorRequired < 0 || +majorRequired > 21) {
      alert("전공 필수는 0학점 이상 혹은 21학점 이하여야 합니다.");
      setValue("major_required", CPSATFilterDefaultValues.major_required);
      return;
    }
  };

  const fixValueMajorElective = (event: FocusEvent<HTMLInputElement>) => {
    const majorElective = event.target.value;

    if (majorElective === "") {
      setValue("major_elective", CPSATFilterDefaultValues.major_elective);
      return;
    }

    if (+majorElective < 0 || +majorElective > 21) {
      alert("전공 선택은 0학점 이상 혹은 21학점 이하여야 합니다.");
      setValue("major_elective", CPSATFilterDefaultValues.major_elective);
      return;
    }
  };

  const fixValueDailyLectureLimit = (event: FocusEvent<HTMLInputElement>) => {
    const dailyLectureLimit = event.target.value;

    if (dailyLectureLimit === "") {
      alert("하루 최대 강의 수를 입력해주세요.");
      setValue(
        "daily_lecture_limit",
        CPSATFilterDefaultValues.daily_lecture_limit,
      );
      return;
    }

    if (+dailyLectureLimit <= 0) {
      alert(
        "하루 강의는 1개 이상이어야 합니다. 공강을 원하시면 공강 요일을 선택해주세요.",
      );
      setValue(
        "daily_lecture_limit",
        CPSATFilterDefaultValues.daily_lecture_limit,
      );
      return;
    }
  };

  return {
    fixValueMaxCreditOnBlur,
    fixValueMajorBasicOnBlur,
    fixValueMajorRequired,
    fixValueMajorElective,
    fixValueDailyLectureLimit,
  };
}
