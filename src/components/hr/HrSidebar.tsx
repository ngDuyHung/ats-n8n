'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, ClipboardList, LogOut, PlusCircle } from 'lucide-react';
import { logout } from '@/actions/auth-actions';

const navItems = [
  { href: '/hr', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/hr/jobs', icon: Briefcase, label: 'Tin tuyển dụng' },
  { href: '/hr/applications', icon: ClipboardList, label: 'Ứng viên' },
];

export function HrSidebar({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 z-50 shadow-sm">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight tracking-tight">ATS Platform</p>
            <p className="text-xs text-blue-600 font-medium mt-0.5">HR Portal</p>
          </div>
        </div>
      </div>

      {/* New job CTA */}
      <div className="px-3 pt-4 pb-2">
        <Link
          href="/hr/jobs/new"
          className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Đăng tin mới
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : ''}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1 rounded-xl bg-gray-50">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{name}</p>
            <p className="text-xs text-gray-400">Nhà tuyển dụng · HR</p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </form>
      </div>
    </aside>
  );
}
