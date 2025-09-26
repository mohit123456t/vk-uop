import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../services/firebase';

// 🧩 Reusable Stat Card Component
const StatCard = ({ title, value, color }) => (
  <div className={`bg-white p-5 rounded-xl shadow-sm border border-slate-200 text-center hover:shadow-md transition-all`}>
    <p className={`font-semibold text-sm mb-1 ${color}`}>{title}</p>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

// 🖥️ Main Reels Uploaded Page — WHITE GOD MODE ACTIVATED
const ReelsUploadedPage = () => {
  // Filters and search states
  const [filters, setFilters] = useState({
    campaign: '',
    uploader: '',
    dateRange: '',
    status: '',
    search: '',
  });

  // Reel uploads data
  const [reelUploads, setReelUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Top summary stats
  const [summary, setSummary] = useState({
    today: 0,
    week: 0,
    month: 0,
    allTime: 0,
    successRate: 0,
  });

  // Alerts
  const [alerts, setAlerts] = useState([]);

  // 💡 Better Date Filtering Helper
  const isDateInRange = (dateString, daysAgo) => {
    if (!dateString) return false;
    const reelDate = new Date(dateString).setHours(0, 0, 0, 0);
    const compareDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0);
    return reelDate >= compareDate;
  };

  const fetchReelUploads = async () => {
    try {
      setLoading(true); // ⚠️ Start loading before API call

      const reelUploadsSnapshot = await getDocs(collection(db, 'reel_uploads'));
      const reelUploadsData = reelUploadsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReelUploads(reelUploadsData);

      // Calculate summary stats
      const todayUploads = reelUploadsData.filter((reel) =>
        isDateInRange(reel.uploadDate, 0)
      ).length;

      const weekUploads = reelUploadsData.filter((reel) =>
        isDateInRange(reel.uploadDate, 7)
      ).length;

      const monthUploads = reelUploadsData.filter((reel) =>
        isDateInRange(reel.uploadDate, 30)
      ).length;

      const successfulUploads = reelUploadsData.filter(
        (reel) => ['success', 'approved'].includes(reel.status)
      ).length;

      const successRate =
        reelUploadsData.length > 0
          ? Math.round((successfulUploads / reelUploadsData.length) * 100)
          : 0;

      setSummary({
        today: todayUploads,
        week: weekUploads,
        month: monthUploads,
        allTime: reelUploadsData.length,
        successRate,
      });

      // Generate alerts for failed uploads
      const failedUploads = reelUploadsData.filter((reel) =>
        ['failed', 'error'].includes(reel.status)
      );

      if (failedUploads.length > 0) {
        setAlerts([
          {
            type: 'error',
            message: `${failedUploads.length} reels failed to upload. Please check the upload logs.`,
          },
        ]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching reel uploads:', error);
      setAlerts([
        {
          type: 'error',
          message: 'Failed to load reel uploads. Please try again later.',
        },
      ]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReelUploads();
  }, []);

  // 🔍 Filtered Data (Client-side filtering for now)
  const filteredReels = reelUploads.filter((reel) => {
    const matchesSearch =
      !filters.search ||
      reel.id.toLowerCase().includes(filters.search.toLowerCase()) ||
      (reel.accountUsed &&
        reel.accountUsed.toLowerCase().includes(filters.search.toLowerCase()));

    const matchesCampaign =
      !filters.campaign ||
      (reel.campaignName &&
        reel.campaignName.toLowerCase().includes(filters.campaign.toLowerCase()));

    const matchesUploader =
      !filters.uploader ||
      (reel.uploaderName &&
        reel.uploaderName.toLowerCase().includes(filters.uploader.toLowerCase()));

    const matchesDate =
      !filters.dateRange ||
      (reel.uploadDate && reel.uploadDate.startsWith(filters.dateRange));

    const matchesStatus =
      !filters.status || reel.status === filters.status;

    return (
      matchesSearch &&
      matchesCampaign &&
      matchesUploader &&
      matchesDate &&
      matchesStatus
    );
  });

  return (
    <div className="space-y-8 p-4 md:p-8 bg-slate-50 min-h-screen">
      {/* 👑 Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Reels Uploaded Dashboard</h1>
        <p className="text-slate-600 mt-1">Track, filter, and analyze all uploaded reels performance.</p>
      </div>

      {/* 📊 Top Summary Cards */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Today" value={summary.today} color="text-blue-600" />
        <StatCard title="This Week" value={summary.week} color="text-green-600" />
        <StatCard title="This Month" value={summary.month} color="text-purple-600" />
        <StatCard title="All Time" value={summary.allTime} color="text-pink-600" />
        <StatCard title="Success Rate" value={`${summary.successRate}%`} color="text-yellow-600" />
      </section>

      {/* ⚠️ Alerts */}
      {alerts.length > 0 && (
        <section className="space-y-3">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${
                alert.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-2">{ICONS.alertTriangle}</span>
                {alert.message}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 🔍 Filters & Search */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search Reel ID / Account"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Filter by Campaign"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filters.campaign}
            onChange={(e) => setFilters((f) => ({ ...f, campaign: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Filter by Uploader"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filters.uploader}
            onChange={(e) => setFilters((f) => ({ ...f, uploader: e.target.value }))}
          />
          <input
            type="date"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filters.dateRange}
            onChange={(e) => setFilters((f) => ({ ...f, dateRange: e.target.value }))}
          />
          <select
            className="w-full p-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="processing">Processing</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="error">Error</option>
          </select>
        </div>
      </section>

      {/* 📋 Table View */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Reels Uploads ({filteredReels.length})</h2>
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
            <span className="mr-1">{ICONS.download}</span> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">Reel ID</th>
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">Campaign</th>
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">Uploader</th>
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">Date & Time</th>
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">Views</th>
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">Account</th>
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                      <p className="text-slate-500">Loading reels data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredReels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No reels match your filters.
                  </td>
                </tr>
              ) : (
                filteredReels.map((reel) => (
                  <tr key={reel.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono text-xs text-slate-800">{reel.id.slice(0, 8)}...</td>
                    <td className="p-3 text-slate-700">{reel.campaignName || '—'}</td>
                    <td className="p-3 text-slate-700">{reel.uploaderName || '—'}</td>
                    <td className="p-3 text-slate-700">
                      {reel.uploadDate
                        ? new Date(reel.uploadDate).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ['success', 'approved'].includes(reel.status)
                            ? 'bg-green-100 text-green-800'
                            : ['failed', 'error', 'rejected'].includes(reel.status)
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {reel.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{reel.views || 0}</td>
                    <td className="p-3 text-slate-700">{reel.accountUsed || '—'}</td>
                    <td className="p-3">
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 📈 Analytics Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Daily Upload Trend</h3>
          <div className="h-48 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>Graph implementation coming soon</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Top 5 Uploaders</h3>
          <div className="h-48 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🏆</div>
              <p>Leaderboard implementation coming soon</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Campaign Distribution</h3>
          <div className="h-48 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🥧</div>
              <p>Pie chart implementation coming soon</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReelsUploadedPage;