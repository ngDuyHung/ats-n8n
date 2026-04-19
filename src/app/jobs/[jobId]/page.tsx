import { connectDB } from '@/lib/db';
import { Job } from '@/models/Job';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Users, DollarSign, Building, SendHorizonal } from 'lucide-react';

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

  const canApply = !session || session.role === 'client';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Back */}
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm transition">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main: JD */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{jobAny.title}</h1>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100">
                <span className="flex items-center gap-1.5"><Building className="w-4 h-4 text-gray-400" />{jobAny.department}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" />{jobAny.location}</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-gray-400" />{jobAny.quota} vị trí</span>
                {jobAny.salary_range && (
                  <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                    <DollarSign className="w-4 h-4" />{jobAny.salary_range}
                  </span>
                )}
                <span className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-500' : ''}`}>
                  <Calendar className="w-4 h-4" />
                  Hạn nộp: {deadline.toLocaleDateString('vi-VN')}
                  {isOverdue && ' (Đã hết hạn)'}
                </span>
              </div>
              <h2 className="font-semibold text-gray-900 mb-3">Mô tả công việc</h2>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{jobAny.description}</pre>
            </div>
          </div>

          {/* Sidebar: Apply CTA */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
              <h2 className="font-semibold text-gray-900 mb-1">{jobAny.title}</h2>
              <p className="text-sm text-gray-500 mb-5">{jobAny.location}</p>

              {isOverdue ? (
                <div className="text-center py-4">
                  <span className="text-red-500 text-sm font-medium">Đã hết hạn nhận hồ sơ</span>
                </div>
              ) : canApply ? (
                <Link
                  href={session ? `/jobs/${jobId}/apply` : `/login?redirect=/jobs/${jobId}/apply`}
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  <SendHorizonal className="w-4 h-4" /> Nộp hồ sơ ngay
                </Link>
              ) : (
                <div className="text-center py-4">
                  <span className="text-gray-400 text-sm">
                    {session?.role === 'hr' ? 'HR không thể ứng tuyển' : 'Admin không thể ứng tuyển'}
                  </span>
                </div>
              )}

              {!session && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  Cần{' '}
                  <Link href={`/login?redirect=/jobs/${jobId}/apply`} className="text-blue-500 hover:underline">
                    đăng nhập
                  </Link>{' '}
                  để nộp hồ sơ
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
