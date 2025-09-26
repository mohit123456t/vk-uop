import React, { useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const WithdrawPanel = ({ user, currentBalance, setCurrentBalance }) => {
    const [amount, setAmount] = useState('');

    const handleWithdraw = async () => {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        if (amt > currentBalance) {
            alert('Insufficient balance');
            return;
        }
        const newBalance = currentBalance - amt;
        setCurrentBalance(newBalance);
        setAmount('');
        alert(`₹${amt.toFixed(2)} withdrawn from your balance.`);
        // Save new balance to Firestore
        if (user && user.uid) {
            const billingDoc = doc(db, `users/${user.uid}/billing/main`);
            await setDoc(billingDoc, { balance: newBalance }, { merge: true });
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 max-w-md mx-auto mb-8">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Withdraw Funds</h2>
            <p className="mb-4 text-slate-700">Current Balance: <span className="font-semibold">₹{currentBalance.toLocaleString()}</span></p>
            <div className="flex space-x-2">
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                    onClick={handleWithdraw}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                    Withdraw
                </button>
            </div>
        </div>
    );
};

export default WithdrawPanel;