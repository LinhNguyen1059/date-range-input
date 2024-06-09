export enum DateType {
  Start = "Start",
  End = "End",
}

export function getDateType(
  dateString: string,
  character: string,
  cursorIndex: number
) {
  const splitIndex = dateString.indexOf(character);

  if (cursorIndex > splitIndex) {
    return DateType.End;
  }

  return DateType.Start;
}

export function isCursorAfterMonth(cursorIndex: number, formatStr: string) {
  return cursorIndex > formatStr.indexOf("M");
}

interface SelectedStateOptions {
  /**
   * The input element
   */
  input: HTMLInputElement;

  /**
   * The direction of the arrow key, left or right
   */
  direction?: "left" | "right";

  /**
   * Format of the string is based on Unicode Technical Standard.
   * @see https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
   */
  formatStr: string;

  /**
   * The format string of the range, which is used to calculate the selection range.
   */
  rangeFormatStr: string;

  /**
   * The selected month, used to calculate the offset of the character selection range
   */
  selectedMonth: number | null;

  /**
   * The offset of the value, which is used to calculate the month.
   * This value will be changed when pressing the up and down arrow keys.
   */
  valueOffset?: number | null;

  /**
   * The date is rendered in string format according to format
   */
  dateString: string;

  /**
   * The character that separates two dates
   *
   * Only for `DateRangeInput`
   **/
  character: string;

  /**
   * The date type, start or end
   *
   * Only for `DateRangeInput`
   */
  dateType: DateType;
}

export function getInputSelectedState(options: SelectedStateOptions) {
  const {
    input,
    direction,
    formatStr,
    rangeFormatStr,
    selectedMonth,
    valueOffset = 0,
    character,
    dateType,
    dateString,
  } = options;

  const getPatternSelectedIndexes = (pattern: string) => {
    let selectionStart = 0;
    let selectionEnd = 0;

    if (dateType === DateType.Start) {
      selectionStart = rangeFormatStr.indexOf(pattern);
      selectionEnd =
        rangeFormatStr.split(character)[0].lastIndexOf(pattern) + 1;
    } else if (dateType === DateType.End) {
      const position = rangeFormatStr.indexOf(character) + character.length;

      selectionStart = rangeFormatStr.indexOf(pattern, position);
      selectionEnd = rangeFormatStr.lastIndexOf(pattern) + 1;
    }

    const endDateGap =
      dateString.indexOf(character) - rangeFormatStr.indexOf(character);

    // If the date type is end, and the end date is not selected, the selection range needs to be adjusted.
    if (dateType === DateType.End && endDateGap > 0) {
      selectionStart += endDateGap;
      selectionEnd += endDateGap;
    }

    const gap = getSelectIndexGap({
      pattern,
      formatStr,
      valueOffset,
      selectedMonth,
    });

    const isSelectedMonth = pattern === "M";
    const isNullMonth =
      selectedMonth === null && !(isSelectedMonth && valueOffset !== 0);

    // If the month is null and the valueOffset is 0, the month will not be updated, and the gap is 0 at this time.
    if (isNullMonth) {
      return { selectionStart, selectionEnd };
    }

    if (isSelectedMonth) {
      return {
        selectionStart,
        selectionEnd: selectionEnd + gap,
      };
    }

    if (isCursorAfterMonth(selectionStart, formatStr)) {
      return {
        selectionStart: selectionStart + gap,
        selectionEnd: selectionEnd + gap,
      };
    }

    return { selectionStart, selectionEnd };
  };

  if (
    typeof input.selectionEnd === "number" &&
    typeof input.selectionStart === "number"
  ) {
    let index = input.selectionStart;

    let positionOffset = -1;

    if (direction === "left") {
      index = input.selectionStart - 1;
    } else if (direction === "right") {
      index = input.selectionEnd + 1;
      positionOffset = 1;
    }

    // The start position of the index of the end date
    const endDateIndex = dateString.indexOf(character) + character.length;
    const datePattern = getDatePattern({
      selectionIndex: dateType === DateType.End ? index - endDateIndex : index,
      positionOffset,
      formatStr,
      dateString,
      valueOffset,
      selectedMonth,
    });

    const indexes = getPatternSelectedIndexes(datePattern);

    return {
      selectedPattern: datePattern,
      ...indexes,
    };
  }

  return {
    selectedPattern: "y",
    selectionStart: 0,
    selectionEnd: 0,
  };
}

interface SelectIndexGapOptions {
  pattern: string;
  formatStr: string;
  valueOffset: number | null;
  selectedMonth: number | null;
}

export function getSelectIndexGap(options: SelectIndexGapOptions) {
  const { pattern, formatStr, valueOffset, selectedMonth } = options;
  let gap = 0;

  const monthIsAbbreviated = formatStr.includes("MMM");
  const monthIsFull = formatStr.includes("MMMM");

  // If the month is abbreviated or full, the gap needs to be adjusted.
  if (monthIsAbbreviated || monthIsFull) {
    const isSelectedMonth = pattern === "M";

    // If the selected is the month, and the valueOffset is null,
    // it means that the delete key is pressed, and the default pattern is displayed, and the gap is 0 at this time.
    if (isSelectedMonth && valueOffset === null) {
      return 0;
    }

    // If the month is null and the valueOffset is 0, the month will not be updated, and the gap is 0 at this time.
    if (selectedMonth === null && valueOffset === 0) {
      return 0;
    }

    let month = selectedMonth
      ? selectedMonth + (isSelectedMonth ? valueOffset || 0 : 0)
      : 1;

    if (month > 12) {
      month = 1;
    } else if (month === 0) {
      month = 12;
    }

    const months = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("en-US", {
        month: monthIsFull ? "long" : "short",
      })
    );

    const monthStr = months[month - 1];
    gap = monthStr.length - (monthIsFull ? 4 : 3);
  }

  return gap;
}

