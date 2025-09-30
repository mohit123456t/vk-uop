import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';
import { motion } from 'framer-motion';
import { db } from '../../services/firebase';
import { collection, getDoc, setDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';

const ManagementCard = ({ title, children }) => (
    <motion.div
        className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
        <div className="space-y-4">
            {children}
        </div>
    </motion.div>
);

const InputField = ({ label, type = 'number', value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-2 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
        />
    </div>
);

const PricingManagement = () => {
    const [pricePerReel, setPricePerReel] = useState(0);
    const [avgViewsPerReel, setAvgViewsPerReel] = useState(0);
    const [discountTiers, setDiscountTiers] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', limit: '' });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Listen for real-time updates on pricing settings
    useEffect(() => {
        const pricingDocRef = doc(db, 'settings', 'pricing');
        const unsubscribe = onSnapshot(pricingDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setPricePerReel(data.pricePerReel || 0);
                setAvgViewsPerReel(data.avgViewsPerReel || 0);
                setDiscountTiers(data.discountTiers || []);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Listen for real-time updates on coupons
    useEffect(() => {
        const couponsColRef = collection(db, 'coupons');
        const unsubscribe = onSnapshot(couponsColRef, (snapshot) => {
            setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const handleAddTier = () => {
        setDiscountTiers([...discountTiers, { reels: 0, discount: 0 }]);
    };

    const handleUpdateTier = (index, field, value) => {
        const updatedTiers = [...discountTiers];
        updatedTiers[index][field] = Number(value);
        setDiscountTiers(updatedTiers);
    };
    
    const handleRemoveTier = (index) => {
        setDiscountTiers(discountTiers.filter((_, i) => i !== index));
    };
    
    const handleAddCoupon = async (e) => {
        e.preventDefault();
        if (!newCoupon.code || !newCoupon.discount) return;
        const newCouponData = {
            code: newCoupon.code.toUpperCase(),
            discount: Number(newCoupon.discount),
            limit: newCoupon.limit ? Number(newCoupon.limit) : 'unlimited',
            used: 0,
            isActive: true,
        };

        const couponRef = doc(db, 'coupons', newCouponData.code);
        await setDoc(couponRef, newCouponData);
        setNewCoupon({ code: '', discount: '', limit: '' });
    };

    const handleDeleteCoupon = async (couponId) => {
        await deleteDoc(doc(db, "coupons", couponId));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        const pricingSettings = {
            pricePerReel,
            avgViewsPerReel,
            discountTiers
        };
        try {
            await setDoc(doc(db, 'settings', 'pricing'), pricingSettings);
            alert('Pricing changes have been saved!');
        } catch (error) {
            console.error("Error saving settings: ", error);
            alert('Failed to save changes.');
        }
        setIsSaving(false);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><p>Loading pricing settings...</p></div>;
    }

    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Pricing & Coupon Management</h1>
                <p className="text-slate-500 mt-1">Set campaign pricing, volume discounts, and promotional coupons.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <ManagementCard title="Base Pricing">
                         <InputField 
                            label="Price per Reel (₹)" 
                            value={pricePerReel} 
                            onChange={(e) => setPricePerReel(Number(e.target.value))}
                        />
                         <InputField 
                            label="Average Views per Reel (for estimation)" 
                            value={avgViewsPerReel} 
                            onChange={(e) => setAvgViewsPerReel(Number(e.target.value))}
                        />
                    </ManagementCard>

                    <ManagementCard title="Volume Discounts">
                        {discountTiers.map((tier, index) => (
                            <div key={index} className="flex items-center gap-4 p-2 rounded-md hover:bg-black/5">
                                <span className="font-medium text-slate-700">If reels ≥</span>
                                <input type="number" value={tier.reels} onChange={e => handleUpdateTier(index, 'reels', e.target.value)} className="w-24 px-2 py-1 bg-white/50 border rounded-md"/>
                                <span className="font-medium text-slate-700">, give</span>
                                <input type="number" value={tier.discount} onChange={e => handleUpdateTier(index, 'discount', e.target.value)} className="w-20 px-2 py-1 bg-white/50 border rounded-md"/>
                                <span className="font-medium text-slate-700">% discount.</span>
                                <button onClick={() => handleRemoveTier(index)} className="text-red-500 hover:text-red-700 ml-auto">{ICONS.trash}</button>
                            </div>
                        ))}
                        <button onClick={handleAddTier} className="mt-2 text-indigo-600 font-semibold text-sm flex items-center">
                           <span className="mr-1">{ICONS.plus}</span> Add Discount Tier
                        </button>
                    </ManagementCard>
                    
                    <div className="flex justify-end">
                        <motion.button 
                            onClick={handleSaveChanges}
                            disabled={isSaving}
                            className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 disabled:bg-indigo-400"
                            whileHover={{ scale: isSaving ? 1 : 1.05 }}
                        >
                            {isSaving ? 'Saving...' : 'Save All Pricing Changes'}
                        </motion.button>
                    </div>
                </div>
                
                <div className="space-y-8">
                     <ManagementCard title="Create New Coupon">
                        <form onSubmit={handleAddCoupon} className="space-y-4">
                            <InputField 
                                label="Coupon Code"
                                type="text"
                                value={newCoupon.code}
                                onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                                placeholder="e.g., LAUNCH20"
                            />
                            <InputField 
                                label="Discount Percentage (%)"
                                value={newCoupon.discount}
                                onChange={e => setNewCoupon({...newCoupon, discount: e.target.value})}
                                placeholder="e.g., 20"
                            />
                            <InputField 
                                label="Usage Limit (optional)"
                                value={newCoupon.limit}
                                onChange={e => setNewCoupon({...newCoupon, limit: e.target.value})}
                                placeholder="e.g., 100"
                            />
                            <button type="submit" className="w-full bg-slate-800 text-white font-bold py-2.5 rounded-lg hover:bg-slate-900 transition-colors shadow-md">
                                Create Coupon
                            </button>
                        </form>
                    </ManagementCard>

                    <ManagementCard title="Active Coupons">
                        {coupons.map(coupon => (
                            <div key={coupon.id} className="flex justify-between items-center bg-black/5 p-3 rounded-lg">
                                <div>
                                    <p className="font-mono text-slate-900 font-bold">{coupon.id}</p>
                                    <p className="text-sm text-slate-600">{coupon.discount}% off | Used: {coupon.used}/{coupon.limit}</p>
                                </div>
                                <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-red-500 hover:text-red-700">{ICONS.trash}</button>
                            </div>
                        ))}
                         {coupons.length === 0 && <p className="text-slate-500 text-center py-4">No active coupons found.</p>}
                    </ManagementCard>
                </div>
            </div>
        </div>
    );
};

export default PricingManagement;
