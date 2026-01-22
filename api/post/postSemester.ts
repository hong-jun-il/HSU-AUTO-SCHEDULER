import { SemesterType } from "../../type/semester.type";

export async function postSemester({ year, term }: SemesterType) {
  const res = await fetch(`${process.env.BASE_URL}/crawler/save-semester`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      year,
      term,
    }),
  });

  if (!res.ok) {
    throw new Error(`Post Semester: ${year}-${term} HTTP ERROR!`);
  }

  return res.json();
}
