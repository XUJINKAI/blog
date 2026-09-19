import siteConfig from "../../site.json";

export const site = Object.freeze(siteConfig);
export const isDebug = import.meta.env.DEV;
