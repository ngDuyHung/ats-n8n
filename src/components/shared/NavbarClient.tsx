"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { Briefcase, FileText, UserCheck, Menu, X } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

type NavSession = { name: string; role: string } | null;

export function NavbarClient({ session }: { session: NavSession }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            {/* <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition">
              <Briefcase className="w-4 h-4 text-white" />
            </div> */}
            <Image
              src="/AICoBan.png"
              alt="AICoBan"
              width={128}
              height={40}
              style={{ height: 'auto' }}
              className="w-32"
            />
            {/* <span className="font-bold text-gray-900 tracking-tight text-[15px]">ATS Platform</span> */}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {!session ? (
              <>
                <Link
                  href="/jobs"
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Việc làm
                </Link>
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Đăng ký
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/jobs"
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <Briefcase className="w-4 h-4" /> Việc làm
                </Link>
                <Link
                  href="/my-applications"
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <FileText className="w-4 h-4" /> Hồ sơ của tôi
                </Link>
                <Link
                  href="/become-hr"
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <UserCheck className="w-4 h-4" /> Đăng tuyển
                </Link>
                <div className="flex items-center gap-2.5 pl-3 ml-1 border-l border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                    {session.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 font-medium hidden lg:block max-w-[120px] truncate">
                    {session.name}
                  </span>
                  <LogoutButton />
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 shadow-lg">
          {!session ? (
            <>
              <Link
                href="/jobs"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50"
              >
                <Briefcase className="w-4 h-4 text-gray-400" /> Việc làm
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 text-sm bg-blue-600 text-white py-2.5 px-3 rounded-lg mt-1 font-medium"
              >
                Đăng ký
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 py-2.5 px-3 mb-1 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                  {session.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-900 truncate">
                  {session.name}
                </span>
              </div>
              <Link
                href="/jobs"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50"
              >
                <Briefcase className="w-4 h-4 text-gray-400" /> Việc làm
              </Link>
              <Link
                href="/my-applications"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50"
              >
                <FileText className="w-4 h-4 text-gray-400" /> Hồ sơ của tôi
              </Link>
              <Link
                href="/become-hr"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50"
              >
                <UserCheck className="w-4 h-4 text-gray-400" /> Đăng tuyển dụng
              </Link>
              <div className="pt-2 border-t border-gray-100 mt-1 px-1">
                <LogoutButton />
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
