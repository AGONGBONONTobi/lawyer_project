import { useRef } from "react";
import { AnimatedNavFramer } from "../components/ui/navigation-menu";
import Hero from "../components/Hero";
import Presentation from "../components/Presentation";
import Competences from "../components/Competences";
import Honoraires from "../components/Honoraires";
import Contact from "../components/Contact";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import MobileBar from "../components/MobileBar";
import BackToTop from "../components/BackToTop";
import { useScrollEffects } from "../hooks/useScrollEffects";
import { TrustBand, NationalityPaths, Naturalisation, Method, Employers } from "../components/Nationalite";
import PageMeta from "../components/PageMeta";
import { useScrollSpy } from "../hooks/useScrollSpy";

export default function Home() {
  const backToTopRef = useRef(null);

  const heroSectionRef = useRef(null);
  const presentationSectionRef = useRef(null);
  const competencesSectionRef = useRef(null);
  const methodSectionRef = useRef(null);
  const nationalitySectionRef = useRef(null);
  const faqSectionRef = useRef(null);
  const honorairesSectionRef = useRef(null);
  const contactSectionRef = useRef(null);

  useScrollEffects({ backToTopRef });
  const activeSection = useScrollSpy([
    heroSectionRef,
    presentationSectionRef,
    competencesSectionRef,
    methodSectionRef,
    nationalitySectionRef,
    faqSectionRef,
    honorairesSectionRef,
    contactSectionRef,
  ]);

  return (
    <>
      <PageMeta title="Avocate nationalité française et naturalisation – Paris 17e | Maître Moradéké Badirou" description="Naturalisation, certificat de nationalité, réintégration et voies familiales. Maître Moradéké Badirou vous accompagne à Paris 17e et à distance. Diagnostic gratuit." />
      <a className="skip-link" href="#main">Aller au contenu</a>

      <AnimatedNavFramer activeSection={activeSection} />

      <main id="main">
        <Hero sectionRef={heroSectionRef} />
        <TrustBand />
        <NationalityPaths sectionRef={nationalitySectionRef} />
        <Naturalisation />
        <Method sectionRef={methodSectionRef} />
        <Honoraires sectionRef={honorairesSectionRef} />
        <Employers />
        <Competences sectionRef={competencesSectionRef} />
        <Presentation sectionRef={presentationSectionRef} />
        <FAQ sectionRef={faqSectionRef} />
        <Contact sectionRef={contactSectionRef} />
      </main>

      <Footer />
      <MobileBar />
      <BackToTop backToTopRef={backToTopRef} />
    </>
  );
}
