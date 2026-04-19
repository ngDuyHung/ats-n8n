'use client';

import { toggleJobStatus } from '@/actions/job-actions';
import { useState } from 'react';
import { Power } from 'lucide-react';

export function ToggleJobButton({ jobId, currentStatus }: { jobId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    await toggleJobStatus(jobId);
    setLoading(false);
  }

  const isOpen = currentStatus === 'OPEN';
  return (
    <button
      onClick={handle}
      disabled={loading}
      className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition disabled:opacity-50 ${
        isOpen
          ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
          : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
      }`}
    >
      <Power className="w-4 h-4" />
      {loading ? '...' : isOpen ? 'Đóng tin' : 'Mở lại'}
    </button>
  );
}
