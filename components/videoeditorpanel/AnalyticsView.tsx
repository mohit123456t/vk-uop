import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ICONS } from '../../constants';

const performanceData = [
  { name: 'Reel 1', views: 120000, engagement: 8.2 },
  { name: 'Reel 2', views: 85000, engagement: 6.5 },
  { name: 'Reel 3', views: 250000, engagement: 9.1 },
  { name: 'Reel 4', views: 95000, engagement: 7.1 },
  { name: 'Reel 5', views: 150000, engagement: 8.5 },
];

const AnalyticsView = () => (
    <div className="space-y-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Performance Analytics</h1>
            <p className="text-slate-600">See how your edited reels are performing.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
            <h3 className="font-bold text-lg mb-4 text-slate-800">Edited Reels Performance</h3>
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" label={{ value: 'Views', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Engagement (%)', angle: -90, position: 'insideRight' }} />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="views" stroke="#0f172a" strokeWidth={2} name="Total Views" />
                        <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#64748b" strokeWidth={2} name="Engagement Rate" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
            <h3 className="font-bold text-lg mb-4 text-slate-800">🏆 Top Performing Reel</h3>
             <div className="flex items-center space-x-6">
                <div className="w-24 aspect-[9/16] rounded-md border bg-slate-200 flex items-center justify-center">
                    <p className="text-xs text-slate-500">Reel V011</p>
                </div>
                <div>
                    <p className="font-semibold text-slate-800">Reel ID: V011</p>
                    <p className="text-sm text-slate-500">Campaign: Old Campaign</p>
                    <div className="flex space-x-4 mt-2 text-sm">
                        <p><strong>Views:</strong> 250k</p>
                        <p><strong>Engagement:</strong> 9.1%</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default AnalyticsView;
