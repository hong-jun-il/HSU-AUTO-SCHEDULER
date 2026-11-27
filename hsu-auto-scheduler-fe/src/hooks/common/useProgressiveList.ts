import { startTransition, useEffect, useState } from "react";

/*
  긴 목록을 한 번에 그리지 않고 덩어리로 나눠 그린다.
  처음 first 개를 바로 그리고, 화면에 반영될 때마다 다음 step 개를 다음 작업으로 미뤄서 늘린다.
  덩어리 사이에 브라우저가 클릭·스크롤·그리기를 처리할 수 있어 메인 스레드가 오래 멈추지 않는다.

  useDeferredValue 만으로는 부족하다: React 는 화면 계산은 나눠도 DOM 에 넣는 단계는 한 번에 하므로,
  넘기는 개수 자체를 나눠야 긴 작업이 사라진다.
*/
export default function useProgressiveList<T>(
  items: T[] | undefined,
  first: number,
  step: number,
): T[] | undefined {
  const [count, setCount] = useState(first);
  const [prevItems, setPrevItems] = useState(items);

  // 목록이 바뀌면(필터 변경 등) 처음부터 다시 나눠 그린다.
  // effect 에서 되돌리면 새 목록을 이전 개수만큼 한 번에 그린 뒤에야 줄어들므로, 렌더 중에 바로 되돌린다
  if (items !== prevItems) {
    setPrevItems(items);
    setCount(first);
  }

  useEffect(() => {
    if (!items || count >= items.length) return;

    const id = window.setTimeout(() => {
      // 사용자 입력보다 낮은 우선순위로 다음 덩어리를 그린다
      startTransition(() => setCount((c) => c + step));
    }, 0);

    return () => window.clearTimeout(id);
  }, [items, count, step]);

  return items && count < items.length ? items.slice(0, count) : items;
}
