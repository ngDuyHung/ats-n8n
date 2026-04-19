'use client';

import { applyForJob } from '@/actions/ats-actions';
import { useActionState } from 'react';
import { Upload, Loader2, FileText } from 'lucide-react';
import { useState } from 'react';

type Props = {
  jobId: string;
  jobTitle: string;
  jdText: string;
  candidateEmail: string;
  candidateName: string;
};

export function ApplyForm({ jobId, jobTitle, jdText, candidateEmail, candidateName }: Props) {
  const [state, action, pending] = useActionState(applyForJob, undefined);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <form action={action} className="space-y-5">
      {/* Hidden fields */}
      <input type="hidden" name="job_id" value={jobId} />
      <input type="hidden" name="jd_text" value={jdText} />

      {state?.message && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-xl">
          {state.message}
        </div>
      )}

      {/* Email (readonly - từ session) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email ứng tuyển</label>
        <input
          name="candidate_email"
          type="email"
          value={candidateEmail}
          readOnly
          className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-sm"
        />
      </div>

      {/* Tên (readonly - từ session) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
        <input
          name="candidate_name"
          type="text"
          value={candidateName}
          readOnly
          className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-sm"
        />
      </div>

      {/* Upload CV */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">CV của bạn (PDF) *</label>
        <label
          htmlFor="cv_file_input"
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition"
        >
          {fileName ? (
            <>
              <FileText className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-blue-600">{fileName}</span>
              <span className="text-xs text-gray-400 mt-1">Nhấn để đổi file</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-300 mb-2" />
              <span className="text-sm text-gray-500">Nhấn để tải lên CV (PDF)</span>
              <span className="text-xs text-gray-400 mt-1">Tối đa 10MB</span>
            </>
          )}
        </label>
        <input
          id="cv_file_input"
          name="cv_file"
          type="file"
          accept=".pdf"
          required
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </div>

      <button
        disabled={pending}
        type="submit"
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi hồ sơ...</> : 'Nộp hồ sơ ngay'}
      </button>
    </form>
  );
}
