import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const WithdrawPanel = ({ user, currentBalance, setCurrentBalance, onComplete }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleWithdraw = async () => {
        setError('');
        setSuccess('');
        setLoading(true);

        const amt = parseFloat(amount);

        if (isNaN(amt) || amt <= 0) {
            setError('Please enter a valid amount.');
            setLoading(false);
            return;
        }
        if (amt > currentBalance) {
            setError('Insufficient balance for this withdrawal.');
            setLoading(false);
            return;
        }

        const newBalance = currentBalance - amt;

        try {
            if (user?.uid) {
                const billingDoc = doc(db, `users/${user.uid}/billing/main`);
                await setDoc(billingDoc, { balance: newBalance }, { merge: true });
                setCurrentBalance(newBalance);
                setSuccess(`₹${amt.toLocaleString('en-IN')} withdrawn successfully!`);
                setAmount('');
                 // Automatically close the panel on success
                if (onComplete) {
                    setTimeout(() => onComplete(), 2000);
                }
            } else {
                throw new Error("User not found.");
            }
        } catch (err) {
            setError('Failed to update balance. Please try again.');
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(''), 4000); // Clear success message after 4s
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-2 text-slate-800">Withdraw Funds</h2>
            <p className="mb-4 text-slate-600">
                Current Balance: <span className="font-bold text-slate-800">₹{currentBalance.toLocaleString('en-IN')}</span>
            </p>

            <div className="space-y-4">
                <div className="flex space-x-3">
                    <div className="relative flex-1">
                         <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500">₹</span>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full pl-9 pr-4 py-3 bg-white/50 border border-slate-300/70 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition placeholder:text-slate-500 text-slate-800"
                        />
                    </div>
                    <button
                        onClick={handleWithdraw}
                        disabled={loading || !amount}
                        className="px-6 py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 active:scale-95 transform transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : 'Withdraw'}
                    </button>
                </div>
                 {error && <div className="p-3 rounded-xl bg-red-500/10 text-red-800 text-sm font-medium border border-red-500/20">{error}</div>}
                 {success && <div className="p-3 rounded-xl bg-green-500/10 text-green-800 text-sm font-medium border border-green-500/20">{success}</div>}
            </div>
        </div>
    );
};

export default WithdrawPanel;