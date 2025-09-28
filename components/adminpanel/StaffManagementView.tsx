import React, { useState, useEffect } from 'react';
import { db, auth } from '../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ICONS } from '../../constants';
import authService from '../../services/authService';

// 🧩 StaffCard Component — White Theme with Colored Accents
const StaffCard = ({ name, count, icon, onClick, gradient }) => (
  <div
    onClick={onClick}
    className="cursor-pointer block p-6 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transform transition-all duration-300 min-w-[260px] max-w-[350px] flex-1 m-4"
  >
    <div className="flex justify-between items-start">
      <div className="flex flex-col">
        <p className="text-xl font-bold text-slate-900">{name}</p>
        <p className="text-sm text-slate-600">{count} members</p>
      </div>
      {React.isValidElement(icon) && (
        <div className={`p-3 rounded-full ${gradient.replace('text-white', 'text-white')}`}>
          {React.cloneElement(icon, { className: 'h-8 w-8' })}
        </div>
      )}
    </div>
  </div>
);

// 🖥️ Main Staff Management View — WHITE GOD MODE ACTIVATED
const StaffManagementView = () => {
  const [allStaff, setAllStaff] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewingStaffProfile, setViewingStaffProfile] = useState(null);
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

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const userQuerySnapshot = await getDocs(collection(db, "users"));
      const brandQuerySnapshot = await getDocs(collection(db, "brands"));
      const staffData = {};
      staffCategoriesList.forEach(cat => staffData[cat.name] = []);

      // Process users (for non-brand roles)
      userQuerySnapshot.forEach((userDoc) => {
        const userData = userDoc.data() as any;
        const user = { ...userData, id: userDoc.id };
        if (user.role && user.role === 'brand') return; // Brands handled separately
        const category = staffCategoriesList.find(c => c.role === user.role);
        if (category) {
          staffData[category.name].push(user);
        }
      });

      // Process brands
      brandQuerySnapshot.forEach((brandDoc) => {
        const brandData = brandDoc.data() as any;
        const brand = {
          ...brandData,
          id: brandDoc.id,
          role: 'brand',
          email: brandData.email || '',
          isActive: true
        };
        const category = staffCategoriesList.find(c => c.role === 'brand');
        if (category) {
          staffData[category.name].push(brand);
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

  const staffCategories = staffCategoriesList.map(category => ({
    name: category.name,
    count: allStaff[category.name]?.length || 0,
    icon: category.icon,
    gradient: category.gradient
  }));

  const handleAddStaff = async () => {
    if (!newStaff.role) { alert('Please select a role'); return; }

    try {
      const existingUser = await authService.findUserByEmail(newStaff.email);
      if (existingUser) {
        if (window.confirm('This user already exists. Do you want to update their role and activate them?')) {
          await authService.updateUserProfile(existingUser.uid, { isActive: true, role: newStaff.role, name: newStaff.name });
          alert('Staff member updated and activated.');
        } else return;
      } else {
        if (!newStaff.password || newStaff.password.length < 6) {
          alert('Password must be at least 6 characters long.'); return;
        }
        await authService.signUpWithRole(newStaff.name, newStaff.email, newStaff.password, newStaff.role);
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
    if (window.confirm(`Are you sure you want to ${action} this staff member?`)) {
      try {
        await authService.updateUserProfile(staff.id, { isActive: makeActive });
        await fetchStaff();
        if (viewingStaffProfile && viewingStaffProfile.id === staff.id) {
          setViewingStaffProfile(prev => ({ ...prev, isActive: makeActive }));
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
      </div>
    );

  // 👇 Category Detail View (Table)
  if (selectedCategory) {
    const staffList = allStaff[selectedCategory] || [];
    return (
      <div className="p-8 bg-slate-50 min-h-screen">
        <button
          onClick={() => setSelectedCategory(null)}
          className="mb-8 flex items-center bg-white text-slate-700 px-5 py-2.5 rounded-lg font-medium hover:bg-slate-100 shadow-sm border border-slate-200 transition"
        >
          <span className="mr-2">{ICONS.arrowLeft}</span> Back to Categories
        </button>
        <h1 className="text-3xl font-bold text-slate-900 mb-6">{selectedCategory}</h1>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-4 text-sm font-semibold text-slate-600 uppercase">Name</th>
                  <th className="p-4 text-sm font-semibold text-slate-600 uppercase">Email</th>
                  <th className="p-4 text-sm font-semibold text-slate-600 uppercase">Status</th>
                  <th className="p-4 text-sm font-semibold text-slate-600 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map(staff => (
                  <tr key={staff.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{staff.name}</td>
                    <td className="p-4 text-slate-600">{staff.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        staff.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {staff.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleResetPassword(staff.email)}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleDeactivateReactivateStaff(staff, !staff.isActive)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                          staff.isActive
                            ? 'text-red-600 bg-red-50 hover:bg-red-100'
                            : 'text-green-600 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        {staff.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {staffList.length === 0 && (
              <p className="text-center p-12 text-slate-500">No staff members in this category yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 👇 Main View (Cards Grid)
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-600 mt-1">Manage all staff members and their roles.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105"
        >
          <span className="mr-2">{ICONS.plus}</span> Add New Staff
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffCategories.map(cat => (
          <StaffCard key={cat.name} {...cat} onClick={() => setSelectedCategory(cat.name)} />
        ))}
      </div>

      {/* ➕ Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg transform transition-all animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Add New Staff Member</h2>
            <form onSubmit={e => { e.preventDefault(); handleAddStaff(); }} className="space-y-5">
              <input
                type="text"
                placeholder="Full Name"
                value={newStaff.name}
                onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newStaff.email}
                onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              <input
                type="password"
                placeholder="New Password (min. 6 chars)"
                value={newStaff.password}
                onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <select
                value={newStaff.role}
                onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                className="w-full p-4 border border-slate-200 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="" disabled>Select a role for the staff member</option>
                {staffCategoriesList.map(cat => (
                  <option key={cat.role} value={cat.role}>{cat.name}</option>
                ))}
              </select>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-200 text-slate-800 rounded-lg font-medium hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  Add Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementView;