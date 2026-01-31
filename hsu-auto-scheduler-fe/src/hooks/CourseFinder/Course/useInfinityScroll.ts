import { useEffect, useRef, useMemo } from "react";
import debounce from "lodash/debounce";

type Props = {
  hasNextPage: boolean;
  fetchNextPage: () => void;
  delay?: number;
};

export const useInfiniteScroll = ({
  hasNextPage,
  fetchNextPage,
  delay = 500,
}: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const debouncedFetch = useMemo(
    () =>
      debounce(() => {
        if (hasNextPage) {
          fetchNextPage();
        }
      }, delay),
    [fetchNextPage, hasNextPage, delay],
  );

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        debouncedFetch();
      }
    });

    observer.observe(target);

    return () => {
      observer.disconnect();
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  return ref;
};
