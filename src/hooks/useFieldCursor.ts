import { useCallback, useEffect, useRef } from "react";
import { getPatternGroups } from "../utils/utils";
export function useFieldCursor<V = Date | null>(format: string, value?: V) {
  const typeCount = useRef(0);

  const increment = () => {
    typeCount.current += 1;
  };

  const reset = () => {
    typeCount.current = 0;
  };

  const isMoveCursor = useCallback(
    (value: number, pattern: string) => {
      const patternGroup = getPatternGroups(format, pattern);

      if (value.toString().length === patternGroup.length) {
        return true;
      } else if (
        (pattern === "y" || pattern === "Y") &&
        typeCount.current === 4
      ) {
        return true;
      } else if (
        (pattern === "y" || pattern === "Y") &&
        typeCount.current === 2
      ) {
        return true;
      }

      switch (pattern) {
        case "M":
          return parseInt(`${value}0`) > 12;
        case "d":
        case "D":
          return parseInt(`${value}0`) > 31;
        case "H":
          return parseInt(`${value}0`) > 23;
        case "h":
          return parseInt(`${value}0`) > 12;
        case "m":
        case "s":
          return parseInt(`${value}0`) > 59;
        default:
          return false;
      }
    },
    [format]
  );

  useEffect(() => {
    if (!value) {
      reset();
    }
  }, [value]);

  return { increment, reset, isMoveCursor };
}

export default useFieldCursor;
