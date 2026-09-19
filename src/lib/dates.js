export function dateFormat(value, timezone = "Asia/Shanghai") {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("sv-SE", { timeZone: timezone });
}

export function toISODate(value, timezone = "Asia/Shanghai") {
  if (!value) return "";
  if (typeof value === "string") return value;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type) => parts.find((part) => part.type === type)?.value || "00";
  const utc = date.getTime();
  const local = new Date(date.toLocaleString("en-US", { timeZone: timezone })).getTime();
  const offsetMinutes = (local - utc) / 60000;
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absolute = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const minutes = String(absolute % 60).padStart(2, "0");

  return get("year") + "-" + get("month") + "-" + get("day") + "T" +
    get("hour") + ":" + get("minute") + ":" + get("second") +
    sign + hours + ":" + minutes;
}

export function activityTime(post) {
  const value = post.lastModified || post.date;
  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
}
