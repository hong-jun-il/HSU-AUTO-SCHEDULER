import { MajorDBType } from "../../type/major.type";

export async function postMajors(semesterId: string, majors: MajorDBType[]) {
  const res = await fetch(`${process.env.BASE_URL}/crawler/save-majors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      semesterId,
      majors,
    }),
  });

  if (!res.ok) {
    throw new Error(`Post Majors HTTP ERROR! (${res.status})`);
  }

  return res.json();
}
