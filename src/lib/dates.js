export function dateFormat(value, timezone = "Asia/Shanghai") {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("sv-SE", { timeZone: timezone });
}

export function toISODate(value) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toISOString();
}

export function activityTime(post) {
  const value = post.lastModified || post.date;
  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();

  return Number.isNaN(time) ? 0 : time;
}
