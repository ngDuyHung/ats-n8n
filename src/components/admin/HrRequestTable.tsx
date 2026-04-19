'use client';

import { approveHrRequest, rejectHrRequest } from '@/actions/hr-request-actions';
import { CheckCircle, XCircle, Clock, Globe, User } from 'lucide-react';
import { useState } from 'react';

type HrRequestRow = {
  _id: string;
  user_name: string;
  user_email: string;
  company_name: string;
  company_website?: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

export function HrRequestTable({ requests }: { requests: HrRequestRow[] }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [list, setList] = useState(requests);

  async function handleApprove(id: string) {
    setLoading(id + '_approve');
    await approveHrRequest(id);
    setList((prev) =>
      prev.map((r) => (r._id === id ? { ...r, status: 'APPROVED' as const } : r))
    );
    setLoading(null);
  }

  async function handleReject(id: string) {
    setLoading(id + '_reject');
    await rejectHrRequest(id);
    setList((prev) =>
      prev.map((r) => (r._id === id ? { ...r, status: 'REJECTED' as const } : r))
    );
    setLoading(null);
  }

  if (list.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p>Không có đơn nào</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
          <tr>
            <th className="p-4">Người dùng</th>
            <th className="p-4">Công ty</th>
            <th className="p-4">Lý do</th>
            <th className="p-4">Ngày gửi</th>
            <th className="p-4">Trạng thái</th>
            <th className="p-4">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {list.map((req) => (
            <tr key={req._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{req.user_name}</p>
                    <p className="text-xs text-gray-400">{req.user_email}</p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <p className="text-sm font-medium text-gray-900">{req.company_name}</p>
                {req.company_website && (
                  <a
                    href={req.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <Globe className="w-3 h-3" /> Website
                  </a>
                )}
              </td>
              <td className="p-4 max-w-xs">
                <p className="text-sm text-gray-600 line-clamp-2">{req.reason}</p>
              </td>
              <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                {new Date(req.created_at).toLocaleDateString('vi-VN')}
              </td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[req.status]}`}>
                  {STATUS_LABEL[req.status]}
                </span>
              </td>
              <td className="p-4">
                {req.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      disabled={loading === req._id + '_approve'}
                      onClick={() => handleApprove(req._id)}
                      className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {loading === req._id + '_approve' ? '...' : 'Duyệt'}
                    </button>
                    <button
                      disabled={loading === req._id + '_reject'}
                      onClick={() => handleReject(req._id)}
                      className="flex items-center gap-1 text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {loading === req._id + '_reject' ? '...' : 'Từ chối'}
                    </button>
                  </div>
                )}
                {req.status !== 'PENDING' && (
                  <span className="text-xs text-gray-400">Đã xử lý</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
