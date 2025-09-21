import React, { useState, useEffect } from 'react';
import { firestore } from '../../services/firebase';
import { collection, getDocs, doc, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ICONS } from '../../constants';

// --- CHILD COMPONENTS --- //
const StaffCard = ({ name, count, icon, onClick }) => {
    const displayIcon = React.isValidElement(icon) ? icon : ICONS.fallback;
    return (
        <div onClick={onClick} className="cursor-pointer block p-6 bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 min-w-[250px] max-w-[350px] flex-1 m-4">
            <div className="flex items-center space-x-4">
                {React.isValidElement(displayIcon) && <div className="p-3 bg-blue-100 rounded-full">{React.cloneElement(displayIcon, { className: 'h-8 w-8 text-blue-600' })}</div>}
                <div>
                    <p className="text-xl font-bold text-gray-800">{name}</p>
                    <p className="text-gray-500">{count} members</p>
                </div>
            </div>
        </div>
    );
};

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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: '' });
    const [editingStaff, setEditingStaff] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    const staffCategoriesList = [
        { name: 'Editors', icon: ICONS.edit, role: 'video-editor' },
        { name: 'Script Writers', icon: ICONS.fileText, role: 'script-writer' },
        { name: 'Thumbnail Makers', icon: ICONS.image, role: 'thumbnail-maker' },
        { name: 'Uploaders', icon: ICONS.uploadCloud, role: 'uploader' },
        { name: 'Finance', icon: ICONS.money, role: 'finance' },
    ];

    useEffect(() => {
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

        fetchStaff();
    }, []);

    const staffCategories = staffCategoriesList.map(category => ({ ...category, count: allStaff[category.name]?.length || 0 }));

    // --- HANDLERS --- //
    const handleAddStaff = async () => {
        const selectedRole = staffCategoriesList.find(c => c.name === newStaff.role);
        if (!selectedRole) { alert('Invalid role selected'); return; }

        try {
            const docRef = await addDoc(collection(firestore, "users"), {
                name: newStaff.name,
                email: newStaff.email,
                role: selectedRole.role,
                completedTasks: 0,
                pendingTasks: 0,
                totalEarnings: 0,
                salaryDue: 0,
                activity: [],
                status: 'Active'
            });

            const newStaffMember = { id: docRef.id, ...newStaff, role: selectedRole.role, tasksCompleted: 0, tasksPending: 0, totalEarnings: 0, salaryDue: 0, activity: [] };
            setAllStaff(prev => ({ ...prev, [newStaff.role]: [...(prev[newStaff.role] || []), newStaffMember] }));

            setNewStaff({ name: '', email: '', password: '', role: '' });
            setIsAddModalOpen(false);
            alert('Staff member added successfully!');
        } catch (error) {
            console.error("Error adding document: ", error);
            alert(`Error adding staff: ${error.message}`);
        }
    };

    const handleRemoveStaff = async (category, staffId) => {
        if(confirm('Are you sure you want to remove this staff member?')){
            try {
                await deleteDoc(doc(firestore, "users", staffId));
                setAllStaff(prev => ({ ...prev, [category]: prev[category].filter(s => s.id !== staffId) }));
                alert('Staff member removed.');
            } catch (error) {
                console.error("Error removing document: ", error);
                alert(`Error removing staff: ${error.message}`);
            }
        }
    };

    const handleOpenEditModal = (staff) => {
        setEditingStaff(staff);
        setNewPassword('');
        setIsEditModalOpen(true);
    };

    const handleUpdatePassword = () => {
        if (!newPassword || newPassword.length < 6) { alert('Password must be at least 6 characters long.'); return; }
        alert(`Password for ${editingStaff.name} has been updated.`);
        setIsEditModalOpen(false);
        setEditingStaff(null);
    };

    const handleSalaryWithdraw = async (staff) => {
        const amountStr = prompt(`Enter amount to withdraw for ${staff.name} (Max: ${staff.salaryDue})`, String(staff.salaryDue));
        if(amountStr && !isNaN(Number(amountStr))) {
            const amount = Number(amountStr);
            if(amount > 0 && amount <= staff.salaryDue) {
                const staffDocRef = doc(firestore, "users", staff.id);
                const newSalaryDue = staff.salaryDue - amount;
                const newTotalEarnings = (staff.totalEarnings || 0) + amount;

                try {
                    await updateDoc(staffDocRef, { salaryDue: newSalaryDue, totalEarnings: newTotalEarnings });
                    setAllStaff(prev => ({ ...prev, [selectedCategory]: prev[selectedCategory].map(s => s.id === staff.id ? {...s, salaryDue: newSalaryDue, totalEarnings: newTotalEarnings} : s) }));
                    setViewingStaffProfile(prev => ({...prev, salaryDue: newSalaryDue, totalEarnings: newTotalEarnings}));
                    alert(`Withdrawal of ₹${amount} for ${staff.name} processed.`)
                } catch (error) {
                     alert(`Error processing withdrawal: ${error.message}`);
                }
            } else {
                alert('Invalid withdrawal amount.');
            }
        }
    }

    // --- RENDER LOGIC --- //
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen w-full">
                <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-slate-900"></div>
                <p className="text-center mt-6 text-xl font-semibold text-slate-700">Loading Staff Data...</p>
            </div>
        );
    }

    if (viewingStaffProfile) {
        const staff = viewingStaffProfile;
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <button onClick={() => setViewingStaffProfile(null)} className="mb-8 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300">&larr; Back to Staff List</button>
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex items-center space-x-6 mb-8">
                        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 text-4xl font-bold">{staff.name.charAt(0)}</div>
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-800">{staff.name}</h1>
                            <p className="text-xl text-gray-500">{staff.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatDisplayCard label="Tasks Completed" value={staff.tasksCompleted} icon={<ICONS.checkCircle className="w-6 h-6 text-green-600" />} />
                        <StatDisplayCard label="Tasks Pending" value={staff.tasksPending} icon={<ICONS.clock className="w-6 h-6 text-orange-600" />} />
                        <StatDisplayCard label="Total Earnings" value={`₹${staff.totalEarnings.toLocaleString()}`} icon={<ICONS.money className="w-6 h-6 text-purple-600" />} />
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-700 mb-4">Salary Management</h2>
                        <div className="bg-slate-100 p-6 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="text-lg font-medium text-slate-600">Current Due Salary</p>
                                <p className="text-3xl font-bold text-slate-800">₹{staff.salaryDue.toLocaleString()}</p>
                            </div>
                            <button onClick={() => handleSalaryWithdraw(staff)} className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 shadow-md disabled:bg-gray-400" disabled={staff.salaryDue <= 0}>Withdraw</button>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-4">Recent Activity</h2>
                        <ul className="space-y-3">
                            {staff.activity && staff.activity.length > 0 ? staff.activity.map((act, i) => (
                                <li key={i} className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
                                    <p className="text-slate-700">{act.task}</p>
                                    <p className="text-sm text-slate-500 font-medium">{act.date}</p>
                                </li>
                            )) : <p className="text-center p-8 text-gray-500">No recent activity.</p>}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    if (selectedCategory) {
        const staffList = allStaff[selectedCategory] || [];
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <button onClick={() => setSelectedCategory(null)} className="mb-8 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300">&larr; Back to Categories</button>
                <h1 className="text-4xl font-extrabold text-gray-800 mb-8">{selectedCategory}</h1>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b-2 border-gray-200"><tr><th className="p-4 text-lg font-bold text-gray-600">Name</th><th className="p-4 text-lg font-bold text-gray-600">Email</th><th className="p-4 text-lg font-bold text-gray-600 text-right">Actions</th></tr></thead>
                            <tbody>
                                {staffList.map(staff => (
                                    <tr key={staff.id} className="border-b border-gray-100">
                                        <td onClick={() => setViewingStaffProfile(staff)} className="p-4 font-medium text-gray-800 cursor-pointer hover:text-indigo-600">{staff.name}</td>
                                        <td className="p-4 text-gray-600">{staff.email}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleOpenEditModal(staff)} className="text-indigo-500 hover:text-indigo-700 font-semibold mr-4">Edit</button>
                                            <button onClick={() => handleRemoveStaff(selectedCategory, staff.id)} className="text-red-500 hover:text-red-700 font-semibold">Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {staffList.length === 0 && <p className="text-center p-8 text-gray-500">No staff members in this category.</p>}
                    </div>
                </div>
            </div>
        )
    }

    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-800">Staff Management</h1>
            <button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg">Add New Staff</button>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
            {staffCategories.map(cat => <StaffCard key={cat.name} {...cat} onClick={() => setSelectedCategory(cat.name)} />)}
        </div>

        {isAddModalOpen && (
             <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"><div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Add New Staff Member</h2>
                <form onSubmit={e => { e.preventDefault(); handleAddStaff(); }}>
                    <div className="space-y-4">
                        <input type="text" placeholder="Full Name" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <input type="email" placeholder="Email Address" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <input type="password" placeholder="Password" value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <select value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg bg-white" required>
                            <option value="" disabled>Select a role</option>
                            {staffCategories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4 mt-8">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Staff</button>
                    </div>
                </form>
            </div></div>
        )}

        {isEditModalOpen && editingStaff && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"><div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Edit Password for {editingStaff.name}</h2>
                <form onSubmit={e => { e.preventDefault(); handleUpdatePassword(); }}>
                    <input type="password" placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" required />
                    <div className="flex justify-end space-x-4 mt-8">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Update Password</button>
                    </div>
                </form>
            </div></div>
        )}
      </div>
    );
};

export default StaffManagementView;
