import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatNumber } from '../../utils/format'; // Import the magic formatter
import { ICONS } from '../../constants';

// 🧩 StatCard Component for Finance
const FinanceStatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-700">{title}</h2>
            <div className={`text-2xl p-2 rounded-lg ${color}`}>{icon}</div>
        </div>
        <p className="text-3xl font-bold text-slate-900 mt-2">₹{value}</p>
    </div>
);

// 🖥️ Main Finance Dashboard
const SuperAdminFinance = ({ data }) => {
    const financeData = data || {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
    };

    // Dummy data for the chart, replace with real data later
    const monthlyData = [
        { month: 'Jan', revenue: 240000, expenses: 150000 },
        { month: 'Feb', revenue: 310000, expenses: 180000 },
        { month: 'Mar', revenue: 450000, expenses: 250000 },
        { month: 'Apr', revenue: 420000, expenses: 280000 },
        { month: 'May', revenue: 580000, expenses: 350000 },
        { month: 'Jun', revenue: financeData.totalRevenue, expenses: financeData.totalExpenses }, // Current month
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Financial Overview</h1>
                <p className="text-slate-600">Real-time tracking of revenue, expenses, and profit.</p>
            </div>

            {/* 📊 Core Finance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FinanceStatCard 
                    title="Total Revenue"
                    value={formatNumber(financeData.totalRevenue)} 
                    icon={ICONS.currencyRupee}
                    color="bg-green-100 text-green-600"
                />
                <FinanceStatCard 
                    title="Total Expenses"
                    value={formatNumber(financeData.totalExpenses)} 
                    icon={ICONS.chartBar} // Changed icon
                    color="bg-red-100 text-red-600"
                />
                <FinanceStatCard 
                    title="Net Profit"
                    value={formatNumber(Number(financeData.netProfit))} 
                    icon={ICONS.trendingUp} // Changed icon
                    color={`bg-blue-100 ${financeData.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}
                />
            </div>

            {/* 📈 Monthly Performance Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-slate-900">Monthly Performance</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" tickFormatter={(value) => `₹${formatNumber(value)}`} />
                        <Tooltip formatter={(value) => `₹${formatNumber(value)}`} />
                        <Line type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={2} name="Revenue" />
                        <Line type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={2} name="Expenses" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
            {/* You can add back the pending transactions tables here if needed */}

        </div>
    );
};

export default SuperAdminFinance;
