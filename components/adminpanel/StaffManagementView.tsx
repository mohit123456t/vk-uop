import React, { useState, useEffect } from 'react';
import { firestore } from '../../services/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ICONS } from '../../constants';
import authService from '../../services/authService';

// --- CHILD COMPONENTS --- //
const StaffCard = ({ name, count, icon, onClick }) => (
    <div onClick={onClick} className="cursor-pointer block p-6 bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 min-w-[250px] max-w-[350px] flex-1 m-4">
        <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">{React.cloneElement(icon, { className: 'h-8 w-8 text-blue-600' })}</div>
            <div>
                <p className="text-xl font-bold text-gray-800">{name}</p>
                <p className="text-gray-500">{count} members</p>
            </div>
        </div>
    </div>
);

const StatDisplayCard = ({ label, value, icon }) => (
    <div className="bg-slate-100 p-4 rounded-lg flex items-center">
        <div className="p-2 bg-slate-200 rounded-full mr-4">{icon}</div>
        <div>
            <div className="text-slate-500 text-sm font-medium">{label}</div>
            <div className="text-slate-900 text-xl font-bold">{value}</div>
        </div>
    </div>
);

// --- MAIN VIEW --- //
const StaffManagementView = () => {
    // --- STATE MANAGEMENT --- //
    const [allStaff, setAllStaff] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [viewingStaffProfile, setViewingStaffProfile] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: '' });

    const staffCategoriesList = [
        { name: 'Admins', icon: ICONS.briefcase, role: 'admin' },
        { name: 'Editors', icon: ICONS.edit, role: 'video-editor' },
        { name: 'Script Writers', icon: ICONS.fileText, role: 'script-writer' },
        { name: 'Thumbnail Makers', icon: ICONS.image, role: 'thumbnail-maker' },
        { name: 'Uploaders', icon: ICONS.uploadCloud, role: 'uploader' },
        { name: 'Finance', icon: ICONS.money, role: 'finance' },
    ];

    const fetchStaff = async () => {
        setLoading(true);
        const querySnapshot = await getDocs(collection(firestore, "users"));
        const staffData = {};
        staffCategoriesList.forEach(cat => staffData[cat.name] = []);

        querySnapshot.forEach((doc) => {
            const user = { ...doc.data(), id: doc.id };
            const category = staffCategoriesList.find(c => c.role === user.role);
            if (category) {
                staffData[category.name].push({
                    ...user,
                    tasksCompleted: user.completedTasks || 0,
                    tasksPending: user.pendingTasks || 0,
                    totalEarnings: user.totalEarnings || 0,
                    salaryDue: user.salaryDue || 0,
                    activity: user.activity || []
                });
            }
        });
        setAllStaff(staffData);
        setLoading(false);
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const staffCategories = staffCategoriesList.map(category => ({ ...category, count: allStaff[category.name]?.length || 0 }));

    const formatRole = (role) => {
        const roleName = staffCategoriesList.find(c => c.role === role)?.name;
        return roleName || role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    const handleAddStaff = async () => {
        const selectedRoleInfo = staffCategoriesList.find(c => c.name === newStaff.role);
        if (!selectedRoleInfo) { alert('Invalid role selected'); return; }
        
        const { role } = selectedRoleInfo;

        try {
            const existingUser = await authService.findUserByEmail(newStaff.email);

            if (existingUser) {
                if (existingUser.isActive === false) {
                    if (window.confirm('This user is inactive. Reactivate and assign the new role?')) {
                        await authService.updateUserProfile(existingUser.uid, { isActive: true, role: role, name: newStaff.name });
                        alert('Staff member reactivated and updated.');
                    } else return;
                } else {
                    alert('A staff member with this email already exists and is active.');
                    return;
                }
            } else {
                if (!newStaff.password || newStaff.password.length < 6) {
                    alert('Password must be at least 6 characters long for new users.');
                    return;
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

    const handleDeactivateStaff = async (category, staffId) => {
        if(window.confirm('Are you sure you want to deactivate this staff member?')){
            try {
                await authService.updateUserProfile(staffId, { isActive: false });
                // Visually update the UI
                setAllStaff(prev => ({
                    ...prev,
                    [category]: prev[category].map(staff => staff.id === staffId ? { ...staff, isActive: false } : staff)
                }));
                if (viewingStaffProfile && viewingStaffProfile.id === staffId) {
                    setViewingStaffProfile(prev => ({...prev, isActive: false}));
                }
                alert('Staff member deactivated.');
            } catch (error) {
                console.error("Error deactivating staff: ", error);
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
                console.error("Error sending password reset email: ", error);
                alert(`Error: ${error.message}`);
            }
        }
    };

    const handleSalaryWithdraw = async (staff) => {
        const amountStr = prompt(`Enter amount to withdraw for ${staff.name} (Max: ${staff.salaryDue})`, String(staff.salaryDue));
        const amount = Number(amountStr);
        if (amountStr && !isNaN(amount) && amount > 0 && amount <= staff.salaryDue) {
            const newSalaryDue = staff.salaryDue - amount;
            const newTotalEarnings = (staff.totalEarnings || 0) + amount;
            try {
                await updateDoc(doc(firestore, "users", staff.id), { salaryDue: newSalaryDue, totalEarnings: newTotalEarnings });
                // Update local state
                setAllStaff(prev => ({ ...prev, [selectedCategory]: prev[selectedCategory].map(s => s.id === staff.id ? {...s, salaryDue: newSalaryDue, totalEarnings: newTotalEarnings} : s) }));
                setViewingStaffProfile(prev => ({...prev, salaryDue: newSalaryDue, totalEarnings: newTotalEarnings}));
                alert(`Withdrawal of ₹${amount} for ${staff.name} processed.`)
            } catch (error) {
                 alert(`Error: ${error.message}`);
            }
        } else {
            alert('Invalid withdrawal amount.');
        }
    }

    // --- RENDER LOGIC --- //
    if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-24 w-24 border-b-4 border-slate-900"></div></div>;

    if (viewingStaffProfile) {
        const staff = viewingStaffProfile;
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <button onClick={() => setViewingStaffProfile(null)} className="mb-8 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300">&larr; Back</button>
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex items-center space-x-6 mb-8">
                        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 text-4xl font-bold">{staff.name.charAt(0)}</div>
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-800">{staff.name}</h1>
                            <p className="text-xl text-gray-500">{staff.email}</p>
                             <p className={`text-lg font-semibold mt-1 px-3 py-1 rounded-full inline-block ${staff.isActive === false ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-600'}`}>{formatRole(staff.role)}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Stat cards */}
                    </div>
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-700 mb-4">Salary Management</h2>
                        {/* Salary management UI */}
                    </div>
                    {/* Recent activity */}
                </div>
            </div>
        );
    }

    if (selectedCategory) {
        const staffList = allStaff[selectedCategory] || [];
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <button onClick={() => setSelectedCategory(null)} className="mb-8 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300">&larr; Back</button>
                <h1 className="text-4xl font-extrabold text-gray-800 mb-8">{selectedCategory}</h1>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead><tr><th className="p-4">Name</th><th>Email</th><th>Status</th><th className="text-right p-4">Actions</th></tr></thead>
                            <tbody>
                                {staffList.map(staff => (
                                    <tr key={staff.id} className="border-b border-gray-100">
                                        <td onClick={() => setViewingStaffProfile(staff)} className="p-4 font-medium text-gray-800 cursor-pointer hover:text-indigo-600">{staff.name}</td>
                                        <td className="p-4 text-gray-600">{staff.email}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${staff.isActive === false ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {staff.isActive === false ? 'Deactivated' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleResetPassword(staff.email)} className="text-blue-500 hover:text-blue-700 font-semibold mr-4">Reset Password</button>
                                            {staff.isActive !== false && 
                                                <button onClick={() => handleDeactivateStaff(selectedCategory, staff.id)} className="text-red-500 hover:text-red-700 font-semibold">Deactivate</button>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {staffList.length === 0 && <p className="text-center p-8 text-gray-500">No staff in this category.</p>}
                    </div>
                </div>
            </div>
        )
    }

    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-800">Staff Management</h1>
            <button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700">Add New Staff</button>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
            {staffCategories.map(cat => <StaffCard key={cat.name} {...cat} onClick={() => setSelectedCategory(cat.name)} />)}
        </div>
        {isAddModalOpen && (
             <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"><div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-3xl font-bold mb-6">Add New Staff Member</h2>
                <form onSubmit={e => { e.preventDefault(); handleAddStaff(); }}>
                    <div className="space-y-4">
                        <input type="text" placeholder="Full Name" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} className="w-full p-3 border rounded-lg" required />
                        <input type="email" placeholder="Email Address" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} className="w-full p-3 border rounded-lg" required />
                        <input type="password" placeholder="New Password (min. 6 chars)" value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} className="w-full p-3 border rounded-lg" />
                        <select value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value })} className="w-full p-3 border rounded-lg bg-white" required>
                            <option value="" disabled>Select a role</option>
                            {staffCategoriesList.map(cat => <option key={cat.role} value={cat.name}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4 mt-8">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2 bg-gray-200 rounded-lg">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Add Staff</button>
                    </div>
                </form>
            </div></div>
        )}
      </div>
    );
};

export default StaffManagementView;
