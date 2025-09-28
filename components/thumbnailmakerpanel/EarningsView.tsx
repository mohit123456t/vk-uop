import React, { useState } from 'react';
import { ICONS } from '../../constants';

const EarningsView = () => {
    const [loading, setLoading] = useState(false);

    // All data is now static and set to zero or empty arrays.
    const stats = {
        totalEarnings: 0,
        withdrawn: 0,
        pendingClearance: 0,
    };

    const recentTransactions = [];
    const paymentMethods = [];

    const handleWithdraw = () => {
        // This function will now just show an alert or do nothing.
        alert("Withdrawal functionality is currently disabled.");
    };

    const StatCard = ({ icon, label, amount, colorClass }) => (
        <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200/80`}>
            <div className="flex items-center">
                <div className={`mr-4 text-2xl ${colorClass}`}>{icon}</div>
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className={`text-2xl font-bold ${colorClass}`}>₹{amount.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Earnings & Payouts</h1>
                <p className="text-slate-600">Track your earnings and manage your withdrawal methods.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={ICONS.currencyRupee} label="Total Earnings" amount={stats.totalEarnings} colorClass="text-green-600" />
                <StatCard icon={ICONS.checkCircle} label="Total Withdrawn" amount={stats.withdrawn} colorClass="text-blue-600" />
                <StatCard icon={ICONS.clock} label="Pending Clearance" amount={stats.pendingClearance} colorClass="text-orange-500" />
            </div>

            {/* Withdrawal Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Withdraw Funds</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-600">Amount to Withdraw</label>
                            <div className="relative mt-1">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">₹</span>
                                <input type="number" className="w-full pl-7 p-2 border border-slate-300 rounded-lg" placeholder="0.00" disabled />
                            </div>
                        </div>
                        <button onClick={handleWithdraw} disabled className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50">
                           Withdraw (Disabled)
                        </button>
                        <p className="text-xs text-center text-slate-500">Withdrawals are processed within 3-5 business days.</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Payout Methods</h3>
                    <div className="text-center py-8">
                         <p className="text-slate-500">No payout methods have been set up.</p>
                         <button className="mt-4 text-sm font-semibold text-blue-600 hover:underline" disabled>Add Method (Disabled)</button>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                 <h3 className="font-bold text-lg mb-4 text-slate-800">Recent Transactions</h3>
                 <div className="text-center py-8">
                     <p className="text-slate-500">You have no recent transactions.</p>
                 </div>
            </div>
        </div>
    );
};

export default EarningsView;
