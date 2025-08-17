import { MajorDBType, MajorFileType } from "../type/major.type";

export async function postMajors(semester_id: string, majors: MajorFileType[]) {
  const majorData: MajorDBType[] = majors.map((major) => ({
    major_code: major.major_code,
    major_name: major.major_name,
  }));

  const res = await fetch(`http:localhost:80/crawler/major-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      semester_id,
      majors: majorData,
    }),
  });

  if (!res.ok) {
    throw new Error(`Post Major: ${semester_id}-Majors HTTP ERROR!`);
  }

  return res.json();
}
