import { SemesterType } from "../../type/semester.type";

export async function postSemester(semester: string) {
  const [year, term] = semester.split("-");
  const semesterData: SemesterType = {
    semester_id: semester,
    year: +year,
    term: +term,
  };

  const res = await fetch(`http:localhost:80/crawler/semester-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(semesterData),
  });

  if (!res.ok) {
    throw new Error(`Post Semester: ${semester} HTTP ERROR!`);
  }

  return res.json();
}
