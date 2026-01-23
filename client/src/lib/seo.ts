import { useEffect } from "react";

type SEOProps = {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
};

export function useSEO({ title, description, ogTitle, ogDescription }: SEOProps) {
  useEffect(() => {
    document.title = title;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }
    
    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (ogTitleMeta) {
      ogTitleMeta.setAttribute("content", ogTitle || title);
    }
    
    const ogDescMeta = document.querySelector('meta[property="og:description"]');
    if (ogDescMeta) {
      ogDescMeta.setAttribute("content", ogDescription || description);
    }
    
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute("content", ogTitle || title);
    }
    
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) {
      twitterDesc.setAttribute("content", ogDescription || description);
    }
  }, [title, description, ogTitle, ogDescription]);
}
