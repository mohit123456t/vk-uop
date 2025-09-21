import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import AddFundsPanel from './AddFundsPanel';
import WithdrawPanel from './WithdrawPanel';

const BillingView = ({ user }) => {
    const [showAddFunds, setShowAddFunds] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [monthlyBudget, setMonthlyBudget] = useState(0);

    useEffect(() => {
        const fetchBillingData = async () => {
            if (user && user.uid) {
                try {
                    // Fetch balance and budget only
                    const billingDoc = doc(db, `users/${user.uid}/billing/main`);
                    const billingSnap = await getDoc(billingDoc);
                    if (billingSnap.exists()) {
                        setCurrentBalance(billingSnap.data().balance || 0);
                        setMonthlyBudget(billingSnap.data().monthlyBudget || 0);
                    } else {
                        setCurrentBalance(0);
                        setMonthlyBudget(0);
                    }

                    // Fetch invoices
                    const invoicesCol = collection(db, `users/${user.uid}/billing/main/invoices`);
                    const invoicesSnap = await getDocs(invoicesCol);
                    setInvoices(invoicesSnap.docs.map(doc => doc.data()));
                } catch (err) {
                    console.error('Error fetching billing data:', err);
                }
            }
        };
        fetchBillingData();
    }, [user]);

    // Remove totalSpend and budgetUsed calculations

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Billing Dashboard</h1>

            {/* Add Funds and Withdraw Buttons at Top */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setShowAddFunds(prev => !prev)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {showAddFunds ? 'Hide Add Funds' : 'Add Funds'}
                </button>
                <button
                    onClick={() => setShowWithdraw(prev => !prev)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                    {showWithdraw ? 'Hide Withdraw' : 'Withdraw'}
                </button>
            </div>

            {showAddFunds && <AddFundsPanel user={user} />}
            {showWithdraw && <WithdrawPanel user={user} currentBalance={currentBalance} setCurrentBalance={setCurrentBalance} />}

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Current Balance</p>
                            <p className="text-2xl font-bold text-slate-900">₹{currentBalance.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <span className="text-green-600 text-xl">₹</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Monthly Budget</p>
                            <p className="text-2xl font-bold text-slate-900">₹{monthlyBudget.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <span className="text-blue-600 text-xl">₹</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice History */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 mt-8">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Recent Invoices</h3>
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Invoice ID</th>
                            <th scope="col" className="px-6 py-3">Amount</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Download</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-4">No invoices found.</td></tr>
                        ) : (
                            invoices.map((invoice, idx) => (
                                <tr key={idx} className="bg-white border-b">
                                    <td className="px-6 py-4">{invoice.date}</td>
                                    <td className="px-6 py-4">{invoice.invoiceId}</td>
                                    <td className="px-6 py-4">₹{invoice.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{invoice.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="font-medium text-blue-600 hover:underline" onClick={() => alert(`Download invoice: ${invoice.invoiceId}`)}>Download</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            // ...existing code...
        </div>
    );
};

export default BillingView;
