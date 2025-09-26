import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

// Animated Number Counter
const AnimatedNumber = ({ value, duration = 1000, prefix = '' }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const increment = value / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{prefix}{displayValue.toLocaleString('en-IN')}</span>;
};

const AddFundsPanel = ({ user }) => {
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState(0);
    const [showQR, setShowQR] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const upiId = 'admin@upi'; // Mock UPI ID

    useEffect(() => {
        const fetchBalance = async () => {
            if (!user?.uid) return;
            setLoading(true);
            try {
                const billingDoc = doc(db, `users/${user.uid}/billing/main`);
                const billingSnap = await getDoc(billingDoc);
                if (billingSnap.exists()) {
                    setBalance(billingSnap.data().balance || 0);
                } else {
                    setBalance(0);
                }
            } catch (err) {
                setError('Failed to load balance');
            } finally {
                setLoading(false);
            }
        };
        fetchBalance();
    }, [user]);

    const handleAddFunds = async () => {
        setError('');
        setSuccess('');
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) {
            setError('⚠️ Please enter a valid amount');
            return;
        }
        if (amt > 100000) {
            setError('⚠️ Maximum amount is ₹1,00,000');
            return;
        }
        setShowQR(true);
    };

    const handlePaymentDone = async () => {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) return;

        const newBalance = balance + amt;
        setBalance(newBalance);
        setAmount('');
        setShowQR(false);
        setSuccess(`✅ ₹${amt.toFixed(2)} added successfully!`);

        // Save to Firestore
        if (user?.uid) {
            try {
                const billingDoc = doc(db, `users/${user.uid}/binding/main`);
                await setDoc(billingDoc, { balance: newBalance }, { merge: true });
            } catch (err) {
                setError('Failed to update balance');
            }
        }

        // Auto-hide success message
        setTimeout(() => setSuccess(''), 3000);
    };

    return (
        <div className="animate-fade-in p-4 sm:p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    💰 Add Funds
                </h1>
                <p className="text-slate-500 text-sm">Securely add money to your account</p>
            </div>

            {/* Main Card */}
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden transition-all duration-300 hover:shadow-2xl">
                {/* Balance Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Current Balance</p>
                            <p className="text-2xl sm:text-3xl font-bold mt-1">
                                ₹<AnimatedNumber value={balance} duration={1500} />
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="p-5 sm:p-6">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Enter Amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">₹</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="100000"
                                    step="0.01"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-200">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-3 rounded-xl bg-green-50 text-green-700 text-sm font-medium border border-green-200 animate-pulse">
                                {success}
                            </div>
                        )}

                        <button
                            onClick={handleAddFunds}
                            disabled={!amount || parseFloat(amount) <= 0 || loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 active:scale-95 transform transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                </span>
                            ) : (
                                '➕ Add Funds'
                            )}
                        </button>

                        {/* Quick Amount Buttons */}
                        <div className="grid grid-cols-4 gap-2">
                            {[500, 1000, 2000, 5000].map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => setAmount(amt.toString())}
                                    className="py-2 px-3 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors active:scale-95"
                                >
                                    ₹{amt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Modal */}
            {showQR && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-auto transform animate-scale-in">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-slate-800">💳 Payment Gateway</h3>
                                <button
                                    onClick={() => setShowQR(false)}
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                >
                                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="text-center mb-6">
                                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-green-300 mb-4">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-3">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm text-slate-600">Scan to Pay</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="font-medium text-slate-800">Amount: <span className="text-green-600">₹{amount}</span></p>
                                    <p className="text-sm text-slate-600">UPI ID: <span className="font-mono bg-slate-100 px-2 py-1 rounded">{upiId}</span></p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handlePaymentDone}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 active:scale-95 transform transition-all shadow-lg hover:shadow-xl"
                                >
                                    ✅ Payment Done
                                </button>
                                <button
                                    onClick={() => setShowQR(false)}
                                    className="w-full py-3 px-4 bg-slate-600 text-white font-medium rounded-xl hover:bg-slate-700 active:scale-95 transform transition-all"
                                >
                                    ❌ Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddFundsPanel;