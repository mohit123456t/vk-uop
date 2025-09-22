
import React, { useState, useEffect } from 'react';
import { firestore } from '../../services/firebase';
import { collection, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { ICONS } from '../../constants';
import authService from '../../services/authService';

// --- NEW, IMPROVED CHILD COMPONENTS --- //
const StaffCard = ({ name, count, icon, onClick, gradient }) => (
    <div onClick={onClick} className={`cursor-pointer block p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transform transition-all duration-300 min-w-[260px] max-w-[350px] flex-1 m-4 text-white ${gradient}`}>
        <div className="flex justify-between items-start">
            <div className="flex flex-col">
                 <p className="text-2xl font-bold">{name}</p>
                <p className="text-sm opacity-80">{count} members</p>
            </div>
            {React.isValidElement(icon) && (
                 <div className="p-3 bg-white/20 rounded-full">
                    {React.cloneElement(icon, { className: 'h-8 w-8' })}
                </div>
            )}
        </div>
    </div>
);

// --- MAIN VIEW --- //
const StaffManagementView = () => {
    // --- STATE MANAGEMENT --- //
    const [allStaff, setAllStaff] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [viewingStaffProfile, setViewingStaffProfile] = useState(null); // Placeholder for future use
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: '' });

    const staffCategoriesList = [
        { name: 'Admins', icon: ICONS.briefcase, role: 'admin', gradient: 'bg-gradient-to-tr from-blue-600 to-blue-400' },
        { name: 'Editors', icon: ICONS.edit, role: 'video-editor', gradient: 'bg-gradient-to-tr from-purple-600 to-purple-400' },
        { name: 'Script Writers', icon: ICONS.fileText, role: 'script-writer', gradient: 'bg-gradient-to-tr from-green-600 to-green-400' },
        { name: 'Thumbnail Makers', icon: ICONS.image, role: 'thumbnail-maker', gradient: 'bg-gradient-to-tr from-orange-600 to-orange-400' },
        { name: 'Uploaders', icon: ICONS.uploadCloud, role: 'uploader', gradient: 'bg-gradient-to-tr from-pink-600 to-pink-400' },
        { name: 'Finance', icon: ICONS.money, role: 'finance', gradient: 'bg-gradient-to-tr from-teal-600 to-teal-400' },
    ];

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(firestore, "users"));
            const staffData = {};
            staffCategoriesList.forEach(cat => staffData[cat.name] = []);
            querySnapshot.forEach((userDoc) => {
                const user = { ...userDoc.data(), id: userDoc.id };
                const category = staffCategoriesList.find(c => c.role === user.role);
                if (category) {
                    if (!staffData[category.name]) staffData[category.name] = [];
                    staffData[category.name].push(user);
                }
            });
            setAllStaff(staffData);
        } catch (error) {
            console.error("Error fetching staff data:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const staffCategories = staffCategoriesList.map(category => ({ ...category, count: allStaff[category.name]?.length || 0 }));

    const handleAddStaff = async () => {
        const selectedRoleInfo = staffCategoriesList.find(c => c.name === newStaff.role);
        if (!selectedRoleInfo) { alert('Invalid role selected'); return; }
        
        const { role } = selectedRoleInfo;
        try {
            const existingUser = await authService.findUserByEmail(newStaff.email);
            if (existingUser) {
                 if (window.confirm('This user already exists. Do you want to update their role and activate them?')) {
                    await authService.updateUserProfile(existingUser.uid, { isActive: true, role: role, name: newStaff.name });
                    alert('Staff member updated and activated.');
                } else return;
            } else {
                if (!newStaff.password || newStaff.password.length < 6) {
                    alert('Password must be at least 6 characters long.'); return;
                }
                await authService.signUpWithRole(newStaff.name, newStaff.email, newStaff.password, role);
                alert('Staff member added successfully!');
            }
            await fetchStaff();
            setNewStaff({ name: '', email: '', password: '', role: '' });
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Error handling staff addition: ", error);
            alert(`Error: ${error.message}`);
        }
    };
    
    const handleDeactivateReactivateStaff = async (staff, makeActive) => {
        const action = makeActive ? 'reactivate' : 'deactivate';
        if(window.confirm(`Are you sure you want to ${action} this staff member?`)){
            try {
                await authService.updateUserProfile(staff.id, { isActive: makeActive });
                await fetchStaff();
                 if (viewingStaffProfile && viewingStaffProfile.id === staff.id) {
                    setViewingStaffProfile(prev => ({...prev, isActive: makeActive}));
                }
                alert(`Staff member ${action}d.`);
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
    };

    const handleResetPassword = async (email) => {
        if (window.confirm(`Send a password reset link to ${email}?`)) {
            try {
                await authService.sendPasswordResetEmail(email);
                alert('Password reset email sent successfully.');
            } catch (error) {
                 alert(`Error: ${error.message}`);
            }
        }
    };

    // --- RENDER LOGIC --- //
    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-24 w-24 border-b-4 border-indigo-600"></div></div>;

    if (selectedCategory) {
        const staffList = allStaff[selectedCategory] || [];
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <button onClick={() => setSelectedCategory(null)} className="mb-8 flex items-center bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 shadow-sm"><span className="mr-2">{ICONS.arrowLeft}</span>Back to Categories</button>
                <h1 className="text-4xl font-extrabold text-gray-800 mb-8">{selectedCategory}</h1>
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead><tr className="border-b-2 border-gray-100"><th className="p-4 text-sm font-semibold text-gray-500 uppercase">Name</th><th className="p-4 text-sm font-semibold text-gray-500 uppercase">Email</th><th className="p-4 text-sm font-semibold text-gray-500 uppercase">Status</th><th className="p-4 text-sm font-semibold text-gray-500 uppercase text-right">Actions</th></tr></thead>
                            <tbody>
                                {staffList.map(staff => (
                                    <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                        <td className="p-4 font-medium text-gray-800">{staff.name}</td>
                                        <td className="p-4 text-gray-600">{staff.email}</td>
                                        <td className="p-4"><span className={`px-3 py-1 text-xs font-bold rounded-full ${staff.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{staff.isActive ? 'Active' : 'Deactivated'}</span></td>
                                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                            <button onClick={() => handleResetPassword(staff.email)} className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">Reset Password</button>
                                            <button onClick={() => handleDeactivateReactivateStaff(staff, !staff.isActive)} className={`px-4 py-2 text-sm font-semibold rounded-lg ${staff.isActive ? 'text-red-600 bg-red-100 hover:bg-red-200' : 'text-green-600 bg-green-100 hover:bg-green-200'}`}>{staff.isActive ? 'Deactivate' : 'Reactivate'}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {staffList.length === 0 && <p className="text-center p-12 text-gray-500">No staff members in this category yet.</p>}
                    </div>
                </div>
            </div>
        )
    }

    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-10">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-800">Staff Management</h1>
                <p className="text-gray-500 mt-1">Manage all staff members and their roles.</p>
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"><span className="mr-2">{ICONS.plus}</span>Add New Staff</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {staffCategories.map(cat => <StaffCard key={cat.name} {...cat} onClick={() => setSelectedCategory(cat.name)} />)}
        </div>
        {isAddModalOpen && (
             <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Add New Staff Member</h2>
                <form onSubmit={e => { e.preventDefault(); handleAddStaff(); }} className="space-y-5">
                    <input type="text" placeholder="Full Name" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    <input type="email" placeholder="Email Address" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    <input type="password" placeholder="New Password (min. 6 chars)" value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                    <select value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value })} className="w-full p-4 border border-gray-200 rounded-xl bg-white appearance-none focus:ring-2 focus:ring-indigo-500 outline-none" required>
                        <option value="" disabled>Select a role for the staff member</option>
                        {staffCategoriesList.map(cat => <option key={cat.role} value={cat.name}>{cat.name}</option>)}
                    </select>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700">Add Staff</button>
                    </div>
                </form>
            </div></div>
        )}
      </div>
    );
};

export default StaffManagementView;
