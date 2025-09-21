import React from 'react';
import { ICONS } from '../../constants';

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
            </div>
            <div className="text-slate-400">{icon}</div>
        </div>
    </div>
);

const payoutHistory = [
    { id: 'P001-VE', date: '2024-07-30', amount: '₹4,200.00', status: 'Paid', reels: 8 },
    { id: 'P002-VE', date: '2024-06-30', amount: '₹3,675.00', status: 'Paid', reels: 7 },
];

const EarningsView = () => (
    <div className="space-y-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
            <p className="text-slate-600">Track your payments for video editing.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Earned" value="₹15,800" icon={ICONS.currencyRupee} />
            <StatCard title="This Month (Pending)" value="₹1,575" icon={ICONS.chart} />
            <StatCard title="Avg. Per Reel" value="₹525" icon={ICONS.scissors} />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
            <h3 className="font-bold text-lg p-6 text-slate-800">Payout History</h3>
            <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Reels Edited</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {payoutHistory.map(payout => (
                        <tr key={payout.id} className="bg-white border-b">
                            <td className="px-6 py-4">{payout.date}</td>
                            <td className="px-6 py-4">{payout.reels}</td>
                            <td className="px-6 py-4 font-semibold">{payout.amount}</td>
                            <td className="px-6 py-4 text-green-600">{payout.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default EarningsView;
