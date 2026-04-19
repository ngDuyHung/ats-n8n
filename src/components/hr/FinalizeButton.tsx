'use client';

import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { chotSoJob } from '@/actions/job-actions';

type Props = {
  jobId: string;
  jobTitle: string;
  quota: number;
};

export function FinalizeButton({ jobId, jobTitle, quota }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleFinalize() {
    if (
      !confirm(
        `Chốt sổ cho "${jobTitle}"?\n\nSẽ chọn ${quota} ứng viên điểm cao nhất làm PASSED, còn lại FAILED.\nHệ thống sẽ tự động gửi email thông báo kết quả.`
      )
    )
      return;

    setLoading(true);
    const result = await chotSoJob(jobId, quota);
    setLoading(false);

    if (result.success) {
      toast.success('Chốt sổ thành công! Email đang được gửi đi.');
    } else {
      toast.error(result.error ?? 'Chốt sổ thất bại.');
    }
  }

  return (
    <button
      onClick={handleFinalize}
      disabled={loading}
      className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-60 text-sm"
    >
      {loading ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</>
      ) : (
        <><CheckCircle className="w-4 h-4" /> Chốt sổ ({quota} vị trí)</>
      )}
    </button>
  );
}
