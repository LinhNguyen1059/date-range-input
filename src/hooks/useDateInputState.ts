import { useEffect } from "react";
import {
  addDays,
  addMonths,
  addYears,
  addHours,
  addMinutes,
  addSeconds,
  format,
  isLastDayOfMonth,
  lastDayOfMonth,
  isValid,
} from "../utils/date";
import { patternMap, useDateField } from "./useDateField";
import { startCase } from "../utils/utils";

interface DateInputState {
  formatStr: string;
  formatDate?: typeof format;
  locale: any;
  date?: Date | null;
  isControlledDate?: boolean;
}

export function useDateInputState({
  formatStr,
  date,
  isControlledDate,
}: DateInputState) {
  const { dateField, dispatch, toDateString, toDate, isEmptyValue } =
    useDateField(formatStr, date);

  const setDateOffset = (
    pattern: string,
    offset: number,
    callback?: (newDate: Date | null) => void
  ) => {
    const currentDate = new Date();
    const year = dateField.year || currentDate.getFullYear();
    const month = dateField.month
      ? dateField.month - 1
      : currentDate.getMonth();
    const day = dateField.day || 0;
    const hour = dateField.hour || 0;
    const minute = dateField.minute || 0;
    const second = dateField.second || 0;

    let actionName;
    let value;

    switch (pattern) {
      case "y":
      case "Y":
        actionName = "setYear";
        value = addYears(new Date(year, 0), offset).getFullYear();
        break;
      case "M":
        actionName = "setMonth";
        value = addMonths(new Date(year, month), offset).getMonth() + 1;
        break;
      case "d":
      case "D":
        actionName = "setDay";
        const prevDate = new Date(year, month, day);

        value = addDays(prevDate, offset).getDate();

        if (offset > 0) {
          value = isLastDayOfMonth(prevDate) ? 1 : value;
        } else {
          value =
            prevDate.getDate() === 1
              ? lastDayOfMonth(prevDate).getDate()
              : value;
        }
        break;
      case "H":
      case "h":
        actionName = "setHour";
        value = addHours(new Date(year, month, day, hour), offset).getHours();
        break;
      case "m":
        actionName = "setMinute";
        value = addMinutes(
          new Date(year, month, day, hour, minute),
          offset
        ).getMinutes();
        break;
      case "s":
        actionName = "setSecond";
        value = addSeconds(
          new Date(year, month, day, hour, minute, second),
          offset
        ).getSeconds();
        break;
      case "a":
        actionName = "setHour";
        value = hour >= 12 ? hour - 12 : hour + 12;
        break;
    }

    if (actionName && value) {
      dispatch({ type: actionName, value });

      const field = patternMap[pattern];

      callback?.(toDate(field, value));
    }
  };

  const setDateField = (
    pattern: string,
    value: number | null,
    callback?: (newDate: Date | null) => void
  ) => {
    const field = patternMap[pattern];
    const actionName = `set${startCase(field)}`;

    dispatch({ type: actionName, value });

    callback?.(toDate(field, value));
  };

  const getDateField = (pattern: string) => {
    const fieldName = patternMap[pattern];
    return {
      name: fieldName,
      value: dateField[fieldName],
    };
  };

  const toControlledDateString = () => {
    if (date && isValid(date)) {
      return format(date, formatStr);
    }
    // if date is not valid, return uncontrolled date string
    return toDateString();
  };

  useEffect(() => {
    if (isControlledDate) {
      if (date && isValid(date)) {
        dispatch({ type: "setNewDate", value: date });
      } else if (date === null) {
        dispatch({ type: "setNewDate", value: null });
      }
    }
  }, [date, dispatch, isControlledDate]);

  return {
    dateField,
    setDateOffset,
    setDateField,
    getDateField,
    toDateString: isControlledDate ? toControlledDateString : toDateString,
    isEmptyValue,
  };
}

export default useDateInputState;
