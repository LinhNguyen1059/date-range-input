import moment from "moment";

export const addDays = (date: Date, days: number) => {
  return moment(date).add(days, "days").toDate();
};

export const addMonths = (date: Date, months: number) => {
  return moment(date).add(months, "months").toDate();
};

export const addYears = (date: Date, years: number) => {
  return moment(date).add(years, "years").toDate();
};

export const addHours = (date: Date, hours: number) => {
  return moment(date).add(hours, "hours").toDate();
};

export const addMinutes = (date: Date, minutes: number) => {
  return moment(date).add(minutes, "minutes").toDate();
};

export const addSeconds = (date: Date, seconds: number) => {
  return moment(date).add(seconds, "seconds").toDate();
};

export const isLastDayOfMonth = (date: Date) => {
  return moment(date).date() === moment(date).endOf("month").date();
};

export const lastDayOfMonth = (date: Date) => {
  return moment(date).endOf("month").toDate();
};

export const format = (date: Date, formatStr: string) => {
  return moment(date).format(formatStr);
};

export const isValid = (date: Date) => {
  return moment(date).isValid();
};

export function setDate(date: Date, day: number) {
  return moment(date).date(day).toDate();
}

export function setMonth(date: Date, month: number) {
  return moment(date).month(month).toDate();
}

export function setYear(date: Date, year: number) {
  return moment(date).year(year).toDate();
}

export function setHours(date: Date, hours: number) {
  return moment(date).hour(hours).toDate();
}

export function setMinutes(date: Date, minutes: number) {
  return moment(date).minute(minutes).toDate();
}

export function setSeconds(date: Date, seconds: number) {
  return moment(date).second(seconds).toDate();
}

export function modifyDate(date: Date, type: string, value: number) {
  switch (type) {
    case "year":
      return setYear(date, value);
    case "month":
      return setMonth(date, value - 1);
    case "day":
      return setDate(date, value);
    case "hour":
      return setHours(date, value);
    case "minute":
      return setMinutes(date, value);
    case "second":
      return setSeconds(date, value);
  }

  return date;
}
