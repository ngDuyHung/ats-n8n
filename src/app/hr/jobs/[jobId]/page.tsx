import { connectDB } from '@/lib/db';
import { Job } from '@/models/Job';
import { Application } from '@/models/Application';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil, MapPin, Calendar, Users, DollarSign, Building } from 'lucide-react';
import { ToggleJobButton } from '@/components/hr/ToggleJobButton';
import { FinalizeButton } from '@/components/hr/FinalizeButton';

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const session = await getSession();
  await connectDB();

  const [job, applications] = await Promise.all([
    Job.findById(jobId).lean(),
    Application.find({ job_id: jobId }).sort({ 'result.score': -1 }).lean(),
  ]);

  if (!job) notFound();

  const jobAny = job as any;
  const isOwner =
    session?.role === 'admin' ||
    jobAny.created_by.toString() === session?.userId;

  const deadline = new Date(jobAny.deadline);
  const isOpen = jobAny.status === 'OPEN';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/hr/jobs" className="mt-1 text-gray-400 hover:text-gray-700 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{jobAny.title}</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
            >
              {jobAny.status}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">ID: {jobId}</p>
        </div>
        {isOwner && (
          <div className="flex items-center gap-2">
            <ToggleJobButton jobId={jobId} currentStatus={jobAny.status} />
            <Link
              href={`/hr/jobs/${jobId}/edit`}
              className="flex items-center gap-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              <Pencil className="w-4 h-4" /> Chỉnh sửa
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin job */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-gray-900 mb-4">Thông tin vị trí</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="w-4 h-4 text-gray-400" />
              <span>{jobAny.department}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{jobAny.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-gray-400" />
              <span>{jobAny.quota} vị trí cần tuyển</span>
            </div>
            <div className={`flex items-center gap-2 text-sm ${deadline < new Date() ? 'text-red-500' : 'text-gray-600'}`}>
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>Hạn nộp: {deadline.toLocaleDateString('vi-VN')}</span>
            </div>
            {jobAny.salary_range && (
              <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                <DollarSign className="w-4 h-4" />
                <span>{jobAny.salary_range}</span>
              </div>
            )}
          </div>

          {/* Chốt sổ */}
          {isOwner && applications.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">Chốt kết quả tuyển dụng</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Hệ thống sẽ chọn <strong>{jobAny.quota}</strong> ứng viên có điểm AI cao nhất làm{' '}
                <span className="text-green-600 font-medium">PASSED</span>, còn lại là{' '}
                <span className="text-red-600 font-medium">FAILED</span>. Email sẽ được gửi tự động.
              </p>
              <FinalizeButton
                jobId={jobId}
                jobTitle={jobAny.title}
                quota={jobAny.quota}
              />
            </div>
          )}
        </div>

        {/* Bên phải: JD + bảng ứng viên */}
        <div className="lg:col-span-2 space-y-4">
          {/* Mô tả công việc */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Mô tả công việc</h2>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{jobAny.description}</pre>
          </div>

          {/* Danh sách ứng viên */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Ứng viên{' '}
                <span className="text-gray-400 font-normal">({applications.length})</span>
              </h2>
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-4">Email</th>
                  <th className="p-4">Điểm AI</th>
                  <th className="p-4">Kết quả</th>
                  <th className="p-4">Nộp lúc</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app: any) => (
                  <tr key={app._id.toString()} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="p-4 text-sm">{app.candidate_email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          (app.result?.score ?? 0) >= 80
                            ? 'bg-green-100 text-green-700'
                            : (app.result?.score ?? 0) >= 60
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {app.result?.score ?? 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          app.ket_qua_cuoi === 'PASSED'
                            ? 'bg-green-500 text-white'
                            : app.ket_qua_cuoi === 'FAILED'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {app.ket_qua_cuoi || 'CHỜ DUYỆT'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(app.created_at).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400 text-sm">
                      Chưa có ứng viên nào nộp hồ sơ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
