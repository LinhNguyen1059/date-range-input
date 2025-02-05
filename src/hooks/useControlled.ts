import { useRef, useState, useCallback, SetStateAction } from "react";

type InferDefined<T> = T extends infer U | undefined ? U : never;

/**
 * A hook for controlled value management.
 * In the case of passing the controlled value, the controlled value is returned, otherwise the value in state is returned.
 * Generally used for a component including controlled and uncontrolled modes.
 * @param controlledValue
 * @param defaultValue
 * @param formatValue
 */

export function useControlled<V = any, D = V>(
  controlledValue: V,
  defaultValue: D
) {
  const controlledRef = useRef(false);
  controlledRef.current = controlledValue !== undefined;

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  // If it is controlled, this directly returns the attribute value.
  const value = controlledRef.current ? controlledValue : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: SetStateAction<D>) => {
      // Only update the value in state when it is not under control.
      if (!controlledRef.current) {
        setUncontrolledValue(nextValue);
      }
    },
    [controlledRef]
  );

  return [value, setValue, controlledRef.current] as [
    V extends undefined ? D : InferDefined<V>,
    (value: React.SetStateAction<V | null>) => void,
    boolean
  ];
}

export default useControlled;
