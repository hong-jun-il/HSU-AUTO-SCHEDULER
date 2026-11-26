import useGetCPSATResults from "../queries/useGetCPSATResults";

export default function useCPSATDataProcess() {
  const { data } = useGetCPSATResults();

  // 슬라이더로 넘길 수 있는 해의 개수 (서버가 돌려주는 상위 최대 50개)
  const totalSolutionCount = data?.pages[0]?.data.total_solution_count ?? 0;

  const CPSATResult =
    data?.pages.flatMap((e) => {
      return e.data.solutions;
    }) ?? [];

  return {
    totalSolutionCount,
    CPSATResult,
  };
}
