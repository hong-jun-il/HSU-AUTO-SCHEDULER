export type SemesterType = {
  id: string;
  year: number;
  term: number;
  scraped_at: string | null; // 종정시 수집 시각
};
