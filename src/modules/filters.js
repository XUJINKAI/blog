// filters.js — 所有 Eleventy filter 定义

export function registerFilters(eleventyConfig) {

    // 格式化日期为 YYYY-MM-DD
    eleventyConfig.addFilter("dateFormat", function (date) {
        if (!date) return "";
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return String(date);
        const tz = this.ctx.site?.timezone || "Asia/Shanghai";
        return d.toLocaleDateString("sv-SE", { timeZone: tz });
    });

    // 格式化日期为 ISO 8601（含时区偏移）
    eleventyConfig.addFilter("toISODate", function (date) {
        if (!date) return "";
        if (typeof date === "string") return date;
        const tz = this.ctx.site?.timezone || "Asia/Shanghai";
        const d = date instanceof Date ? date : new Date(date);
        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: tz,
            year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
        }).formatToParts(d);
        const get = (type) => parts.find((p) => p.type === type)?.value || "00";
        const utc = d.getTime();
        const local = new Date(d.toLocaleString("en-US", { timeZone: tz })).getTime();
        const offsetMin = (local - utc) / 60000;
        const offsetSign = offsetMin >= 0 ? "+" : "-";
        const absOffset = Math.abs(offsetMin);
        const offsetH = String(Math.floor(absOffset / 60)).padStart(2, "0");
        const offsetM = String(absOffset % 60).padStart(2, "0");
        return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}${offsetSign}${offsetH}:${offsetM}`;
    });

    // 合并连续空白为单个空格
    eleventyConfig.addFilter("normalizeWhitespace", function (str) {
        if (!str) return "";
        return str.replace(/\s+/g, " ").trim();
    });

    // 取数组前 n 个元素
    eleventyConfig.addFilter("head", function (array, n) {
        if (!Array.isArray(array)) return array;
        return array.slice(0, n);
    });

    // URL 编码
    eleventyConfig.addFilter("cgiEscape", function (str) {
        if (!str) return "";
        return encodeURIComponent(str);
    });

    // 调试专用：安全 dump 对象（移除可能导致循环引用的 collections）
    eleventyConfig.addFilter("safeDump", function (obj, space = 2) {
        if (!obj) return "";
        return JSON.stringify(obj, (key, value) => {
            if (["eleventy", "pkg", "site", "collections"].includes(key)) return `[Ref ${key} (omitted)]`;
            return value;
        }, space);
    });
}
