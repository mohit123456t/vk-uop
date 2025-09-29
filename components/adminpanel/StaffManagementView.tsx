import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { ICONS } from '../../constants';
import authService from '../../services/authService';
import { motion, AnimatePresence } from 'framer-motion';

const StaffCard = ({ name, count, icon, onClick, gradient }) => (
    <motion.div
        onClick={onClick}
        className="cursor-pointer bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6 flex-1"
        whileHover={{ y: -5, scale: 1.02 }} whileTap={{ scale: 0.98 }}
    >
        <div className="flex justify-between items-start">
            <div className="flex flex-col">
                <p className="text-xl font-bold text-slate-900">{name}</p>
                <p className="text-sm text-slate-600">{count} members</p>
            </div>
            {React.isValidElement(icon) && (
                <div className={`p-3 rounded-lg ${gradient}`}>
                    {React.cloneElement(icon, { className: 'h-8 w-8' })}
                </div>
            )}
        </div>
    </motion.div>
);

const StaffManagementView = () => {
    const [allStaff, setAllStaff] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: '' });

    const staffCategoriesList = [
        { name: 'Brands', icon: ICONS.usersGroup, role: 'brand', gradient: 'bg-indigo-100 text-indigo-600' },
        { name: 'Admins', icon: ICONS.brief, role: 'admin', gradient: 'bg-blue-100 text-blue-600' },
        { name: 'Editors', icon: ICONS.pencilSquare, role: 'video_editor', gradient: 'bg-purple-100 text-purple-600' },
        { name: 'Script Writers', icon: ICONS.clipboard, role: 'script_writer', gradient: 'bg-green-100 text-green-600' },
        { name: 'Thumbnail Makers', icon: ICONS.photo, role: 'thumbnail_maker', gradient: 'bg-orange-100 text-orange-600' },
        { name: 'Uploaders', icon: ICONS.upload, role: 'uploader', gradient: 'bg-pink-100 text-pink-600' },
    ];

    const fetchStaff = useCallback(async () => {
        setLoading(true);
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const staffByRole = {};
            staffCategoriesList.forEach(cat => { staffByRole[cat.name] = []; });

            usersSnapshot.forEach(doc => {
                const user = { id: doc.id, ...doc.data() };
                const category = staffCategoriesList.find(cat => cat.role === user.role);
                if (category) {
                    staffByRole[category.name].push(user);
                }
            });
            setAllStaff(staffByRole);
        } catch (error) {
            console.error("Error fetching staff:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);
    
    const handleAddStaff = async () => { 
      // Implement add staff logic here, then refetch
      setIsAddModalOpen(false);
      fetchStaff();
    };
    const handleDeactivateReactivateStaff = async (staff, makeActive) => { 
        // Implement staff status change logic here, then refetch
        fetchStaff();
    };
    const handleResetPassword = async (email) => { 
      // Implement password reset logic here
    };

    const staffCategories = staffCategoriesList.map(category => ({
        name: category.name,
        count: allStaff[category.name]?.length || 0,
        icon: category.icon,
        gradient: category.gradient
    }));

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (selectedCategory) {
        const staffList = allStaff[selectedCategory] || [];
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button
                    onClick={() => setSelectedCategory(null)}
                    className="mb-8 flex items-center bg-white/50 backdrop-blur-xl text-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-white/80 shadow-lg shadow-slate-200/80 border border-slate-300/50 transition"
                >
                    <span className="mr-2">{ICONS.arrowLeft}</span> Back to Categories
                </button>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tighter mb-6">{selectedCategory}</h1>
                <motion.div
                    className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-300/50">
                                <tr>
                                    <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                                    <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                                    <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-300/50">
                                {staffList.map(staff => (
                                    <tr key={staff.id} className="hover:bg-white/30 transition-colors">
                                        <td className="p-4 font-medium text-slate-800">{staff.name}</td>
                                        <td className="p-4 text-slate-600">{staff.email}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                staff.isActive ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'
                                            }`}>
                                                {staff.isActive ? 'Active' : 'Deactivated'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                            <button onClick={() => handleResetPassword(staff.email)} className="px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition">Reset Password</button>
                                            <button onClick={() => handleDeactivateReactivateStaff(staff, !staff.isActive)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                                                staff.isActive ? 'text-red-700 bg-red-500/10 hover:bg-red-500/20' : 'text-green-700 bg-green-500/10 hover:bg-green-500/20'
                                            }`}>
                                                {staff.isActive ? 'Deactivate' : 'Reactivate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {staffList.length === 0 && <p className="text-center p-12 text-slate-500">No staff members in this category yet.</p>}
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Staff Management</h1>
                    <p className="text-slate-500 mt-1">Manage all staff members and their roles.</p>
                </div>
                <motion.button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/30"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                    <span className="mr-2">{ICONS.plus}</span> Add New Staff
                </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffCategories.map((cat, index) => (
                    <motion.div key={cat.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                        <StaffCard {...cat} onClick={() => setSelectedCategory(cat.name)} />
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div 
                        className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="bg-white/60 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-300/50"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                        >
                            <h2 className="text-2xl font-bold mb-6 text-slate-900">Add New Staff Member</h2>
                            <form onSubmit={e => { e.preventDefault(); handleAddStaff(); }} className="space-y-5">
                                <input type="text" placeholder="Full Name" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} className="w-full p-4 bg-white/50 border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                                <input type="email" placeholder="Email Address" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} className="w-full p-4 bg-white/50 border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                                <input type="password" placeholder="New Password (min. 6 chars)" value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} className="w-full p-4 bg-white/50 border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                <select value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value })} className="w-full p-4 bg-white/50 border border-slate-300/70 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none" required>
                                    <option value="" disabled>Select a role for the staff member</option>
                                    {staffCategoriesList.map(cat => <option key={cat.role} value={cat.role}>{cat.name}</option>)}
                                </select>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 bg-slate-500/10 text-slate-800 rounded-lg font-medium hover:bg-slate-500/20 transition">Cancel</button>
                                    <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30">Add Staff</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default StaffManagementView;
