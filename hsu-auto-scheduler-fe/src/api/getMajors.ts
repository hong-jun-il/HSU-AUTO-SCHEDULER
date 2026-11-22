import { MajorType } from "@/types/major.type";
import { ResponseType } from "@/types/response.type";

export default async function getMajors(
  semester: string,
): Promise<ResponseType<MajorType[]>> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/semesters/${semester}/majors`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        tags: ["majors", `${semester}`],
      },
      // cache: "force-cache",
    },
  );

  if (!res.ok) {
    throw new Error("Get Majors HTTP ERROR!");
  }

  return res.json();
}
