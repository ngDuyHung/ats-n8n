import { connectDB } from "@/lib/db";
import { Application } from "@/models/Application";
import { User } from "@/models/User";
import { HrRequest } from "@/models/HrRequest";
import { Job } from "@/models/Job";
import { getSession } from "@/lib/session";
import Link from "next/link";
import {
  Users,
  Briefcase,
  ClipboardList,
  Clock,
  TrendingUp,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default async function AdminDashboard() {
  const session = await getSession();
  await connectDB();

  const [totalUsers, totalHr, totalJobs, totalApps, pendingRequests, recentApps] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "hr" }),
      Job.countDocuments(),
      Application.countDocuments(),
      HrRequest.countDocuments({ status: "PENDING" }),
      Application.find().sort({ created_at: -1 }).limit(8).lean(),
    ]);

  const passedApps = await Application.countDocuments({ ket_qua_cuoi: "PASSED" });
  const passRate = totalApps > 0 ? Math.round((passedApps / totalApps) * 100) : 0;

  const stats = [
    {
      label: "Tổng người dùng",
      value: totalUsers,
      icon: Users,
      bg: "bg-blue-500",
      light: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Nhà tuyển dụng",
      value: totalHr,
      icon: UserCheck,
      bg: "bg-violet-500",
      light: "bg-violet-50",
      text: "text-violet-600",
    },
    {
      label: "Tin tuyển dụng",
      value: totalJobs,
      icon: Briefcase,
      bg: "bg-emerald-500",
      light: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      label: "Tổng ứng viên",
      value: totalApps,
      icon: ClipboardList,
      bg: "bg-orange-500",
      light: "bg-orange-50",
      text: "text-orange-600",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Tổng quan hệ thống
        </p>
        <h1 className="text-2xl font-bold text-slate-900">
          Xin chào, {session?.name} 👋
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 ${s.light} rounded-xl flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.text}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Second row: pass rate + pending requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pass rate card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Tỷ lệ pass AI</h2>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-4xl font-bold text-slate-900 mb-1">{passRate}%</p>
          <p className="text-xs text-slate-400 mb-4">{passedApps}/{totalApps} ứng viên đạt yêu cầu</p>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${passRate}%` }}
            />
          </div>
        </div>

        {/* Pending HR requests */}
        <Link
          href="/admin/hr-requests"
          className={`rounded-2xl border shadow-sm p-5 flex flex-col justify-between transition hover:shadow-md ${
            pendingRequests > 0
              ? "bg-amber-50 border-amber-200"
              : "bg-white border-gray-100"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">HR Requests chờ duyệt</h2>
            <Clock className={`w-4 h-4 ${pendingRequests > 0 ? "text-amber-500" : "text-gray-400"}`} />
          </div>
          <div>
            <p className={`text-4xl font-bold mb-1 ${pendingRequests > 0 ? "text-amber-600" : "text-slate-900"}`}>
              {pendingRequests}
            </p>
            <p className="text-xs text-slate-400">
              {pendingRequests > 0 ? "đơn đang chờ xem xét" : "Không có đơn chờ duyệt"}
            </p>
          </div>
          {pendingRequests > 0 && (
            <span className="mt-4 text-xs font-semibold text-amber-700 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Xem & duyệt ngay →
            </span>
          )}
        </Link>
      </div>

      {/* Recent applications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 text-sm">Ứng viên gần đây</h2>
          <Link
            href="/admin/applications"
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Xem tất cả →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentApps.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircle className="w-8 h-8 mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">Chưa có ứng viên nào</p>
            </div>
          ) : (
            recentApps.map((app: any) => {
              const score = app.result?.score ?? null;
              const isPassed = app.ket_qua_cuoi === "PASSED";
              const isFailed = app.ket_qua_cuoi === "FAILED";
              return (
                <div
                  key={app._id.toString()}
                  className="px-6 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                    {(app.candidate_name || app.candidate_email || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {app.candidate_name || app.candidate_email}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      Job ID: {app.job_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {score !== null && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                          score >= 80
                            ? "bg-green-100 text-green-700"
                            : score >= 60
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {score}đ
                      </span>
                    )}
                    {isPassed && (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> PASSED
                      </span>
                    )}
                    {isFailed && (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" /> FAILED
                      </span>
                    )}
                    {!app.ket_qua_cuoi && (
                      <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Chờ duyệt
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
