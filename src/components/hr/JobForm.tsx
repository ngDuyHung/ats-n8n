'use client';

import type { JobFormState } from '@/actions/job-actions';
import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';

type JobFormProps = {
  action: (state: JobFormState, formData: FormData) => Promise<JobFormState>;
  defaultValues?: {
    title?: string;
    description?: string;
    department?: string;
    location?: string;
    salary_range?: string;
    deadline?: string;
    quota?: number;
  };
  submitLabel?: string;
};

export function JobForm({ action, defaultValues = {}, submitLabel = 'Đăng tin' }: JobFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      {state?.message && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-xl">
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tiêu đề */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề vị trí *</label>
          <input
            name="title"
            defaultValue={defaultValues.title}
            placeholder="VD: Senior Frontend Developer"
            required
            className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
          {state?.errors?.title && <p className="text-red-500 text-xs mt-1">{state.errors.title[0]}</p>}
        </div>

        {/* Phòng ban */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban *</label>
          <input
            name="department"
            defaultValue={defaultValues.department}
            placeholder="VD: Engineering"
            required
            className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
          {state?.errors?.department && <p className="text-red-500 text-xs mt-1">{state.errors.department[0]}</p>}
        </div>

        {/* Địa điểm */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm *</label>
          <input
            name="location"
            defaultValue={defaultValues.location}
            placeholder="VD: Hà Nội / Remote"
            required
            className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
          {state?.errors?.location && <p className="text-red-500 text-xs mt-1">{state.errors.location[0]}</p>}
        </div>

        {/* Mức lương */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mức lương <span className="text-gray-400">(tuỳ chọn)</span>
          </label>
          <input
            name="salary_range"
            defaultValue={defaultValues.salary_range}
            placeholder="VD: 20 - 35 triệu"
            className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hạn nộp hồ sơ *</label>
          <input
            name="deadline"
            type="date"
            defaultValue={defaultValues.deadline}
            required
            className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
          {state?.errors?.deadline && <p className="text-red-500 text-xs mt-1">{state.errors.deadline[0]}</p>}
        </div>

        {/* Số lượng tuyển */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng cần tuyển *</label>
          <input
            name="quota"
            type="number"
            min={1}
            defaultValue={defaultValues.quota ?? 1}
            required
            className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
          {state?.errors?.quota && <p className="text-red-500 text-xs mt-1">{state.errors.quota[0]}</p>}
        </div>

        {/* Mô tả công việc */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả công việc (JD) *</label>
          <textarea
            name="description"
            defaultValue={defaultValues.description}
            rows={10}
            placeholder="Mô tả chi tiết vị trí, yêu cầu kỹ năng, trách nhiệm công việc..."
            required
            className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-y"
          />
          {state?.errors?.description && <p className="text-red-500 text-xs mt-1">{state.errors.description[0]}</p>}
        </div>
      </div>

      <button
        disabled={pending}
        type="submit"
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</> : submitLabel}
      </button>
    </form>
  );
}
