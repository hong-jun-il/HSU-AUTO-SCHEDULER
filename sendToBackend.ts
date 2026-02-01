import fs from "fs/promises";
import path from "path";
import { TARGET_SEMESTER } from "./constants/TARGET_SEMESTER";
import { MajorFileType } from "./type/major.type";
import { postSemester } from "./api/post/postSemester";
import { postMajors } from "./api/post/postMajors";
import postCourses from "./api/post/postCourses";
import { OverridedCourseType } from "./type/course.type";

const semester = TARGET_SEMESTER;

async function sendToBackend() {
  const [year, term] = semester.split("-").map(Number);

  const majorsDir = path.resolve(process.cwd(), `${semester}`);
  const majors: MajorFileType[] = JSON.parse(
    await fs.readFile(`${majorsDir}/majors.json`, "utf-8"),
  );

  const { data } = await postSemester({ year, term });
  const semesterId = data.id;

  const postMajorRes = await postMajors(semesterId, majors);
  console.log(postMajorRes);

  for (const index in majors) {
    const major_id = majors[index].id;
    const code = majors[index].major_code;
    const name = majors[index].major_name;

    const courseDir = path.resolve(process.cwd(), `${semester}/courses/`);
    const courses: OverridedCourseType[] = JSON.parse(
      await fs.readFile(`${courseDir}/${major_id}.json`, "utf-8"),
    );

    const postCourseRes = await postCourses({
      semesterId,
      code,
      name,
      courses,
    });

    console.log(postCourseRes);
  }
}
sendToBackend();
