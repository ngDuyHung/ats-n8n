import { connectDB } from '@/lib/db';
import { Job } from '@/models/Job';
import { getSession } from '@/lib/session';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { ApplyForm } from '@/components/jobs/ApplyForm';

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const session = await getSession();

  if (!session) redirect(`/login?redirect=/jobs/${jobId}/apply`);
  if (session.role !== 'client') redirect(`/jobs/${jobId}`);

  await connectDB();

  const job = await Job.findById(jobId).lean();
  if (!job || (job as any).status !== 'OPEN') notFound();

  const jobAny = job as any;
  const deadline = new Date(jobAny.deadline);
  const isOverdue = deadline < new Date();

  if (isOverdue) redirect(`/jobs/${jobId}`);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <Link href={`/jobs/${jobId}`} className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm transition">
          <ArrowLeft className="w-4 h-4" /> Quay lại chi tiết
        </Link>

        {/* Job summary */}
        <div className="bg-blue-600 text-white rounded-2xl p-5">
          <p className="text-blue-200 text-xs font-medium uppercase tracking-wide mb-1">Ứng tuyển vị trí</p>
          <h1 className="text-xl font-bold mb-3">{jobAny.title}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-blue-100">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{jobAny.location}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />Hạn: {deadline.toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          <h2 className="font-semibold text-gray-900 mb-5">Thông tin ứng tuyển</h2>
          <ApplyForm
            jobId={jobId}
            jobTitle={jobAny.title}
            jdText={jobAny.description}
            candidateEmail={session.email}
            candidateName={session.name}
          />
        </div>
      </div>
    </div>
  );
}
