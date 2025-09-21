import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../../services/firebase';

const AddFundsPanel = ({ user }) => {
    console.log('AddFundsPanel user:', user);
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState(0);
    const [showQR, setShowQR] = useState(false);
    const [upiId] = useState('admin@upi'); // Mock UPI ID

    useEffect(() => {
        const fetchBalance = async () => {
            if (user && user.uid) {
                const billingDoc = doc(firestore, `users/${user.uid}/billing/main`);
                const billingSnap = await getDoc(billingDoc);
                if (billingSnap.exists()) {
                    setBalance(billingSnap.data().balance || 0);
                } else {
                    setBalance(0);
                }
            }
        };
        fetchBalance();
    }, [user]);

    const handleAddFunds = async () => {
        console.log('AddFundsPanel handleAddFunds called');
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        // Show QR for payment
        setShowQR(true);
    };

    const handlePaymentDone = async () => {
        const amt = parseFloat(amount);
        const newBalance = balance + amt;
        setBalance(newBalance);
        setAmount('');
        setShowQR(false);
        alert(`₹${amt.toFixed(2)} added to your balance.`);
        // Save new balance to Firestore
        if (user && user.uid) {
            console.log('Saving balance to Firestore:', newBalance, user.uid);
            const billingDoc = doc(firestore, `users/${user.uid}/billing/main`);
            await setDoc(billingDoc, { balance: newBalance }, { merge: true });
        } else {
            console.log('User is undefined, cannot save balance');
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Add Funds</h2>
            <p className="mb-4 text-slate-700">Current Balance: <span className="font-semibold">₹{balance.toLocaleString()}</span></p>
            <div className="flex space-x-2">
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleAddFunds}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Add
                </button>
            </div>

            {showQR && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm mx-auto">
                        <h3 className="text-lg font-bold mb-4">Scan QR to Pay</h3>
                        <p className="mb-2">Amount: ₹{amount}</p>
                        <p className="mb-4">UPI ID: {upiId}</p>
                        <div className="flex justify-center mb-4">
                            {/* Placeholder QR Code */}
                            <div className="w-48 h-48 bg-gray-200 flex items-center justify-center border">
                                <span className="text-gray-500">QR Code Placeholder</span>
                            </div>
                        </div>
                        <button
                            onClick={handlePaymentDone}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full"
                        >
                            Payment Done
                        </button>
                        <button
                            onClick={() => setShowQR(false)}
                            className="mt-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors w-full"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddFundsPanel;
