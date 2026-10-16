"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/Button";
import { TodayHours } from "@/components/ui/TodayHours";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/menu", label: "La carte" },
  { href: "/galerie", label: "Galerie" },
  { href: "/avis", label: "Avis" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Transparent au-dessus de la photo d'accueil, plein dès qu'on défile
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Menu mobile : page figée derrière, Échap pour fermer, focus rendu au bouton
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const solid = scrolled || open || pathname !== "/";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "border-b border-line bg-night" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-6 px-6 md:h-20 md:px-12">
        <Link href="/" className="inline-flex h-11 items-center font-display text-[1.75rem] leading-none text-cream">
          Braise
        </Link>

        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex h-11 items-center text-sm transition-colors ${
                      active
                        ? "text-cream underline decoration-brass underline-offset-[10px]"
                        : "text-muted hover:text-cream"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden md:block">
          <Button href="/reservation" className="h-11 px-5">
            Réserver
          </Button>
        </div>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="-mr-2 flex h-11 w-11 items-center justify-center text-cream md:hidden"
        >
          {open ? <X size={26} aria-hidden="true" /> : <List size={26} aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div id="menu-mobile" className="fixed inset-x-0 bottom-0 top-[72px] overflow-y-auto bg-night md:hidden">
          <nav aria-label="Navigation mobile" className="px-6 pb-28 pt-6">
            <ul>
              {NAV.map((item) => (
                <li key={item.href} className="border-b border-line">
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className={`flex h-16 items-center font-display text-3xl ${
                      pathname === item.href ? "text-brass" : "text-cream"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <TodayHours className="mt-8 block text-muted" />
          </nav>
        </div>
      )}
    </header>
  );
}
