import { getSession } from '@/lib/session';
import { LogoutButton } from '@/components/shared/LogoutButton';
import Link from 'next/link';
import { Briefcase, LayoutDashboard, Users, FileText, UserCheck, ClipboardList } from 'lucide-react';

export async function Navbar() {
  const session = await getSession();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg text-blue-600 tracking-tight">
          ATS Platform
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-5 text-sm">
          {!session ? (
            <>
              <Link href="/jobs" className="text-gray-600 hover:text-gray-900 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" /> Việc làm
              </Link>
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Đăng ký
              </Link>
            </>
          ) : (
            <>
              {/* CLIENT menu */}
              {session.role === 'client' && (
                <>
                  <Link href="/jobs" className="text-gray-600 hover:text-gray-900 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" /> Việc làm
                  </Link>
                  <Link href="/my-applications" className="text-gray-600 hover:text-gray-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Hồ sơ của tôi
                  </Link>
                  <Link href="/become-hr" className="text-gray-600 hover:text-gray-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" /> Đăng tuyển dụng
                  </Link>
                </>
              )}

              {/* HR menu */}
              {session.role === 'hr' && (
                <>
                  <Link href="/hr" className="text-gray-600 hover:text-gray-900 flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link href="/hr/jobs" className="text-gray-600 hover:text-gray-900 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" /> Tin tuyển dụng
                  </Link>
                  <Link href="/hr/applications" className="text-gray-600 hover:text-gray-900 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4" /> Ứng viên
                  </Link>
                </>
              )}

              {/* ADMIN menu */}
              {session.role === 'admin' && (
                <>
                  <Link href="/admin" className="text-gray-600 hover:text-gray-900 flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link href="/admin/users" className="text-gray-600 hover:text-gray-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Users
                  </Link>
                  <Link href="/admin/hr-requests" className="text-gray-600 hover:text-gray-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" /> HR Requests
                  </Link>
                  <Link href="/admin/applications" className="text-gray-600 hover:text-gray-900 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4" /> Ứng viên
                  </Link>
                </>
              )}

              {/* User info + logout */}
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-gray-800 leading-tight">{session.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{session.role}</p>
                </div>
                <LogoutButton />
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
