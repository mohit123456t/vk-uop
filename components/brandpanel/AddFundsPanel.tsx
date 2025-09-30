import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, setDoc, serverTimestamp, onSnapshot, collection } from 'firebase/firestore';
import { ICONS } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface AddFundsPanelProps {
    user: { uid: string };
    onComplete: () => void;
}

interface Transaction {
    amount: number;
    brandId: string;
    status: 'Pending' | 'Completed' | 'Rejected';
    timestamp: any;
    transactionId: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'CAMPAIGN_SPEND';
}

// QR Code Component
const QRCodeDisplay = ({ amount, onPaymentDone, onCancel }) => (
    <div className="text-center p-6 bg-white/50 rounded-xl border border-slate-300/50">
        <h3 className="font-bold text-lg text-slate-800">Scan to Pay</h3>
        <p className="text-sm text-slate-600 mb-4">Use any UPI app</p>
        <div className="flex justify-center mb-4">
            {/* Placeholder for actual QR Code */}
            <div className="w-48 h-48 bg-slate-300 flex items-center justify-center rounded-lg">
                <p className="text-slate-500 text-sm">QR Code for ₹{amount}</p>
            </div>
        </div>
        <p className="font-semibold text-slate-800">Amount: ₹{amount}</p>
        <p className="text-xs text-slate-500 mt-1">Once paid, click the button below.</p>
        <div className="flex gap-4 mt-6">
            <button onClick={onCancel} className="flex-1 px-4 py-2.5 font-semibold text-slate-700 bg-slate-500/10 hover:bg-slate-500/20 rounded-lg">Cancel</button>
            <button onClick={onPaymentDone} className="flex-1 px-4 py-2.5 font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg">I have paid</button>
        </div>
    </div>
);

const AddFundsPanel: React.FC<AddFundsPanelProps> = ({ user, onComplete }) => {
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!user?.uid) return;
        setLoading(true);
        const userDocRef = doc(db, 'users', user.uid);

        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                 // FIX: Changed walletBalance to balance for consistency across the app.
                setBalance(doc.data().balance || 0);
            }
            setLoading(false);
        }, (err) => {
            setError('Failed to load balance');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleAddFunds = () => {
        setError('');
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) {
            setError('⚠️ Please enter a valid amount');
            return;
        }
        if (amt > 100000) {
            setError('⚠️ Maximum amount per transaction is ₹1,00,000');
            return;
        }
        setShowQR(true);
    };

    const handlePaymentDone = async () => {
        setRequesting(true);
        setError('');
        const amt = parseFloat(amount);
        const transactionId = `TID_${Date.now()}`;

        try {
            const newTransaction: Transaction = {
                amount: amt,
                brandId: user!.uid,
                status: 'Pending',
                timestamp: serverTimestamp(),
                transactionId,
                type: 'DEPOSIT'
            };

            await setDoc(doc(db, 'transactions', transactionId), newTransaction);

            setSuccess(`Request for ₹${amt} submitted. It will be reflected in your balance upon approval.`);
            setShowQR(false);
            setAmount('');
            setTimeout(() => {
                setSuccess('');
                if (onComplete) onComplete();
            }, 5000); // Hide message and call onComplete after 5s

        } catch (err) {
            console.error("Error submitting transaction:", err);
            setError('Could not submit request. Please try again.');
        } finally {
            setRequesting(false);
        }
    };

    if (success) {
        return (
            <div className="text-center p-6 bg-green-500/10 rounded-lg">
                <div className="text-green-700 text-3xl mb-3">{ICONS.checkCircle}</div>
                <p className="font-semibold text-green-800">{success}</p>
            </div>
        );
    }

    if (showQR) {
        return <QRCodeDisplay amount={amount} onPaymentDone={handlePaymentDone} onCancel={() => setShowQR(false)} />;
    }

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Add Funds to Wallet</h1>
                <p className="text-slate-600 text-sm mt-1">Securely add money to your account balance</p>
            </div>

            <div className="text-center p-4 mb-4 bg-slate-800/5 rounded-lg">
                <p className="text-sm text-slate-600 font-medium">Current Balance</p>
                <p className="text-2xl font-bold text-slate-800">{loading ? 'Loading...' : `₹${balance.toLocaleString('en-IN')}`}</p>
            </div>
            
            <div className="space-y-4">
                <label htmlFor="amount" className="sr-only">Amount</label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter Amount (e.g., 5000)"
                    className="w-full text-center text-lg px-4 py-3 bg-white/50 border-2 border-slate-300/70 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition"
                    disabled={requesting}
                />
                {error && <p className="text-center text-sm text-red-600">{error}</p>}
                <button 
                    onClick={handleAddFunds}
                    disabled={requesting || loading}
                    className="w-full px-6 py-4 font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {requesting ? 'Processing...' : 'Proceed to Add Funds'}
                </button>
            </div>
        </div>
    );
};

export default AddFundsPanel;
