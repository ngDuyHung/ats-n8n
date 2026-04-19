"use client";

import { useState } from "react";
import { finalizeSelection } from "@/actions/ats-actions";
import { ListChecks, Loader2 } from "lucide-react";

export function FinalizeButton() {
  const [loading, setLoading] = useState(false);

  const handleFinalize = async () => {
    const jobId = prompt("Nhập mã công việc (Job ID) cần chốt sổ:");
    if (!jobId) return;

    const quota = prompt("Nhập số lượng ứng viên cần tuyển (số lượng top đầu):", "1");
    if (!quota || isNaN(Number(quota))) {
      alert("Số lượng tuyển không hợp lệ.");
      return;
    }

    if (!confirm(`Xác nhận chốt sổ cho ${jobId} với số lượng tuyển là ${quota}?`)) return;

    setLoading(true);
    const result = await finalizeSelection(jobId, Number(quota));
    
    if (result.success) {
      alert("Đã gửi lệnh chốt sổ thành công! Hệ thống đang phân loại và gửi mail.");
    } else {
      alert("Lỗi: " + result.error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleFinalize}
      disabled={loading}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <ListChecks className="w-4 h-4" />
      )}
      Chốt sổ ứng viên
    </button>
  );
}