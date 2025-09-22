import React from 'react';

const EarningsView = () => {
    // Dummy data for earnings
    const earningsData = {
        totalEarnings: 7500,
        pendingClearance: 1200,
        lastPayout: {
            amount: 2500,
            date: '2024-07-15',
        },
        transactions: [
            { id: 1, date: '2024-07-20', description: 'Thumbnail for Campaign X', amount: 500, status: 'Completed' },
            { id: 2, date: '2024-07-18', description: 'Task Y', amount: 300, status: 'Completed' },
            { id: 3, date: '2024-07-15', description: 'Payout', amount: -2500, status: 'Cleared' },
            { id: 4, date: '2024-07-12', description: 'Campaign Z graphics', amount: 700, status: 'Completed' },
        ],
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center"><span className="mr-2 animate-bounce">💰</span>Your Earnings</h2>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <h3 className="text-lg font-semibold text-slate-800">Total Earnings</h3>
                    <p className="text-3xl font-bold text-green-600">₹{earningsData.totalEarnings.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <h3 className="text-lg font-semibold text-slate-800">Pending Clearance</h3>
                    <p className="text-3xl font-bold text-amber-600">₹{earningsData.pendingClearance.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <h3 className="text-lg font-semibold text-slate-800">Last Payout</h3>
                    <p className="text-3xl font-bold text-indigo-600">₹{earningsData.lastPayout.amount.toLocaleString()}</p>
                    <p className="text-sm text-slate-500">on {earningsData.lastPayout.date}</p>
                </div>
            </div>

            {/* Transaction History */}
            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Transaction History</h3>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {earningsData.transactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{transaction.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">{transaction.description}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {transaction.amount > 0 ? `+₹${transaction.amount}` : `-₹${Math.abs(transaction.amount)}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                            {transaction.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EarningsView;
