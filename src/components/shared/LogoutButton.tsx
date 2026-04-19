'use client';

import { logout } from '@/actions/auth-actions';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition"
      >
        <LogOut className="w-4 h-4" />
        Đăng xuất
      </button>
    </form>
  );
}
