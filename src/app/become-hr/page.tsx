'use client';

import { submitHrRequest } from '@/actions/hr-request-actions';
import type { BecomeHrState } from '@/actions/hr-request-actions';
import { useActionState } from 'react';
import { Loader2, Building2 } from 'lucide-react';

export default function BecomeHrPage() {
  const [state, action, pending] = useActionState<BecomeHrState, FormData>(
    submitHrRequest,
    undefined
  );

  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trở thành Nhà Tuyển Dụng</h1>
            <p className="text-gray-500 text-sm">Điền thông tin để Admin xét duyệt</p>
          </div>
        </div>

        {state?.message && (
          <div className="mb-4 text-sm bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-xl">
            {state.message}
          </div>
        )}

        <form action={action} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên công ty *</label>
            <input
              name="company_name"
              type="text"
              placeholder="Công ty TNHH ABC"
              required
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
            {state?.errors?.company_name && (
              <p className="text-red-500 text-xs mt-1">{state.errors.company_name[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website công ty <span className="text-gray-400">(tuỳ chọn)</span>
            </label>
            <input
              name="company_website"
              type="url"
              placeholder="https://company.com"
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
            {state?.errors?.company_website && (
              <p className="text-red-500 text-xs mt-1">{state.errors.company_website[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lý do muốn đăng tuyển dụng *
            </label>
            <textarea
              name="reason"
              rows={4}
              placeholder="Mô tả ngắn về nhu cầu tuyển dụng và lĩnh vực hoạt động của công ty bạn... (ít nhất 20 ký tự)"
              required
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
            />
            {state?.errors?.reason && (
              <p className="text-red-500 text-xs mt-1">{state.errors.reason[0]}</p>
            )}
          </div>

          <button
            disabled={pending}
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {pending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...
              </>
            ) : (
              'Gửi đơn đăng ký'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
