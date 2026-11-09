import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function PageMeta({ title, description }) {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = title;
    for (const [selector, content] of [
      ['meta[name="description"]', description],
      ['meta[property="og:title"]', title],
      ['meta[property="og:description"]', description],
      ['meta[property="og:url"]', `https://badirou-avocat.fr${pathname}`],
    ]) document.querySelector(selector)?.setAttribute("content", content);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", `https://badirou-avocat.fr${pathname}`);
  }, [title, description, pathname]);
  return null;
}
