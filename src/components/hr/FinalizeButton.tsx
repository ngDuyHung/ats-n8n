'use client';

import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
    try {
      const webhookUrl = '/api/chot-so';
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, so_luong_tuyen: quota }),
      });
      if (!res.ok) throw new Error('Lỗi kết nối n8n');
      toast.success('Chốt sổ thành công! Email đang được gửi đi.');
    } catch {
      toast.error('Chốt sổ thất bại. Kiểm tra kết nối n8n.');
    } finally {
      setLoading(false);
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
