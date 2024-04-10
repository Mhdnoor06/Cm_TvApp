import { format, utcToZonedTime } from "date-fns-tz";
import tz_lookup from "tz-lookup";

export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = `0${d.getMonth() + 1}`.slice(-2);
  const day = `0${d.getDate()}`.slice(-2);
  return `${day}-${month}-${year}`;
};

export const convertEpochToTimeString = (
  epoch: number,
  lat: number,
  lon: number
): string => {
  if (epoch <= 0) {
    return "--";
  }

  const timeZone = tz_lookup(lat, lon);

  const date = new Date(epoch * 1000);
  const zonedDate = utcToZonedTime(date, timeZone);
  return format(zonedDate, "hh:mm a", { timeZone });
};

export const formatDateToReadableString = (
  dateString: string,
  lat: number,
  lon: number
): string => {
  const date = new Date(dateString);
  const timeZone = tz_lookup(lat, lon);

  const zonedDate = utcToZonedTime(date, timeZone);

  return format(zonedDate, "d MMMM yyyy");
};
