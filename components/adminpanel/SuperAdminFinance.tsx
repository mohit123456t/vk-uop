import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const SuperAdminFinance = ({ data }) => {
  const emptyFinanceData = {
    currentBalance: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    transactions: [],
    monthlyData: [
      { month: 'Jan', revenue: 0, expenses: 0 },
      { month: 'Feb', revenue: 0, expenses: 0 },
      { month: 'Mar', revenue: 0, expenses: 0 },
      { month: 'Apr', revenue: 0, expenses: 0 },
      { month: 'May', revenue: 0, expenses: 0 },
      { month: 'Jun', revenue: 0, expenses: 0 },
    ],
    pendingWithdrawals: [],
    pendingPayments: [],
  };

  const [pendingWithdrawals, setPendingWithdrawals] = useState(data?.pendingWithdrawals || emptyFinanceData.pendingWithdrawals);
  const [pendingPayments, setPendingPayments] = useState(data?.pendingPayments || emptyFinanceData.pendingPayments);

  const handleApproveWithdrawal = (id) => {
    setPendingWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'Approved' } : w));
  };

  const handleRejectWithdrawal = (id) => {
    setPendingWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'Rejected' } : w));
  };

  const handleApprovePayment = (id) => {
    setPendingPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Approved' } : p));
  };

  const handleRejectPayment = (id) => {
    setPendingPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Rejected' } : p));
  };

  const financeData = data || emptyFinanceData;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">Super Admin Finance</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-2">Current Balance</h2>
          <p className="text-3xl font-bold text-green-600">${financeData.currentBalance.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold text-green-600">${financeData.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-2">Total Expenses</h2>
          <p className="text-3xl font-bold text-red-600">${financeData.totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-2">Completed Campaign Earnings</h2>
          <p className="text-3xl font-bold text-blue-600">${financeData.netProfit.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-2">Net Profit</h2>
          <p className="text-3xl font-bold text-purple-600">${financeData.netProfit.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold mb-4">Monthly Finance Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={financeData.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
            <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Date</th>
              <th className="py-2">Description</th>
              <th className="py-2">Type</th>
              <th className="py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {financeData.transactions.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4 text-slate-400">No transactions found.</td></tr>
            ) : (
              financeData.transactions.map(transaction => (
                <tr key={transaction.id} className="border-b">
                  <td className="py-2">{transaction.date}</td>
                  <td className="py-2">{transaction.description}</td>
                  <td className="py-2">{transaction.type}</td>
                   <td className={`py-2 ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}> 
                      ${Math.abs(transaction.amount).toLocaleString()}
                    </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold mb-4">Pending Withdrawals</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Brand</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Date</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingWithdrawals.map(withdrawal => (
              <tr key={withdrawal.id} className="border-b">
                <td className="py-2">{withdrawal.brand}</td>
                <td className="py-2">${withdrawal.amount.toLocaleString()}</td>
                <td className="py-2">{withdrawal.date}</td>
                <td className="py-2">{withdrawal.status}</td>
                <td className="py-2">
                  {withdrawal.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleApproveWithdrawal(withdrawal.id)}
                        className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectWithdrawal(withdrawal.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold mb-4">Pending Payments</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Brand</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Date</th>
              <th className="py-2">UPI ID</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingPayments.map(payment => (
              <tr key={payment.id} className="border-b">
                <td className="py-2">{payment.brand}</td>
                <td className="py-2">${payment.amount.toLocaleString()}</td>
                <td className="py-2">{payment.date}</td>
                <td className="py-2">{payment.upiId}</td>
                <td className="py-2">{payment.status}</td>
                <td className="py-2">
                  {payment.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleApprovePayment(payment.id)}
                        className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectPayment(payment.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminFinance;
