import { connectDB } from '@/lib/db';
import { Job } from '@/models/Job';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Building2,
  SendHorizonal,
  Clock,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const session = await getSession();
  await connectDB();

  const job = await Job.findById(jobId).lean();
  if (!job || (job as any).status !== 'OPEN') notFound();

  const jobAny = job as any;
  const deadline = new Date(jobAny.deadline);
  const isOverdue = deadline < new Date();
  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const canApply = !session || session.role === 'client';

  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-emerald-500',
    'bg-orange-500', 'bg-rose-500', 'bg-cyan-500',
  ];
  const avatarColor = colors[(jobAny.department?.charCodeAt(0) ?? 0) % colors.length];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top banner */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition mb-5"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
          </Link>

          {/* Cover image */}
          {jobAny.cover_image && (
            <div className="w-full h-48 sm:h-56 rounded-2xl overflow-hidden mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={jobAny.cover_image}
                alt={jobAny.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-start gap-4">
            {/* Dept avatar */}
            <div className={`${avatarColor} w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}>
              <Briefcase className="w-7 h-7 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                {jobAny.title}
              </h1>
              <p className="text-gray-500 text-sm mt-1">{jobAny.department}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />{jobAny.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-gray-400" />{jobAny.quota} vị trí
                </span>
                {jobAny.salary_range && (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                    <DollarSign className="w-3.5 h-3.5" />{jobAny.salary_range}
                  </span>
                )}
                <span
                  className={`flex items-center gap-1.5 ${
                    isOverdue ? 'text-red-500' : daysLeft <= 7 ? 'text-orange-500' : ''
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {isOverdue
                    ? 'Đã hết hạn nhận hồ sơ'
                    : `Hạn nộp: ${deadline.toLocaleDateString('vi-VN')}${daysLeft <= 7 ? ` (còn ${daysLeft} ngày)` : ''}`}
                </span>
              </div>
            </div>

            {/* Desktop apply button */}
            {!isOverdue && canApply && (
              <Link
                href={session ? `/jobs/${jobId}/apply` : `/login?redirect=/jobs/${jobId}/apply`}
                className="hidden sm:flex items-center gap-2 shrink-0 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition text-sm shadow-sm"
              >
                <SendHorizonal className="w-4 h-4" /> Nộp hồ sơ
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main: JD */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="font-bold text-gray-900 mb-4 text-lg">Mô tả công việc</h2>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {jobAny.description}
              </pre>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
              {isOverdue ? (
                <div className="text-center py-3">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-5 h-5 text-red-400" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">Đã hết hạn nhận hồ sơ</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Hạn nộp: {deadline.toLocaleDateString('vi-VN')}
                  </p>
                </div>
              ) : canApply ? (
                <>
                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 font-medium">Đang nhận hồ sơ</span>
                    {daysLeft <= 7 && (
                      <span className="text-orange-500 ml-auto text-xs font-medium">Còn {daysLeft} ngày</span>
                    )}
                  </div>
                  <Link
                    href={session ? `/jobs/${jobId}/apply` : `/login?redirect=/jobs/${jobId}/apply`}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition text-sm shadow-sm"
                  >
                    <SendHorizonal className="w-4 h-4" /> Nộp hồ sơ ngay
                  </Link>
                  {!session && (
                    <p className="text-xs text-gray-400 text-center mt-3">
                      Cần{' '}
                      <Link href={`/login?redirect=/jobs/${jobId}/apply`} className="text-blue-500 hover:underline">
                        đăng nhập
                      </Link>{' '}
                      để nộp hồ sơ
                    </p>
                  )}
                </>
              ) : (
                <div className="text-center py-3">
                  <p className="text-gray-400 text-sm">
                    {session?.role === 'hr' ? 'HR không thể ứng tuyển' : 'Admin không thể ứng tuyển'}
                  </p>
                </div>
              )}
            </div>

            {/* Job info card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm">Thông tin vị trí</h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm">
                  <Building2 className="w-4 h-4 text-gray-300 shrink-0" />
                  <span className="text-gray-600">{jobAny.department}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <MapPin className="w-4 h-4 text-gray-300 shrink-0" />
                  <span className="text-gray-600">{jobAny.location}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Users className="w-4 h-4 text-gray-300 shrink-0" />
                  <span className="text-gray-600">{jobAny.quota} vị trí cần tuyển</span>
                </div>
                <div className={`flex items-center gap-2.5 text-sm ${isOverdue ? 'text-red-500' : ''}`}>
                  <Calendar className="w-4 h-4 text-gray-300 shrink-0" />
                  <span>Hạn nộp: {deadline.toLocaleDateString('vi-VN')}</span>
                </div>
                {jobAny.salary_range && (
                  <div className="flex items-center gap-2.5 text-sm text-emerald-600 font-medium">
                    <DollarSign className="w-4 h-4 shrink-0" />
                    <span>{jobAny.salary_range}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fixed apply button */}
      {!isOverdue && canApply && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-lg">
          <Link
            href={session ? `/jobs/${jobId}/apply` : `/login?redirect=/jobs/${jobId}/apply`}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            <SendHorizonal className="w-4 h-4" /> Nộp hồ sơ ngay
          </Link>
        </div>
      )}
    </div>
  );
}
