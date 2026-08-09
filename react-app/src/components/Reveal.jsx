import { useEffect, useRef, useState } from "react";

/**
 * Reveal — animation d'entrée au scroll.
 * @param {string}  variant  "fade" (défaut) | "clip" (wipe clip-path)
 * @param {string}  delay    "1" | "2" | "3" | "4" — stagger pour les grilles
 */
export default function Reveal({
  as: Tag = "div",
  className = "",
  variant = "fade",
  delay,
  children,
  ...rest
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      // Seuil à 0 + marge basse, et surtout PAS un seuil de ratio.
      //
      // La variante "clip" part avec `clip-path: inset(0 0 100% 0)`, que le
      // navigateur applique avant de calculer l'intersection : le rectangle
      // mesuré fait 0 px de haut et le ratio reste bloqué à 0, quelle que soit
      // la position à l'écran. Un seuil de 0.12 n'était donc jamais atteint et
      // l'élément restait invisible pour toujours — l'animation ne pouvait pas
      // se déclencher, puisque c'est elle qui lève le clip.
      //
      // La marge négative en bas remplace l'intention du seuil : ne pas
      // déclencher pile sur le bord de l'écran. En pixels et non en pourcentage,
      // pour qu'un élément en pied de page finisse toujours par se révéler.
      { threshold: 0, rootMargin: "0px 0px -48px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const baseClass = variant === "clip" ? "reveal-clip" : "reveal";
  const delayClass = delay ? `reveal-delay-${delay}` : "";
  const classes = [baseClass, visible ? "is-visible" : "", delayClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag ref={ref} className={classes} {...rest}>
      {children}
    </Tag>
  );
}
