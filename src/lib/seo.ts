import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
}

const DEFAULT_DESC = "HireLight helps developers and freshers find their next job. Browse thousands of tech, remote, government and fresher jobs with AI resume matching.";
const DEFAULT_IMAGE = "https://hirelight.app/og-image.png";

export function usePageSEO({ title, description = DEFAULT_DESC, ogImage = DEFAULT_IMAGE, ogType = "website" }: SEOProps) {
  useEffect(() => {
    const fullTitle = title.includes("HireLight") ? title : `${title} | HireLight`;
    document.title = fullTitle;

    const setMeta = (nameOrProp: string, content: string) => {
      const isOG = nameOrProp.startsWith("og:") || nameOrProp.startsWith("twitter:");
      const attr = isOG ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, nameOrProp);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", description);
    setMeta("og:title", fullTitle);
    setMeta("og:description", description);
    setMeta("og:image", ogImage);
    setMeta("og:type", ogType);
    setMeta("og:url", window.location.href);
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage);

    return () => {
      document.title = "HireLight — Find Your Next Tech Job";
    };
  }, [title, description, ogImage, ogType]);
}
