/* eslint-disable @next/next/no-html-link-for-pages */
import Link from "next/link";
import { useRouter } from "next/router";
import { ru } from "../messages/ru";
import { en } from "../messages/en";
import { useSession, signIn, signOut } from "next-auth/react";
import { useGetMongo } from "../api";
import {
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  ListBulletIcon,
  Cog6ToothIcon,
  HomeIcon,
  TrophyIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

export default function Sideboard() {
  const router = useRouter();
  const { locales, locale, pathname, query, asPath } = router;
  const t = locale === "en" ? en : ru;
  const { data: session } = useSession();
  const { data: lists } = useGetMongo("sidebar", "alltoplists");
  const otherLocale = locales?.filter((l) => l !== locale)[0];

  const iconBtn = (href, icon, label, isActive) => (
    <Link href={href}>
      <a
        className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
          isActive
            ? "bg-accent text-white"
            : "text-text-muted hover:text-text-primary hover:bg-bg-glass-hover"
        }`}
        title={label}
      >
        {icon}
        <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-bg-glass text-text-primary text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-border z-50">
          {label}
        </span>
      </a>
    </Link>
  );

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 hidden lg:flex flex-col items-center w-16 py-4 glass-sidebar">
      {/* Logo */}
      <Link href="/">
        <a className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent text-white font-bold text-sm mb-6">
          BG
        </a>
      </Link>

      {/* Main nav */}
      <nav className="flex flex-col items-center gap-1.5 flex-1">
        {iconBtn("/", <HomeIcon className="h-5 w-5" />, t.nav_home, router.pathname === "/")}
        {iconBtn("/achievements", <TrophyIcon className="h-5 w-5" />, t.ach_title, router.pathname === "/achievements")}

        {/* Dynamic lists */}
        {lists && lists.map((list) => (
          <Link key={list._id} href={`/list/${list.slug}`}>
            <a
              className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                router.asPath === `/list/${list.slug}`
                  ? "bg-accent text-white"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-glass-hover"
              }`}
              title={list.name}
            >
              {list.isDefault ? (
                <StarIcon className="h-5 w-5" />
              ) : (
                <ListBulletIcon className="h-5 w-5" />
              )}
              <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-bg-glass text-text-primary text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-border z-50">
                {list.name}
              </span>
            </a>
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-1.5 mt-auto">
        {session ? (
          <>
            {session.user.role === "admin" &&
              iconBtn("/admin", <Cog6ToothIcon className="h-5 w-5" />, t.admin_title, router.pathname.startsWith("/admin"))
            }
            {iconBtn("/user/", <UserCircleIcon className="h-5 w-5" />, t.nav_profile, router.pathname === "/user")}

            {/* Language */}
            {otherLocale && (
              <Link href={{ pathname, query }} as={asPath} locale={otherLocale}>
                <a
                  className="group relative flex items-center justify-center w-10 h-10 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-glass-hover transition-all"
                  title={otherLocale.toUpperCase()}
                >
                  <LanguageIcon className="h-5 w-5" />
                  <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-bg-glass text-text-primary text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-border z-50">
                    {otherLocale.toUpperCase()}
                  </span>
                </a>
              </Link>
            )}

            {/* Logout */}
            <button
              onClick={() => signOut({ callbackUrl: `${window.location.origin}` })}
              className="group relative flex items-center justify-center w-10 h-10 rounded-xl text-text-muted hover:text-danger hover:bg-bg-glass-hover transition-all"
              title={t.button_logout}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-bg-glass text-text-primary text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-border z-50">
                {t.button_logout}
              </span>
            </button>
          </>
        ) : (
          <>
            {/* Language */}
            {otherLocale && (
              <Link href={{ pathname, query }} as={asPath} locale={otherLocale}>
                <a
                  className="group relative flex items-center justify-center w-10 h-10 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-glass-hover transition-all"
                  title={otherLocale.toUpperCase()}
                >
                  <LanguageIcon className="h-5 w-5" />
                  <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-bg-glass text-text-primary text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-border z-50">
                    {otherLocale.toUpperCase()}
                  </span>
                </a>
              </Link>
            )}

            {/* Login */}
            <button
              onClick={() => signIn()}
              className="group relative flex items-center justify-center w-10 h-10 rounded-xl text-accent hover:bg-bg-glass-hover transition-all"
              title={t.button_login}
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-bg-glass text-text-primary text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-border z-50">
                {t.button_login}
              </span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
