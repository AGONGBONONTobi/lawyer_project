import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const FAQ_DATA = [{
  category: "Nationalité française",
  items: [
    { value: "nationalite-1", question: "Comment savoir si je suis déjà français ?", answer: "Votre filiation et votre histoire familiale peuvent ouvrir une piste. Le cabinet étudie les actes d’état civil et les justificatifs utiles pour déterminer si une reconnaissance de nationalité, notamment par certificat de nationalité française, doit être envisagée." },
    { value: "nationalite-2", question: "Quel niveau de français faut-il justifier ?", answer: "Depuis le 1er janvier 2026, le niveau B2 à l’oral et à l’écrit est requis pour la naturalisation, la réintégration par décret et la déclaration par mariage, sous réserve des dispenses et aménagements applicables. Les exigences diffèrent pour les autres voies." },
    { value: "nationalite-3", question: "Ma demande a été ajournée ou refusée. Que faire ?", answer: "Faites examiner rapidement la décision et sa notification. Les modalités de recours et les délais dépendent de la procédure et du motif de la décision ; un refus de certificat de nationalité ne suit pas la même procédure qu’un refus de naturalisation." },
    { value: "nationalite-4", question: "Mon frère est français, puis-je le devenir aussi ?", answer: "Une voie par déclaration peut être étudiée si vous êtes majeur, résidez régulièrement en France depuis l’âge de 6 ans et y avez suivi la scolarité obligatoire. Il faut aussi vérifier comment votre frère ou votre sœur est devenu français. Sa nationalité ne suffit pas à elle seule." },
    { value: "nationalite-5", question: "Faut-il passer un examen civique ?", answer: "Les procédures de naturalisation et de réintégration par décret nécessitent une attestation de réussite à l’examen civique depuis 2026. Les déclarations par mariage, comme ascendant ou comme frère ou sœur de Français ne sont pas concernées par cet examen." },
    { value: "nationalite-6", question: "Combien coûte l’accompagnement ?", answer: "Le Bilan nationalité dure une heure et coûte 150 € TTC, déduits du forfait si vous confiez le dossier au cabinet. Le forfait naturalisation est de 2 160 € TTC, payable en trois fois. Les autres missions sont précisées dans un devis et une convention d’honoraires ; les frais administratifs et traductions ne sont pas compris." },
    { value: "nationalite-7", question: "Peut-on travailler à distance ?", answer: "Oui. Les rendez-vous sont possibles au cabinet à Paris 17e ou en visioconférence, en français, en anglais ou en italien. Les modalités d’échange des pièces sont précisées avec vous lors du rendez-vous." },
  ],
}];

export default function FAQ({ sectionRef }) {
  return (
    <section id="faq" ref={sectionRef} className="bg-background py-20 lg:py-32">
      <div className="w-full max-w-6xl mx-auto px-6">

        {/* ── Header (full-width, always on top) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 lg:mb-16"
        >
          <p className="font-mono text-xs tracking-[0.18em] uppercase text-[var(--gold-ink)] mb-3">
            Foire Aux Questions
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-foreground mb-4">
            Vos questions, avant de commencer.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-xl">
            Retrouvez ici les réponses aux questions les plus courantes sur les
            démarches de nationalité et l’accompagnement du cabinet. Si vous avez d'autres interrogations,
            n'hésitez pas à{" "}
            <a href="#contact" className="underline hover:text-foreground transition-colors">
              nous contacter
            </a>
            .
          </p>
        </motion.div>

        {/* ── Accordion groups ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-10"
        >
          {FAQ_DATA.map((group) => (
            <div key={group.category}>
              <p className="text-xs font-mono uppercase tracking-[0.16em] font-semibold text-[var(--gold-ink)] mb-4 pb-3 border-b border-border">
                {group.category}
              </p>
              <Accordion type="multiple" className="w-full">
                {group.items.map((item) => (
                  <AccordionItem key={item.value} value={item.value}>
                    <AccordionTrigger className="text-left text-base font-normal">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
