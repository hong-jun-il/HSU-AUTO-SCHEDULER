import { IngestResult, SemesterPayload } from "../type/payload.type";

// 학기 하나를 백엔드에 통째로 보낸다. 백엔드는 한 트랜잭션으로 교체하므로 실패하면 아무것도 바뀌지 않는다.
export async function putSemester(payload: SemesterPayload): Promise<IngestResult> {
  const { BASE_URL, ADMIN_TOKEN } = process.env;
  if (!BASE_URL) throw new Error(".env 에 BASE_URL 이 없어요.");
  if (!ADMIN_TOKEN) throw new Error(".env 에 ADMIN_TOKEN 이 없어요. 백엔드의 ADMIN_TOKEN 과 같은 값을 넣어 주세요.");

  const semesterId = `${payload.year}-${payload.term}`;
  const res = await fetch(`${BASE_URL}/admin/semesters/${semesterId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Admin-Token": ADMIN_TOKEN },
    body: JSON.stringify(payload),
  });

  if (res.ok) return (await res.json()) as IngestResult;

  const text = await res.text();
  if (res.status === 401) throw new Error("백엔드가 토큰을 거절했어요 (401). ADMIN_TOKEN 이 백엔드와 같은지 확인해 주세요.");
  if (res.status === 422) {
    // 같은 분반이 전공마다 다르게 온 경우 — 백엔드가 충돌 목록을 돌려준다
    const { conflicts = [] } = JSON.parse(text) as { conflicts?: string[] };
    throw new Error(`데이터 충돌 ${conflicts.length}건으로 저장하지 않았어요:\n  ${conflicts.join("\n  ")}`);
  }
  throw new Error(`${semesterId} 저장 실패 (HTTP ${res.status}): ${text.slice(0, 500)}`);
}
