/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ru } from "../messages/ru";
import { en } from "../messages/en";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { locales, locale, pathname, query, asPath } = useRouter();
  const t = router.locale === "en" ? en : ru;
  const otherLocales = locales.filter((l) => l !== locale);

  const navLink = (href, label) => (
    <Link href={href}>
      <a className={`text-sm px-3 py-1.5 rounded-lg transition-all ${
        router.pathname === href
          ? "text-text-primary bg-bg-glass-hover"
          : "text-text-secondary hover:text-text-primary hover:bg-bg-glass-hover"
      }`}>
        {label}
      </a>
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 glass-nav">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-14">
          {/* Left: logo + nav */}
          <div className="flex items-center gap-1">
            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-1">
              {navLink("/", t.nav_home)}
              {navLink("/achievements", t.ach_title)}
              {session && navLink("/user", t.nav_profile)}
              {session?.user?.role === "admin" && navLink("/admin", t.admin_title)}
            </nav>
          </div>

          {/* Right: lang + auth */}
          <div className="flex items-center gap-2">
            {otherLocales.map((loc) => (
              <Link key={loc} href={{ pathname, query }} as={asPath} locale={loc}>
                <a className="uppercase text-text-muted hover:text-text-primary text-xs px-2 py-1.5 rounded-lg hover:bg-bg-glass-hover transition-all">
                  {loc}
                </a>
              </Link>
            ))}
            {status === "authenticated" ? (
              <button
                onClick={() => signOut({ callbackUrl: `${window.location.origin}` })}
                className="text-text-muted hover:text-text-primary text-xs px-3 py-1.5 rounded-lg border border-border hover:border-text-muted transition-all"
              >
                {t.button_logout}
              </button>
            ) : (
              <button
                onClick={() => signIn()}
                className="text-white bg-accent hover:bg-accent-light text-xs font-medium px-4 py-1.5 rounded-lg transition-all"
              >
                {t.button_login}
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="sm:hidden text-text-muted hover:text-text-primary ml-1"
            >
              {isOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <div className="sm:hidden border-t border-border">
          <div className="px-4 py-3 space-y-1">
            <Link href="/">
              <a className="block text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg text-sm">{t.nav_home}</a>
            </Link>
            <Link href="/achievements">
              <a className="block text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg text-sm">{t.ach_title}</a>
            </Link>
            {session && (
              <Link href="/user">
                <a className="block text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg text-sm">{t.nav_profile}</a>
              </Link>
            )}
            {session?.user?.role === "admin" && (
              <Link href="/admin">
                <a className="block text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg text-sm">{t.admin_title}</a>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Nav;
