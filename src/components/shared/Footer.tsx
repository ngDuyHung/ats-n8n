import Link from 'next/link';
import { Briefcase, MapPin, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3 group">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-[15px] tracking-tight">ATS Platform</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Hệ thống tuyển dụng thông minh, kết nối nhà tuyển dụng với ứng viên tiềm năng nhanh chóng và hiệu quả.
            </p>
          </div>

          {/* Khám phá */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Khám phá</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/jobs" className="hover:text-white transition">Tất cả việc làm</Link>
              </li>
              <li>
                <Link href="/become-hr" className="hover:text-white transition">Đăng tuyển dụng</Link>
              </li>
              <li>
                <Link href="/my-applications" className="hover:text-white transition">Hồ sơ của tôi</Link>
              </li>
            </ul>
          </div>

          {/* Tài khoản */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Tài khoản</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="hover:text-white transition">Đăng nhập</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition">Đăng ký</Link>
              </li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Liên hệ</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
                <span>Hà Nội, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-gray-500" />
                <span>support@atsplatform.vn</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-gray-500" />
                <span>1900 xxxx</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} ATS Platform. Bảo lưu mọi quyền.</span>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-gray-300 transition">Chính sách bảo mật</Link>
            <Link href="#" className="hover:text-gray-300 transition">Điều khoản sử dụng</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
