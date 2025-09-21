import React, { useState } from 'react';
import { ICONS } from '../../constants';

// --- MOCK DATA --- //
const initialStaffData = {
  'Editors': [
    { id: 1, name: 'Aarav Sharma', email: 'aarav.sharma@example.com', tasksCompleted: 25, tasksPending: 5, totalEarnings: 50000, salaryDue: 15000, activity: [{ date: '2023-10-26', task: 'Edited final cut for "Diwali Campaign Reel"' }, { date: '2023-10-24', task: 'Revised intro for "Product Launch Video"' }] },
    { id: 2, name: 'Diya Patel', email: 'diya.patel@example.com', tasksCompleted: 30, tasksPending: 2, totalEarnings: 62000, salaryDue: 12000, activity: [{ date: '2023-10-25', task: 'Color graded "Brand Story Video"' }] },
  ],
  'Script Writers': [
    { id: 4, name: 'Priya Kumar', email: 'priya.kumar@example.com', tasksCompleted: 40, tasksPending: 8, totalEarnings: 45000, salaryDue: 8000, activity: [{ date: '2023-10-26', task: 'Wrote script for "Explainer Video Q4"' }] },
  ],
  'Thumbnail Makers': [
    { id: 6, name: 'Sneha Reddy', email: 'sneha.reddy@example.com', tasksCompleted: 150, tasksPending: 12, totalEarnings: 35000, salaryDue: 5000, activity: [{ date: '2023-10-27', task: 'Designed 5 thumbnails for new reel series' }] },
  ],
  'Uploaders': [
    { id: 7, name: 'Vikram Mehta', email: 'vikram.mehta@example.com', tasksCompleted: 200, tasksPending: 0, totalEarnings: 28000, salaryDue: 0, activity: [{ date: '2023-10-28', task: 'Scheduled 10 videos for next week' }] },
  ],
  'Finance': [
    { id: 8, name: 'Ananya Gupta', email: 'ananya.gupta@example.com', tasksCompleted: 10, tasksPending: 1, totalEarnings: 75000, salaryDue: 20000, activity: [{ date: '2023-10-27', task: 'Processed monthly payroll' }] },
  ],
};


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
    const [allStaff, setAllStaff] = useState(initialStaffData);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [viewingStaffProfile, setViewingStaffProfile] = useState(null);
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: '' });
    const [editingStaff, setEditingStaff] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    const staffCategories = [
        { name: 'Editors', icon: ICONS.edit },
        { name: 'Script Writers', icon: ICONS.fileText },
        { name: 'Thumbnail Makers', icon: ICONS.image },
        { name: 'Uploaders', icon: ICONS.uploadCloud },
        { name: 'Finance', icon: ICONS.money },
    ].map(category => ({ ...category, count: allStaff[category.name]?.length || 0 }));

    // --- HANDLERS --- //
    const handleAddStaff = () => {
        setAllStaff(prev => ({ ...prev, [newStaff.role]: [...(prev[newStaff.role] || []), { ...newStaff, id: Date.now(), tasksCompleted: 0, tasksPending: 0, totalEarnings: 0, salaryDue: 0, activity: [] }] }));
        setNewStaff({ name: '', email: '', password: '', role: '' });
        setIsAddModalOpen(false);
    };

    const handleRemoveStaff = (category, staffId) => {
        if(confirm('Are you sure you want to remove this staff member?')){
            setAllStaff(prev => ({ ...prev, [category]: prev[category].filter(s => s.id !== staffId) }));
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

    const handleSalaryWithdraw = (staff) => {
        const amount = prompt(`Enter amount to withdraw for ${staff.name} (Max: ${staff.salaryDue})`, staff.salaryDue);
        if(amount && !isNaN(amount) && amount > 0 && amount <= staff.salaryDue) {
            setAllStaff(prev => ({
                ...prev,
                [selectedCategory]: prev[selectedCategory].map(s => s.id === staff.id ? {...s, salaryDue: s.salaryDue - amount, totalEarnings: s.totalEarnings + Number(amount)} : s)
            }));
            setViewingStaffProfile(prev => ({...prev, salaryDue: prev.salaryDue - amount, totalEarnings: prev.totalEarnings + Number(amount)}));
            alert(`Withdrawal of ₹${amount} for ${staff.name} processed.`)
        }
    }

    // --- RENDER LOGIC --- //

    // 3. Staff Profile View
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
                            {staff.activity.length > 0 ? staff.activity.map((act, i) => (
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

    // 2. Staff List View
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

    // 1. Main Category View
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-800">Staff Management</h1>
            <button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg">Add New Staff</button>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
            {staffCategories.map(cat => <StaffCard key={cat.name} {...cat} onClick={() => setSelectedCategory(cat.name)} />)}
        </div>

        {/* Add Staff Modal */}
        {isAddModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"><div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Add New Staff Member</h2>
                <form onSubmit={e => { e.preventDefault(); handleAddStaff(); }}>
                    <div className="space-y-4">
                        <input type="text" placeholder="Full Name" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} className="w-full input" required />
                        <input type="email" placeholder="Email Address" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} className="w-full input" required />
                        <input type="password" placeholder="Password" value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} className="w-full input" required />
                        <select value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value })} className="w-full input bg-white" required>
                            <option value="" disabled>Select a role</option>
                            {staffCategories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4 mt-8">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Add Staff</button>
                    </div>
                </form>
            </div></div>
        )}

        {/* Edit Staff Modal */}
        {isEditModalOpen && editingStaff && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"><div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Edit Password for {editingStaff.name}</h2>
                <form onSubmit={e => { e.preventDefault(); handleUpdatePassword(); }}>
                    <input type="password" placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full input" required />
                    <div className="flex justify-end space-x-4 mt-8">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Update Password</button>
                    </div>
                </form>
            </div></div>
        )}
      </div>
    );
};

export default StaffManagementView;
