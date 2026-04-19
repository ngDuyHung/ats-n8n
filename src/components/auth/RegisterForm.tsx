'use client';

import { register } from '@/actions/auth-actions';
import { useActionState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);
  const [showPw, setShowPw] = useState(false);

  return (
    <form action={action} className="space-y-4">
      {state?.message && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-xl">
          {state.message}
        </div>
      )}

      <div>
        <input
          name="name"
          type="text"
          placeholder="Họ và tên"
          required
          className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
        {state?.errors?.name && (
          <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
        {state?.errors?.email && (
          <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="relative">
        <input
          name="password"
          type={showPw ? 'text' : 'password'}
          placeholder="Mật khẩu (ít nhất 8 ký tự, có số và chữ)"
          required
          className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm pr-12"
        />
        <button
          type="button"
          onClick={() => setShowPw((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          tabIndex={-1}
        >
          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        {state?.errors?.password && (
          <ul className="text-red-500 text-xs mt-1 space-y-0.5">
            {state.errors.password.map((e) => (
              <li key={e}>• {e}</li>
            ))}
          </ul>
        )}
      </div>

      <button
        disabled={pending}
        type="submit"
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {pending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Đang tạo tài khoản...
          </>
        ) : (
          'Tạo tài khoản'
        )}
      </button>
    </form>
  );
}
