import SpinSangSangBoogi from "@/components/ui/SpinSangSangBoogi";

export default function CourseListLoading() {
  return (
    <div className="flex h-[calc(100%-36px)] w-full flex-col items-center justify-center text-2xl">
      <SpinSangSangBoogi className="w-30" />
      로딩중...
    </div>
  );
}
