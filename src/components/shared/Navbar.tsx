import { getSession } from '@/lib/session';
import { LogoutButton } from '@/components/shared/LogoutButton';
import Link from 'next/link';
import { Briefcase, FileText, UserCheck } from 'lucide-react';

export async function Navbar() {
  const session = await getSession();

  // Admin and HR have dedicated sidebar layouts — no top navbar needed
  if (session?.role === 'admin' || session?.role === 'hr') return null;

  return (
    <nav className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-5 h-15 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition">
            <Briefcase className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-gray-900 tracking-tight">ATS Platform</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
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
            /* CLIENT role */
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
                <UserCheck className="w-4 h-4" /> Đăng tuyển dụng
              </Link>
              <div className="flex items-center gap-3 pl-3 ml-1 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                  {session.name.charAt(0).toUpperCase()}
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
