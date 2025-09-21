
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ICONS } from '../../constants';

const performanceData = [
  { name: 'Week 1', views: 40000, likes: 2400 },
  { name: 'Week 2', views: 32000, likes: 1398 },
  { name: 'Week 3', views: 51000, likes: 3800 },
  { name: 'Week 4', views: 45000, likes: 2900 },
];

const AnalyticsView = () => (
    <div className="space-y-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Performance Analytics</h1>
            <p className="text-slate-600">Track the impact of your uploads.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
            <h3 className="font-bold text-lg mb-4 text-slate-800">Weekly Performance</h3>
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#0f172a" />
                        <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="views" fill="#0f172a" />
                        <Bar yAxisId="right" dataKey="likes" fill="#64748b" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
            <h3 className="font-bold text-lg mb-4 text-slate-800">Best Performing Reel This Month</h3>
            <div className="flex items-center space-x-6">
                <img src="https://placehold.co/1080x1920/e2e8f0/334155?text=Viral+Reel" alt="Viral Reel" className="w-24 aspect-[9/16] rounded-md border" />
                <div>
                    <p className="font-semibold text-slate-800">Reel ID: R088</p>
                    <p className="text-sm text-slate-500">Campaign: Summer Glow</p>
                    <div className="flex space-x-4 mt-2 text-sm">
                        <p><strong>Views:</strong> 1.2M</p>
                        <p><strong>Likes:</strong> 89k</p>
                        <p><strong>Comments:</strong> 4.2k</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default AnalyticsView;
