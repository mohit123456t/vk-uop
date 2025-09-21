import React from 'react';
import { ICONS } from '../../constants';

const payments = [
    { id: "P004", date: "2024-07-30", amount: "₹4,250.00", status: "Paid" },
    { id: "P003", date: "2024-06-30", amount: "₹3,800.00", status: "Paid" },
];

const PaymentsView = () => (
    <div className="space-y-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Earnings & Performance</h1>
            <p className="text-slate-600">Track your payments, bonuses, and performance metrics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <p className="text-sm font-medium text-slate-500">Earnings This Month</p>
                <p className="text-3xl font-bold text-slate-800">₹1,250.00</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <p className="text-sm font-medium text-slate-500">Performance Bonus</p>
                <p className="text-3xl font-bold text-slate-800">₹500.00</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <p className="text-sm font-medium text-slate-500">Total Earned</p>
                <p className="text-3xl font-bold text-slate-800">₹8,450.00</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80">
                <h3 className="font-bold text-lg p-6 border-b text-slate-800">Payment History</h3>
                <table className="w-full text-sm text-left text-slate-600">
                     <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(p => (
                             <tr key={p.id} className="border-b">
                                <td className="px-6 py-4">{p.date}</td>
                                <td className="px-6 py-4 font-semibold">{p.amount}</td>
                                <td className="px-6 py-4 text-green-600">{p.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Performance Report</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Avg. Approval Rate</span>
                        <span className="text-sm font-bold text-green-600">92%</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Viral Scripts (1M+ Views)</span>
                        <span className="text-sm font-bold">3</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Avg. Time to Approval</span>
                        <span className="text-sm font-bold">1.5 Days</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default PaymentsView;
