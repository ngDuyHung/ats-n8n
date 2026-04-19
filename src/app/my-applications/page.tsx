import { connectDB } from '@/lib/db';
import { Application } from '@/models/Application';
import { Job } from '@/models/Job';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import { FileText, Calendar, CheckCircle, XCircle, Clock, Sparkles } from 'lucide-react';

export default async function MyApplicationsPage() {
  const session = await getSession();
  await connectDB();

  const applications = await Application.find({ candidate_email: session!.email })
    .sort({ created_at: -1 })
    .lean();

  const jobIds = [...new Set(applications.map((a: any) => a.job_id))];
  const jobs = await Job.find({ _id: { $in: jobIds } }).select('_id title department location').lean();
  const jobMap = Object.fromEntries(jobs.map((j: any) => [j._id.toString(), j]));

  const total = applications.length;
  const passed = applications.filter((a: any) => a.ket_qua_cuoi === 'PASSED').length;
  const failed = applications.filter((a: any) => a.ket_qua_cuoi === 'FAILED').length;
  const pending = applications.filter((a: any) => !a.ket_qua_cuoi).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hồ sơ của tôi</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Theo dõi trạng thái ứng tuyển · {session?.email}
            </p>
          </div>
          <Link
            href="/jobs"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Tìm việc mới
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Đã nộp', value: total, color: 'bg-slate-50 border-slate-200 text-slate-700' },
            { label: 'Đang xét', value: pending, color: 'bg-amber-50 border-amber-200 text-amber-700' },
            { label: 'Đạt yêu cầu', value: passed, color: 'bg-green-50 border-green-200 text-green-700' },
            { label: 'Không đạt', value: failed, color: 'bg-red-50 border-red-200 text-red-600' },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium mt-0.5 opacity-75">{s.label}</p>
            </div>
          ))}
        </div>

        {/* List */}
        {applications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-gray-600 font-medium">Chưa có hồ sơ nào</p>
            <p className="text-sm text-gray-400 mt-1 mb-5">Tìm và nộp hồ sơ cho vị trí phù hợp với bạn</p>
            <Link
              href="/jobs"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              Tìm việc làm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app: any) => {
              const isPassed = app.ket_qua_cuoi === 'PASSED';
              const isFailed = app.ket_qua_cuoi === 'FAILED';
              const isPending = !app.ket_qua_cuoi;
              const jobInfo = jobMap[app.job_id];
              const jobTitle = jobInfo?.title || `Job: ${app.job_id}`;
              const score = app.result?.score ?? null;

              return (
                <div
                  key={app._id.toString()}
                  className={`bg-white rounded-2xl border p-5 transition ${
                    isPassed
                      ? 'border-green-100 shadow-sm shadow-green-50'
                      : isFailed
                      ? 'border-red-100'
                      : 'border-gray-100 shadow-sm'
                  }`}
                >
                  {/* Top */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-900">{jobTitle}</h2>
                      {jobInfo && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {jobInfo.department} · {jobInfo.location}
                        </p>
                      )}
                    </div>
                    {isPassed && (
                      <span className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" /> Đạt yêu cầu
                      </span>
                    )}
                    {isFailed && (
                      <span className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0">
                        <XCircle className="w-3.5 h-3.5" /> Không đạt
                      </span>
                    )}
                    {isPending && (
                      <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0">
                        <Clock className="w-3.5 h-3.5" /> Đang xét
                      </span>
                    )}
                  </div>

                  {/* Score bar */}
                  {score !== null && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                          Điểm AI
                        </span>
                        <span
                          className={`font-bold ${
                            score >= 80
                              ? 'text-green-600'
                              : score >= 60
                              ? 'text-amber-600'
                              : 'text-red-500'
                          }`}
                        >
                          {score}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            score >= 80
                              ? 'bg-green-500'
                              : score >= 60
                              ? 'bg-amber-500'
                              : 'bg-red-400'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {app.result?.feedback && (
                    <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-xl px-3 py-2.5 mb-3 line-clamp-3">
                      {app.result.feedback}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Nộp ngày {new Date(app.created_at).toLocaleDateString('vi-VN')}
                    </span>
                    <Link
                      href={`/jobs/${app.job_id}`}
                      className="text-blue-500 hover:text-blue-600 font-medium hover:underline"
                    >
                      Xem tin →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
