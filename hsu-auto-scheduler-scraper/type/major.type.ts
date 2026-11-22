// XML용 타입
export type MajorXMLType = {
  "@_id": string;
  "@_name": string;
  "@_order": string;
};

// json 파일 저장용 타입
export type MajorFileType = {
  id: string;
  major_code: string;
  major_name: string;
  order: number;
};

// 실제 db에 보낼 타입
export type MajorDBType = {
  code: string;
  name: string;
};
