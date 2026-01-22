import { MajorDBType, MajorFileType } from "../../type/major.type";

export async function postMajors(majors: MajorFileType[]) {
  const majorData: MajorDBType[] = majors.map((major) => ({
    code: major.major_code,
    name: major.major_name,
  }));

  const res = await fetch(`${process.env.BASE_URL}/crawler/save-majors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(majorData),
  });

  if (!res.ok) {
    throw new Error(`Post Majors HTTP ERROR!`);
  }

  return res.json();
}
