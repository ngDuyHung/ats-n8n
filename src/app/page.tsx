"use client";
import { useState } from "react";
import { submitCV } from "@/actions/ats-actions";
import { Upload, Send, CheckCircle } from "lucide-react";

export default function CandidatePage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await submitCV(formData);
    if (res.success) setDone(true);
    else alert(res.error);
    setLoading(false);
  }

  if (done) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h1 className="text-2xl font-bold">Ứng tuyển thành công!</h1>
      <p className="text-gray-500">Chúng tôi sẽ phản hồi qua email sau khi đánh giá.</p>
    </div>
  );

  return (
    <main className="max-w-2xl mx-auto py-16 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Gia nhập đội ngũ</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input name="candidate_email" type="email" placeholder="Email của bạn" required className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
          <input name="job_id" type="text" placeholder="Mã công việc (Job ID)" required className="w-full p-4 rounded-xl border border-gray-200" />
          <textarea name="jd_text" placeholder="Dán nội dung mô tả công việc (JD)..." rows={4} className="w-full p-4 rounded-xl border border-gray-200" />
          
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
            <input name="cv_file" type="file" accept=".pdf" required className="hidden" id="cv_input" />
            <label htmlFor="cv_input" className="cursor-pointer flex flex-col items-center">
              <Upload className="w-10 h-10 text-gray-400 mb-2" />
              <span className="text-gray-600">Nhấn để tải lên CV (PDF)</span>
            </label>
          </div>

          <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2">
            {loading ? "Đang gửi..." : <><Send className="w-5 h-5" /> Nộp hồ sơ</>}
          </button>
        </form>
      </div>
    </main>
  );
}