
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ICONS } from '../../constants';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

const AnalyticsView = () => {
    const [reportType, setReportType] = useState('Campaign ROI');
    const [campaignData, setCampaignData] = useState([]);
    const [productivityData, setProductivityData] = useState([]);
    useEffect(() => {
        const fetchAnalytics = async () => {
            const campaignSnap = await getDocs(collection(db, 'admin/analytics/campaigns'));
            const prodSnap = await getDocs(collection(db, 'admin/analytics/productivity'));
            const campaigns = [];
            campaignSnap.forEach(doc => campaigns.push(doc.data()));
            setCampaignData(campaigns);
            const productivity = [];
            prodSnap.forEach(doc => productivity.push(doc.data()));
            setProductivityData(productivity);
        };
        fetchAnalytics();
    }, []);

    const renderReport = () => {
        if (reportType === 'Team Productivity') {
            return (
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={productivityData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={100} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#0f172a" name="Tasks Completed" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )
        }
        // Default to Campaign ROI
        return (
             <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campaignData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#ef4444" />
                        <YAxis yAxisId="right" orientation="right" stroke="#22c55e" />
                        <Tooltip />
                        <Bar yAxisId="left" dataKey="spend" fill="#ef4444" name="Spend (₹)" />
                        <Bar yAxisId="right" dataKey="views" fill="#22c55e" name="Views Generated" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
                    <p className="text-slate-600">Generate reports on agency performance.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="text-sm font-medium p-2 rounded-lg bg-slate-200 hover:bg-slate-300">Export PDF</button>
                    <button className="text-sm font-medium p-2 rounded-lg bg-slate-200 hover:bg-slate-300">Export CSV</button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <div className="flex items-center mb-4">
                    <label htmlFor="report-type" className="text-sm font-medium mr-2">Select Report:</label>
                    <select id="report-type" value={reportType} onChange={e => setReportType(e.target.value)} className="p-2 border rounded-md text-sm">
                        <option>Campaign ROI</option>
                        <option>Team Productivity</option>
                        <option>Brand Profitability</option>
                    </select>
                </div>
                {renderReport()}
            </div>
        </div>
    );
}

export default AnalyticsView;
