import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { motion, AnimatePresence } from 'framer-motion';

// THEME UPDATE: AddBrandForm को ग्लास थीम के लिए स्टाइल किया गया है
const AddBrandForm = ({ onClose, onUserAdded }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', mobile: '', brandName: '', role: 'brand'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, 'users'), formData);
            onUserAdded();
            onClose();
        } catch (error) {
            console.error('Error adding brand:', error);
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const inputStyle = "w-full px-4 py-2.5 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder:text-slate-500";

    return (
        <motion.div 
            className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <h2 className="text-xl font-bold mb-4 text-slate-800">Add New Brand</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className={`mt-1 ${inputStyle}`} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Brand Name</label>
                        <input type="text" name="brandName" value={formData.brandName} onChange={handleChange} required className={`mt-1 ${inputStyle}`} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className={`mt-1 ${inputStyle}`} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required className={`mt-1 ${inputStyle}`} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Mobile Number</label>
                        <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required className={`mt-1 ${inputStyle}`} />
                    </div>
                </div>
                <div className="flex space-x-4 pt-4 border-t border-slate-300/50">
                    <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-colors disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed">
                        {loading ? 'Adding...' : 'Add Brand'}
                    </button>
                    <button type="button" onClick={onClose} className="px-6 py-2.5 font-medium text-slate-700 bg-slate-500/10 hover:bg-slate-500/20 rounded-lg transition-colors">
                        Cancel
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

const UserManagementView = () => {
    const [showAddBrandForm, setShowAddBrandForm] = useState(false);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBrands = async () => {
        setLoading(true);
        const q = query(collection(db, 'users'), where('role', '==', 'brand'));
        const querySnapshot = await getDocs(q);
        const brandsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBrands(brandsData);
        setLoading(false);
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleUserAdded = () => {
        fetchBrands(); // Refresh list after adding a new brand
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Brand Management</h1>
                <motion.button 
                    onClick={() => setShowAddBrandForm(!showAddBrandForm)} 
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {showAddBrandForm ? 'Close Form' : 'Add New Brand'}
                </motion.button>
            </div>

            <AnimatePresence>
                {showAddBrandForm && <AddBrandForm onClose={() => setShowAddBrandForm(false)} onUserAdded={handleUserAdded} />}
            </AnimatePresence>

            {/* THEME UPDATE: ब्रांड्स की टेबल को ग्लास पैनल में डाला गया है */}
            <motion.div 
                className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="p-6 border-b border-slate-300/50">
                    <h2 className="text-lg font-semibold text-slate-800">Registered Brands</h2>
                </div>
                {loading ? (
                     <div className="p-6 text-center text-slate-700">Loading brands...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-slate-300/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Brand Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Mobile</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-300/50">
                                {brands.map(brand => (
                                    <tr key={brand.id} className="hover:bg-white/30 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{brand.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{brand.brandName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{brand.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{brand.mobile}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                 {brands.length === 0 && !loading && (
                    <div className="p-6 text-center text-slate-500">No brands found.</div>
                )}
            </motion.div>
        </div>
    );
};

export default UserManagementView;