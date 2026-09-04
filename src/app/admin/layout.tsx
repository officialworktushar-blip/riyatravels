"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Car,
  CalendarDays,
  Settings,
  Star,
  LogOut,
  Menu,
  X,
  IndianRupee,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/vehicles", label: "Vehicles", icon: Car },
  { href: "/admin/pricing", label: "Pricing", icon: IndianRupee },
  { href: "/admin/availability", label: "Availability", icon: CalendarDays },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fetching, setFetching] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/admin/login");
      }
      setFetching(false);
    });
  }, [supabase, router]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F5]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-400 border-t-transparent" />
      </div>
    );
  }

  // Login page: no layout chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <div className="flex min-h-screen bg-[#F7F7F5]">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 shrink-0 flex-col bg-navy-700 text-white md:flex">
          <div className="flex h-16 items-center border-b border-white/10 px-6">
            <Link href="/admin/dashboard" className="text-lg font-bold text-white">
              Riya<span className="text-gold-400">Travels</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-gold-400 text-navy-700"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white min-h-[44px]"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        {/* Mobile overlay */}
        <div
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Mobile sidebar panel */}
        <div
          className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-navy-700 text-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
            <span className="text-lg font-bold">
              Riya<span className="text-gold-400">Travels</span>
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
            >
              <X size={22} />
            </button>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors min-h-[44px] ${
                    active
                      ? "bg-gold-400 text-navy-700"
                      : "text-gray-300 hover:bg-white/10 hover:text-white active:bg-white/15"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 p-4">
            <button
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white min-h-[44px]"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8">
            <button
              className="md:hidden flex h-11 w-11 items-center justify-center rounded-lg text-navy-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
            <h1 className="font-semibold text-navy-700">Admin Panel</h1>
          </header>
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </>
  );
}
