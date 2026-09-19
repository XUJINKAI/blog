import { site } from "./site.js";

export function buildSeo({
  title,
  description,
  canonicalPath = "/",
  isPost = false,
  publishedDate,
  lastModified,
}) {
  const cleanPath =
    canonicalPath !== "/" && canonicalPath.endsWith(".html")
      ? canonicalPath.slice(0, -".html".length)
      : canonicalPath;
  const canonicalUrl = site.url + cleanPath;
  const pageTitle = title
    ? title + " | " + site.title
    : site.title + " | " + site.description;
  const pageDescription = description || site.description;
  const ogTitle = title || site.title;

  const jsonLd = JSON.stringify(
    isPost
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          author: { "@type": "Person", name: site.author },
          dateModified: formatDate(lastModified || publishedDate),
          datePublished: formatDate(publishedDate),
          description: pageDescription,
          headline: ogTitle,
          mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
          url: canonicalUrl,
        }
      : {
          "@context": "https://schema.org",
          "@type": "WebPage",
          author: { "@type": "Person", name: site.author },
          description: pageDescription,
          headline: ogTitle,
          url: canonicalUrl,
        },
  );

  return {
    canonicalUrl,
    pageTitle,
    ogType: isPost ? "article" : "website",
    ogTitle,
    description: pageDescription,
    jsonLd,
    isPost,
  };
}

function formatDate(value) {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}
