import { useMemo, useRef, useState } from "react";
import moment from "moment";
import {
  DateType,
  getDateType,
  getInputSelectedState,
  isSwitchDateType,
  useInputSelection,
  useKeyboardInputEvent,
  validateDateTime,
} from "../utils/utils";
import useFieldCursor from "../hooks/useFieldCursor";
import { DateRangeInputProps, ValueType } from "../types/input";
import useControlled from "../hooks/useControlled";
import useIsFocused from "../hooks/useIsFocused";
import useDateInputState from "../hooks/useDateInputState";

export default function DateRangeInput(props: DateRangeInputProps) {
  const {
    className,
    character = " - ",
    format: formatStr = "YYYY/MM/DD",
    value: valueProp,
    defaultValue = [],
    placeholder,
    onChange,
    onKeyDown,
    onBlur,
    onFocus,
    ...rest
  } = props;

  const dateLocale = moment.localeData();
  const [value, setValue, isControlled] = useControlled(
    valueProp,
    defaultValue
  );
  const [dateType, setDateType] = useState<DateType>(DateType.Start);
  const [selectedState, setSelectedState] = useState<{
    selectedPattern: string;
    selectionStart: number;
    selectionEnd: number;
  }>({
    selectedPattern: "y",
    selectionStart: 0,
    selectionEnd: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const rangeFormatStr = `${formatStr}${character}${formatStr}`;

  const dateInputOptions = {
    formatStr,
    locale: dateLocale,
    isControlledDate: isControlled,
  };

  const startDateState = useDateInputState({
    ...dateInputOptions,
    date: value?.[0] || null,
  });
  const endDateState = useDateInputState({
    ...dateInputOptions,
    date: value?.[1] || null,
  });

  const { isMoveCursor, increment, reset } = useFieldCursor<ValueType>(
    formatStr,
    valueProp
  );

  const getActiveState = (type: DateType = dateType) => {
    return type === DateType.Start ? startDateState : endDateState;
  };

  const [focused, focusEventProps] = useIsFocused({ onBlur, onFocus });

  const renderedValue = useMemo(() => {
    const dateString =
      startDateState.toDateString() + character + endDateState.toDateString();
    if (!startDateState.isEmptyValue() || !endDateState.isEmptyValue()) {
      return dateString;
    }

    return !focused ? "" : dateString;
  }, [character, endDateState, focused, startDateState]);

  const keyPressOptions = {
    formatStr,
    rangeFormatStr,
    selectedMonth: getActiveState().dateField.month,
    dateString: renderedValue,
    dateType,
    character,
  };

  const setSelectionRange = useInputSelection(inputRef);

  const handleChange = (
    date: Date | null,
    event: React.SyntheticEvent<HTMLInputElement>
  ) => {
    const nextValue =
      dateType === DateType.Start
        ? ([date, value?.[1]] as ValueType)
        : ([value?.[0], date] as ValueType);

    onChange?.(nextValue, event);
    setValue(nextValue);
  };

  const onSegmentChange = (
    event: React.KeyboardEvent<HTMLInputElement>,
    nextDirection?: "right" | "left"
  ) => {
    const input = event.target as HTMLInputElement;
    const key = event.key;
    const direction =
      nextDirection || (key === "ArrowRight" ? "right" : "left");

    if (input.selectionEnd === null || input.selectionStart === null) {
      return;
    }

    const cursorIndex =
      direction === "right" ? input.selectionEnd : input.selectionStart;
    let nextDateType = dateType;

    if (isSwitchDateType(renderedValue, character, cursorIndex, direction)) {
      nextDateType =
        dateType === DateType.Start ? DateType.End : DateType.Start;

      setDateType(nextDateType);
    }

    const state = getInputSelectedState({
      ...keyPressOptions,
      dateType: nextDateType,
      selectedMonth: getActiveState(nextDateType).dateField.month,
      input,
      direction,
    });

    setSelectedState(state);
    setSelectionRange(state.selectionStart, state.selectionEnd);
    reset();
  };

  const onSegmentValueChange = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const input = event.target as HTMLInputElement;
    const key = event.key;
    const offset = key === "ArrowUp" ? 1 : -1;

    const state = getInputSelectedState({
      ...keyPressOptions,
      input,
      valueOffset: offset,
    });

    setSelectedState(state);
    getActiveState().setDateOffset(state.selectedPattern, offset, (date) =>
      handleChange(date, event)
    );
    setSelectionRange(state.selectionStart, state.selectionEnd);
  };

  const onSegmentValueChangeWithNumericKeys = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const input = event.target as HTMLInputElement;
    const key = event.key;
    const pattern = selectedState.selectedPattern;

    if (!pattern) {
      return;
    }

    increment();

    const field = getActiveState().getDateField(pattern);
    const value = parseInt(key, 10);
    const padValue = parseInt(`${field.value || ""}${key}`, 10);

    let newValue = value;

    // Check if the value entered by the user is a valid date
    if (validateDateTime(field.name, padValue)) {
      newValue = padValue;
    }

    getActiveState().setDateField(pattern, newValue, (date) =>
      handleChange(date, event)
    );

    // The currently selected month will be retained as a parameter of getInputSelectedState,
    // but if the user enters a month, the month value will be replaced with the value entered by the user.
    const selectedMonth =
      pattern === "M" ? newValue : getActiveState().dateField.month;
    const nextState = getInputSelectedState({
      ...keyPressOptions,
      input,
      selectedMonth,
    });

    setSelectedState(nextState);
    setSelectionRange(nextState.selectionStart, nextState.selectionEnd);

    // If the field is full value, move the cursor to the next field
    if (
      isMoveCursor(newValue, pattern) &&
      input.selectionEnd !== input.value.length
    ) {
      onSegmentChange(event, "right");
    }
  };

  const onSegmentValueRemove = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const input = event.target as HTMLInputElement;
    if (selectedState.selectedPattern) {
      const nextState = getInputSelectedState({
        ...keyPressOptions,
        input,
        valueOffset: null,
      });

      setSelectedState(nextState);
      setSelectionRange(nextState.selectionStart, nextState.selectionEnd);

      getActiveState().setDateField(
        selectedState.selectedPattern,
        null,
        (date) => handleChange(date, event)
      );

      reset();
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
    const input = event.target as HTMLInputElement;

    if (input.selectionStart === null) {
      return;
    }

    const cursorIndex =
      input.selectionStart === renderedValue.length ? 0 : input.selectionStart;

    const dateType = getDateType(
      renderedValue || rangeFormatStr,
      character,
      cursorIndex
    );
    const state = getInputSelectedState({
      ...keyPressOptions,
      dateType,
      selectedMonth: getActiveState(dateType).dateField.month as number,
      input,
    });

    setDateType(dateType);
    setSelectedState(state);
    setSelectionRange(state.selectionStart, state.selectionEnd);
  };

  const onKeyboardInput = useKeyboardInputEvent({
    onSegmentChange,
    onSegmentValueChange,
    onSegmentValueChangeWithNumericKeys,
    onSegmentValueRemove,
    onKeyDown,
  });

  return (
    <input
      ref={inputRef}
      inputMode={focused ? "numeric" : "text"}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      onKeyDown={onKeyboardInput}
      onClick={handleClick}
      value={renderedValue}
      placeholder={placeholder || rangeFormatStr}
      style={{ width: "200px" }}
      {...focusEventProps}
      {...rest}
    />
  );
}
