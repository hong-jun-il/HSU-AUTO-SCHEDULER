"use client";

import CloseIcon from "@/assets/icons/CloseIcon";
import Portal from "@/components/Portal";
import { CustomInput } from "@/components/ui/CustomInput";
import clsx from "clsx";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";

type Props = {
  closeSearchModal: () => void;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
};

export default function SearchModal({
  closeSearchModal,
  search,
  setSearch,
}: Props) {
  const [tempSearch, setTempSearch] = useState<string>(search || "");

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const searchTerm = tempSearch.trim();

    if (searchTerm.length < 2) {
      alert("검색어는 두 글자 이상 입력해주세요.");
      return;
    }

    setSearch(searchTerm);
    closeSearchModal();
  };

  return (
    <Portal>
      <div
        className={clsx(
          "flex items-center justify-center",
          "h-dvh w-full",
          "fixed top-0 left-0 bg-black/30",
          "z-(--z-index-no-class-days-modal)",
        )}
        onClick={closeSearchModal}
      >
        <form
          className={clsx(
            "z-[9999] space-y-5 bg-white p-12",
            "w-[90%] max-w-200",
          )}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onSubmit={handleSearch}
        >
          <div className={clsx("mb-10 flex items-center justify-between")}>
            <label
              htmlFor="tempSearch"
              className="w-full text-lg max-md:text-sm"
            >
              검색
            </label>
            <div
              className={clsx(
                "relative cursor-pointer",
                "aspect-square w-10 max-md:w-8",
              )}
              onClick={closeSearchModal}
            >
              <CloseIcon />
            </div>
          </div>

          <CustomInput
            type="search"
            name="tempSearch"
            id="tempSearch"
            autoFocus
            className={clsx("w-full max-w-none !text-sm")}
            placeholder="전공코드, 강의명, 교수 검색"
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
          />

          <div className="flex w-full justify-end">
            <button
              className={clsx(
                "bg-hsu",
                "text-xs text-white",
                "rounded-[18px] border",
                "px-5 py-3",
              )}
            >
              검색
            </button>
          </div>
        </form>
      </div>
    </Portal>
  );
}