interface DatePatternOptions {
  selectionIndex: number;
  positionOffset?: number;
  formatStr: string;
  dateString: string;
  valueOffset: number | null;
  selectedMonth: number | null;
}

export function getDatePattern(options: DatePatternOptions) {
  const {
    selectionIndex,
    positionOffset = -1,
    formatStr,
    dateString,
    valueOffset,
    selectedMonth,
  } = options;

  let pattern = formatStr.charAt(selectionIndex || 0);

  if (selectionIndex < 0 || selectionIndex > dateString.length - 1) {
    pattern = formatStr.trim().charAt(0);

    return pattern;
  }

  let gap = 0;
  if (isCursorAfterMonth(selectionIndex, formatStr)) {
    gap = getSelectIndexGap({
      pattern,
      formatStr,
      valueOffset,
      selectedMonth,
    });
  }

  pattern = formatStr.charAt(selectionIndex - gap);

  // If the pattern is not a letter, then get the pattern from the previous or next letter.
  if (!pattern.match(/[y|d|M|H|h|m|s|a]/)) {
    const nextIndex = selectionIndex + positionOffset;
    pattern = getDatePattern({ ...options, selectionIndex: nextIndex });
  }

  return pattern;
}

export function safeSetSelection(
  element: HTMLInputElement,
  selectionStart: number,
  selectionEnd: number
) {
  if (document.activeElement === element) {
    element.setSelectionRange(selectionStart, selectionEnd, "none");
  }
}

export function useInputSelection(input: React.RefObject<HTMLInputElement>) {
  return function setSelectionRange(
    selectionStart: number,
    selectionEnd: number
  ) {
    requestAnimationFrame(() => {
      if (input.current) {
        safeSetSelection(input.current, selectionStart, selectionEnd);
      }
    });
  };
}

interface KeyboardEventOptions {
  onSegmentChange?: (kevent: React.KeyboardEvent<HTMLInputElement>) => void;
  onSegmentValueChange?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onSegmentValueChangeWithNumericKeys?: (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => void;
  onSegmentValueRemove?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function useKeyboardInputEvent({
  onSegmentChange,
  onSegmentValueChange,
  onSegmentValueChangeWithNumericKeys,
  onSegmentValueRemove,
  onKeyDown,
}: KeyboardEventOptions) {
  return (event: React.KeyboardEvent<HTMLInputElement>) => {
    const key = event.key;

    switch (key) {
      case "ArrowRight":
      case "ArrowLeft":
        onSegmentChange?.(event);
        event.preventDefault();
        break;
      case "ArrowUp":
      case "ArrowDown":
        onSegmentValueChange?.(event);
        event.preventDefault();
        break;
      case "Backspace":
        onSegmentValueRemove?.(event);
        event.preventDefault();
        break;

      case key.match(/\d/)?.input:
        // Allow numeric keys to be entered
        onSegmentValueChangeWithNumericKeys?.(event);
        event.preventDefault();
        break;

      case key.match(/[a-z]/)?.[0]:
        // Prevent letters from being entered
        event.preventDefault();
        break;
    }

    onKeyDown?.(event);
  };
}

export function isSwitchDateType(
  dateString: string,
  character: string,
  cursorIndex: number,
  direction: "right" | "left"
) {
  const characterIndex = dateString.indexOf(character);

  let startIndex = cursorIndex;
  let endIndex = startIndex + character.length;

  if (direction === "left") {
    endIndex = cursorIndex;
    startIndex = endIndex - character.length;
  }

  // Check whether the cursor is a separator before and after
  if (dateString.substring(startIndex, endIndex) === character) {
    return true;
  }

  // Check whether the cursor is a number or letter before and after. If not, switch the date type.
  // eg: `2020年12月01日`, the cursor is behind 01, press the right key, and switch to the end date.
  if (direction === "right") {
    if (
      !dateString.substring(cursorIndex, characterIndex).match(/[0-9a-zA-Z]/)
    ) {
      return true;
    }
  }
  if (!dateString.substring(characterIndex, cursorIndex).match(/[0-9a-zA-Z]/)) {
    return true;
  }

  return false;
}

export function getPatternGroups(format: string, pattern: string) {
  return format.match(new RegExp(`(${pattern})+`))?.[0] || "";
}

export const startCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export function validateDateTime(type: string, value: number) {
  switch (type) {
    case "year":
      if (value < 1 || value > 9999) {
        return false;
      }
      break;
    case "month":
      if (value < 1 || value > 12) {
        return false;
      }
      break;
    case "day":
      if (value < 1 || value > 31) {
        return false;
      }
      break;
    case "hour":
      if (value < 0 || value > 23) {
        return false;
      }
      break;
    case "minute":
      if (value < 0 || value > 59) {
        return false;
      }
      break;
    case "second":
      if (value < 0 || value > 59) {
        return false;
      }
      break;
    default:
      return false; // Invalid type
  }

  return true;
}
