import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';



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

  useEffect(() => {
    fetchReelUploads();
  }, []);

  const fetchReelUploads = async () => {
    try {
      const reelUploadsSnapshot = await getDocs(collection(db, 'reel_uploads'));
      const reelUploadsData = reelUploadsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setReelUploads(reelUploadsData);

      // Calculate summary stats
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const todayUploads = reelUploadsData.filter((reel: any) => reel.uploadDate?.startsWith(today)).length;
      const weekUploads = reelUploadsData.filter((reel: any) => reel.uploadDate?.startsWith(weekAgo)).length;
      const monthUploads = reelUploadsData.filter((reel: any) => reel.uploadDate?.startsWith(monthAgo)).length;

      const successfulUploads = reelUploadsData.filter((reel: any) => reel.status === 'success' || reel.status === 'approved').length;
      const successRate = reelUploadsData.length > 0 ? Math.round((successfulUploads / reelUploadsData.length) * 100) : 0;

      setSummary({
        today: todayUploads,
        week: weekUploads,
        month: monthUploads,
        allTime: reelUploadsData.length,
        successRate
      });

      // Generate alerts for failed uploads
      const failedUploads = reelUploadsData.filter((reel: any) => reel.status === 'failed' || reel.status === 'error');
      if (failedUploads.length > 0) {
        setAlerts([{
          type: 'error',
          message: `${failedUploads.length} reels failed to upload. Please check the upload logs.`
        }]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching reel uploads:', error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Top Summary */}
      <section className="bg-white rounded-2xl shadow-xl p-6 mb-4">
        <h1 className="text-2xl font-bold mb-4">Reels Uploaded Summary</h1>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="font-semibold text-blue-600">Today</p>
            <p className="text-2xl font-bold">{summary.today}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="font-semibold text-green-600">This Week</p>
            <p className="text-2xl font-bold">{summary.week}</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <p className="font-semibold text-purple-600">This Month</p>
            <p className="text-2xl font-bold">{summary.month}</p>
          </div>
          <div className="bg-pink-50 rounded-xl p-4 text-center">
            <p className="font-semibold text-pink-600">All Time</p>
            <p className="text-2xl font-bold">{summary.allTime}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center">
            <p className="font-semibold text-yellow-600">Success Rate</p>
            <p className="text-2xl font-bold">{summary.successRate}%</p>
          </div>
        </div>
      </section>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="mb-4">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`p-3 rounded mb-2 ${alert.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {alert.message}
            </div>
          ))}
        </section>
      )}

      {/* Filters & Search */}
      <section className="bg-white rounded-2xl shadow p-4 mb-4 flex flex-wrap gap-4 items-center">
        <input type="text" placeholder="Search Reel ID / Account" className="border rounded px-3 py-2" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
        <input type="text" placeholder="Filter by Campaign" className="border rounded px-3 py-2" value={filters.campaign} onChange={e => setFilters(f => ({ ...f, campaign: e.target.value }))} />
        <input type="text" placeholder="Filter by Uploader" className="border rounded px-3 py-2" value={filters.uploader} onChange={e => setFilters(f => ({ ...f, uploader: e.target.value }))} />
        <input type="date" className="border rounded px-3 py-2" value={filters.dateRange} onChange={e => setFilters(f => ({ ...f, dateRange: e.target.value }))} />
        <select className="border rounded px-3 py-2" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Status</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="processing">Processing</option>
        </select>
      </section>

      {/* Table View */}
      <section className="bg-white rounded-2xl shadow-xl p-6 mb-4">
        <h2 className="text-xl font-bold mb-4">Detailed Reels Table</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2">Reel ID</th>
                <th className="p-2">Campaign Name</th>
                <th className="p-2">Uploader</th>
                <th className="p-2">Date & Time</th>
                <th className="p-2">Status</th>
                <th className="p-2">Views (Live)</th>
                <th className="p-2">Account Used</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                    </div>
                  </td>
                </tr>
              ) : reelUploads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">No reels uploaded yet.</td>
                </tr>
              ) : (
                reelUploads.map((reel: any) => (
                  <tr key={reel.id} className="border-b hover:bg-slate-50">
                    <td className="p-2 font-mono text-xs">{reel.id.slice(0, 8)}...</td>
                    <td className="p-2">{reel.campaignName || 'N/A'}</td>
                    <td className="p-2">{reel.uploaderName || 'N/A'}</td>
                    <td className="p-2">{reel.uploadDate ? new Date(reel.uploadDate).toLocaleString() : 'N/A'}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reel.status === 'success' || reel.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : reel.status === 'failed' || reel.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reel.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-2">{reel.views || 0}</td>
                    <td className="p-2">{reel.accountUsed || 'N/A'}</td>
                    <td className="p-2">
                      <button className="text-blue-600 hover:underline text-xs">View Details</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="font-bold mb-4">Reels Uploaded per Day (Trend)</h3>
          {/* Graph placeholder */}
          <div className="h-48 flex items-center justify-center text-slate-400">Graph here</div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="font-bold mb-4">Top 5 Uploaders of the Day</h3>
          {/* Leaderboard placeholder */}
          <div className="h-48 flex items-center justify-center text-slate-400">Leaderboard here</div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="font-bold mb-4">Reels Distribution (by Campaign)</h3>
          {/* Pie chart placeholder */}
          <div className="h-48 flex items-center justify-center text-slate-400">Pie chart here</div>
        </div>
      </section>
    </div>
  );
};

export default ReelsUploadedPage;
