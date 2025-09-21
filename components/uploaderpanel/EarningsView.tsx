
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
    { id: 'P001', date: '2024-07-30', amount: '₹2,150.00', status: 'Paid' },
    { id: 'P002', date: '2024-06-30', amount: '₹1,980.00', status: 'Paid' },
    { id: 'P003', date: '2024-05-30', amount: '₹2,400.00', status: 'Paid' },
];

const EarningsView = () => (
    <div className="space-y-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Earnings & Payments</h1>
            <p className="text-slate-600">Track your payments and performance bonuses.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Earned" value="₹12,450" icon={ICONS.currencyRupee} />
            <StatCard title="This Month's Earnings" value="₹1,245" icon={ICONS.chart} />
            <StatCard title="Next Payout Date" value="Aug 30" icon={ICONS.wallet} />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
            <h3 className="font-bold text-lg p-6 text-slate-800">Payout History</h3>
            <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Payout ID</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Status</th>
                         <th className="px-6 py-3"></th>
                    </tr>
                </thead>
                <tbody>
                    {payoutHistory.map(payout => (
                        <tr key={payout.id} className="bg-white border-b">
                            <td className="px-6 py-4">{payout.date}</td>
                            <td className="px-6 py-4 font-medium">{payout.id}</td>
                            <td className="px-6 py-4 font-semibold">{payout.amount}</td>
                            <td className="px-6 py-4 text-green-600">{payout.status}</td>
                            <td className="px-6 py-4 text-right"><button className="font-medium text-slate-600 hover:underline">View Statement</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default EarningsView;
