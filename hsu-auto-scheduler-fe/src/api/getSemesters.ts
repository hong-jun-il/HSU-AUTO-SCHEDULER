import { ResponseType } from "@/types/response.type";
import { SemesterType } from "@/types/semester.type";

export async function getSemesters(): Promise<ResponseType<SemesterType[]>> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/schedule/get-semesters`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        tags: ["semesters"],
      },
      cache: "force-cache",
    },
  );

  if (!res.ok) {
    throw new Error("Get Semesters HTTP ERROR!");
  }

  return res.json();
}
