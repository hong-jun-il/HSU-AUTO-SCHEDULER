import isMobileDevice from "@/utils/isMobileDevice";
import { useCallback, useEffect, useRef } from "react";

export default function useHorizontalScrollByWheel(
  setIsLeftEnded: React.Dispatch<React.SetStateAction<boolean>>,
  setIsRightEnded: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const cleanupRef = useRef<(() => void) | null>(null);

  const refCallback = useCallback(
    (el: HTMLElement | null) => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      if (!el) return;

      // useResponsiveContext를 사용하지 않는 이유는 데스크탑에서 모바일 뷰로 볼 때를 고려하여 휠 기능이 작동하도록 하기 위함
      const isTouch = isMobileDevice();
      if (isTouch) return;

      const handleScrollWheel = (event: WheelEvent) => {
        event.preventDefault();

        el.scrollLeft += event.deltaY;

        const { scrollLeft, scrollWidth, clientWidth } = el;

        if (scrollLeft <= 0) {
          setIsLeftEnded(true);
        } else {
          setIsLeftEnded(false);
        }

        if (scrollLeft + clientWidth >= scrollWidth - 1) {
          setIsRightEnded(true);
        } else {
          setIsRightEnded(false);
        }
      };

      el.addEventListener("wheel", handleScrollWheel, { passive: false });

      cleanupRef.current = () => {
        el.removeEventListener("wheel", handleScrollWheel);
      };
    },
    [setIsLeftEnded, setIsRightEnded],
  );

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return refCallback;
}
