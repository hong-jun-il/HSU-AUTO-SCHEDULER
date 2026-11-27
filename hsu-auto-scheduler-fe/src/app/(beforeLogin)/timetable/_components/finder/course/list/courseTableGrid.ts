// 데스크탑 강의 목록의 열 너비. 헤더와 행이 같은 값을 써야 열이 맞는다.
// 예전 <table table-fixed> + <colgroup> 과 같은 폭: 고정 열은 w-N 과 같은 값, 과목명·강의 스케줄은 남는 폭을 반씩 나눠 가진다.
// w-N 은 styles/sizes.css 의 --spacing-N(= N × 0.2rem)이다. Tailwind 는 클래스로 쓰인 토큰만 내보내므로
// 인라인 스타일에서는 var(--spacing-N) 대신 같은 계산을 직접 쓴다
const spacing = (n: number) => `calc(${n} * 0.2rem)`;

export const COURSE_TABLE_GRID_COLUMNS = [
  spacing(50), // 과목코드
  "minmax(0, 1fr)", // 과목명
  spacing(48), // 교수
  spacing(31), // 학년
  spacing(30), // 학년제한
  spacing(20), // 학점
  spacing(31), // 과목구분
  spacing(33), // 이수구분
  spacing(20), // 주/야
  "minmax(0, 1fr)", // 강의 스케줄
  spacing(42), // 강의 계획서
].join(" ");
