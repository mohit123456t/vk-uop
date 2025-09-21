import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

const statusColors = {
    Completed: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Failed: 'bg-red-100 text-red-800',
};

const FinanceView = () => {
    const [payments, setPayments] = useState([]);
    useEffect(() => {
        const fetchPayments = async () => {
            const querySnapshot = await getDocs(collection(db, 'admin/payments'));
            const data = [];
            querySnapshot.forEach(doc => data.push(doc.data()));
            setPayments(data);
        };
        fetchPayments();
    }, []);
    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
            <h2 className="text-2xl font-bold mb-4">Payment Tracking</h2>
            <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100">
                    <tr>
                        <th className="px-4 py-2">Brand Name</th>
                        <th className="px-4 py-2">Amount (₹)</th>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map(payment => (
                        <tr key={payment.id} className="border-b border-slate-200 hover:bg-slate-50">
                            <td className="px-4 py-2">{payment.brandName}</td>
                            <td className="px-4 py-2">{payment.amount.toLocaleString()}</td>
                            <td className="px-4 py-2">{payment.date}</td>
                            <td className="px-4 py-2">
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[payment.status] || ''}`}>
                                    {payment.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FinanceView;
