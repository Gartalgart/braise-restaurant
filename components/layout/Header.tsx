"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { EASE, SPRING_SNAPPY, staggerParent } from "@/lib/motion";
import { RESTAURANT } from "@/lib/restaurant";
import { MagneticButton } from "@/components/ui/MagneticButton";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/menu", label: "Menu" },
  { href: "/galerie", label: "Galerie" },
  { href: "/avis", label: "Avis" },
  { href: "/contact", label: "Contact" },
];

// Statut du jour affiché dans la barre — l'info qu'un client cherche en premier
function todayStatus() {
  const idx = (new Date().getDay() + 6) % 7; // hours[] commence lundi
  const h = RESTAURANT.hours[idx];
  if (!h.lunch && !h.dinner) return { open: false, label: "Fermé aujourd'hui" };
  return { open: true, label: `Ouvert · ${[h.lunch, h.dinner].filter(Boolean).join(" / ")}` };
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  // Calculé côté client pour éviter un décalage d'hydratation sur la date
  useEffect(() => setStatus(todayStatus()), []);
  useEffect(() => setOpen(false), [pathname]);

  // Le menu plein écran fige la page derrière lui
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...SPRING_SNAPPY, delay: 0.15 }}
        className="fixed inset-x-0 top-0 z-[80] px-3 pt-3 md:px-5 md:pt-5"
      >
        <motion.div
          animate={{
            paddingTop: scrolled ? 8 : 14,
            paddingBottom: scrolled ? 8 : 14,
            backgroundColor: scrolled ? "rgb(11 10 9 / 0.72)" : "rgb(11 10 9 / 0.28)",
          }}
          transition={{ duration: 0.35, ease: EASE }}
          className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-pill border border-white/8 px-3 pl-5 backdrop-blur-xl md:px-4 md:pl-7"
        >
          <Link
            href="/"
            className="flex items-baseline font-display text-3xl font-bold uppercase leading-none tracking-tight"
          >
            Braise
            <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-braise shadow-ember" aria-hidden="true" />
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center md:flex">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`meta relative rounded-pill px-4 py-2.5 transition-colors ${
                    active ? "text-cream" : "text-ash hover:text-cream"
                  }`}
                >
                  {/* La pastille active glisse d'un onglet à l'autre */}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      transition={SPRING_SNAPPY}
                      className="absolute inset-0 -z-10 rounded-pill border border-white/10 bg-white/6"
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {status && (
              <span className="meta hidden items-center gap-2 px-3 text-ash lg:flex">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${status.open ? "bg-ember shadow-ember" : "bg-ash"}`}
                  aria-hidden="true"
                />
                {status.label}
              </span>
            )}

            <span className="hidden md:block">
              <MagneticButton href="/reservation" className="px-6 py-3">
                Réserver
              </MagneticButton>
            </span>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              className="glass flex h-11 w-11 items-center justify-center rounded-full md:hidden"
            >
              <span className="flex flex-col items-center justify-center gap-[5px]" aria-hidden="true">
                <motion.span
                  animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  transition={SPRING_SNAPPY}
                  className="block h-[1.5px] w-5 bg-cream"
                />
                <motion.span
                  animate={open ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className="block h-[1.5px] w-5 bg-cream"
                />
                <motion.span
                  animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                  transition={SPRING_SNAPPY}
                  className="block h-[1.5px] w-5 bg-cream"
                />
              </span>
            </button>
          </div>
        </motion.div>
      </motion.header>

      {/* Menu mobile plein écran — les entrées entrent en cascade */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-0 z-[75] bg-night/95 backdrop-blur-2xl md:hidden"
          >
            <motion.nav
              aria-label="Navigation mobile"
              variants={staggerParent(0.06, 0.12)}
              initial="hidden"
              animate="visible"
              className="flex h-full flex-col justify-center px-6 pb-24 pt-20"
            >
              <ul>
                {NAV.map((item, i) => (
                  <motion.li
                    key={item.href}
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      visible: { opacity: 1, y: 0, transition: SPRING_SNAPPY },
                    }}
                    className="border-b border-white/8"
                  >
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className={`flex items-baseline gap-4 py-5 font-display text-5xl font-bold uppercase leading-none ${
                        pathname === item.href ? "text-ember" : "text-cream"
                      }`}
                    >
                      <span className="meta text-braise">0{i + 1}</span>
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: SPRING_SNAPPY },
                }}
                className="mt-10"
              >
                <MagneticButton href="/reservation" className="w-full">
                  Réserver une table
                </MagneticButton>
                {status && <p className="meta mt-6 text-center text-ash">{status.label}</p>}
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
