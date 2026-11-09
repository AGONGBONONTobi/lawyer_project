import * as React from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { id: "nationalite", name: "Nationalité", href: "#nationalite" },
  { id: "methode", name: "Méthode", href: "#methode" },
  { id: "honoraires", name: "Honoraires", href: "#honoraires" },
  { id: "presentation", name: "Le cabinet", href: "#presentation" },
  { id: "faq", name: "FAQ", href: "#faq" },
];

export function AnimatedNavFramer({ activeSection }: { activeSection?: string }) {
  const [isExpanded, setExpanded] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { scrollY } = useScroll();
  const reduceMotion = useReducedMotion();
  const lastY = React.useRef(0);
  const collapsedAt = React.useRef(0);
  const navigation = React.useRef<HTMLElement>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const hasFocus = navigation.current?.contains(document.activeElement);
    if (!hasFocus && !mobileOpen && isExpanded && latest > lastY.current && latest > 150) {
      setExpanded(false);
      collapsedAt.current = latest;
    } else if (!isExpanded && (latest < 80 || (latest < lastY.current && collapsedAt.current - latest > 80))) {
      setExpanded(true);
    }
    lastY.current = latest;
  });

  React.useEffect(() => {
    if (!mobileOpen) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        navigation.current?.querySelector<HTMLButtonElement>(".nav-mobile-toggle")?.focus();
      }
    };
    const outside = (e: PointerEvent) => {
      if (!navigation.current?.contains(e.target as Node)) setMobileOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, [mobileOpen]);

  return <div className="floating-nav-wrap">
    <motion.nav ref={navigation} aria-label="Navigation principale"
      className={`floating-nav ${isExpanded ? "is-expanded" : "is-collapsed"}`}
      initial={reduceMotion ? false : { y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1, width: isExpanded ? "min(760px, calc(100vw - 32px))" : "48px" }}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", damping: 24, stiffness: 260 }}>
      <div className="nav-expanded-content" inert={!isExpanded} aria-hidden={!isExpanded}>
        <a href="#accueil" className="nav-brand" aria-label="Maître Badirou — Accueil">
          <img src="/assets/img/moradeke-badirou-logo.png" alt="" width="28" height="28" />
        </a>
        <div className="nav-desktop-links">{NAV_ITEMS.map(item => <a key={item.id} href={item.href} aria-current={activeSection === item.id ? "location" : undefined}>{item.name}</a>)}</div>
        <Link className="nav-diagnostic" to="/diagnostic">Diagnostic gratuit <span aria-hidden="true">↗</span></Link>
        <button className="nav-mobile-toggle" type="button" aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen(open => !open)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      {!isExpanded && <button className="nav-reopen" type="button" aria-label="Ouvrir la navigation" aria-expanded="false" onClick={() => { setExpanded(true); setMobileOpen(window.matchMedia("(max-width: 700px)").matches); }}><Menu size={20} /></button>}
      {isExpanded && mobileOpen && <div className="nav-mobile-links" id="mobile-navigation">{NAV_ITEMS.map(item => <a key={item.id} href={item.href} onClick={() => setMobileOpen(false)}>{item.name}<span aria-hidden="true">↗</span></a>)}</div>}
    </motion.nav>
  </div>;
}
