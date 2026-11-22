import { XMLParser } from "fast-xml-parser";
import { MajorFileType, MajorXMLType } from "../../type/major.type";

export default function parseMajorsFromXML(XMLMajors: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    trimValues: true,
  });

  const rawCategories =
    parser.parse(XMLMajors).response.campus.categories.category;

  const categories: MajorXMLType[] = Array.isArray(rawCategories)
    ? rawCategories
    : [rawCategories];

  const majors: MajorFileType[] = categories.map((category) => {
    const [major_code, ...major_name] = category["@_name"].split(" ");
    const formattedMajorCode = major_code.replace(/\[|\]/g, "");

    return {
      id: category["@_id"],
      major_code: formattedMajorCode,
      major_name: major_name.join(" "),
      order: +category["@_order"],
    };
  });

  return majors;
}
