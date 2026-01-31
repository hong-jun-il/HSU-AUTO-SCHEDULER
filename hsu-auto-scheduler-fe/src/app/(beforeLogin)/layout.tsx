import { ReactNode } from "react";
import CourseFinder from "./timetable/_components/finder/CourseFinder";
import TimeTableEditButton from "./timetable/_components/table/TimeTableEditButton";

type Props = {
  children: ReactNode;
};

export default async function BeforeLoginLayout({ children }: Props) {
  return (
    <>
      <main className="flex max-h-dvh justify-center overflow-y-auto">
        {children}
      </main>
      <CourseFinder />
      <TimeTableEditButton />
    </>
  );
}
