import { redirect } from "next/navigation";

export default function BeforeLogin() {
  redirect("/timetable");
}
