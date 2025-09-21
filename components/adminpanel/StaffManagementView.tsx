import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';



const roles = [
  'Video Editor',
  'Script Writer',
  'Thumbnail Maker',
  'Uploader',
  'Campaign Manager',
  'Finance',
  'Admin',
  'Super Admin',
];

const StaffManagementView = () => {
  const [filters, setFilters] = useState({
    role: '',
    search: '',
  });

  // Add new staff form state
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
  });

  // Staff data
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Alerts
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Add a small delay to prevent immediate Firebase calls
    const timer = setTimeout(() => {
      fetchStaff();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setStaff(usersData);

      // Generate alerts for pending onboarding
      const pendingUsers = usersData.filter((user: any) => user.status === 'pending' || !user.status);
      if (pendingUsers.length > 0) {
        setAlerts([{
          type: 'warning',
          message: `${pendingUsers.length} users pending onboarding.`
        }]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      // Map display role to database role
      const roleMapping = {
        'Video Editor': 'video_editor',
        'Script Writer': 'script_writer',
        'Thumbnail Maker': 'thumbnail_maker',
        'Uploader': 'uploader',
        'Campaign Manager': 'admin',
        'Finance': 'admin',
        'Admin': 'admin',
        'Super Admin': 'super_admin'
      };

      const dbRole = roleMapping[newStaff.role] || newStaff.role.toLowerCase().replace(' ', '_');

      const staffData = {
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        password: newStaff.password, // Note: In production, this should be hashed
        role: dbRole,
        status: 'active', // Set as active for super admin
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isActive: true
      };

      await addDoc(collection(db, 'users'), staffData);
      alert(`✅ New ${newStaff.role} account created successfully!\n📧 Email: ${newStaff.email}\n🔑 Password: ${newStaff.password}\n👤 Role: ${dbRole}`);
      setNewStaff({ name: '', email: '', phone: '', password: '', role: '' });
      fetchStaff(); // Refresh the staff list
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('❌ Error adding staff. Please try again.');
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      <section className="bg-white rounded-2xl shadow-xl p-6 mb-4">
        <h1 className="text-2xl font-bold mb-4">Staff Management</h1>
        <div className="flex gap-4 mb-4">
          <input type="text" placeholder="Search by name/email" className="border rounded px-3 py-2" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          <select className="border rounded px-3 py-2" value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}>
            <option value="">All Roles</option>
            {roles.map(role => <option key={role} value={role}>{role}</option>)}
          </select>
        </div>

        {/* Super Admin Creation Section */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-6 border border-purple-200">
          <h2 className="text-xl font-bold mb-4 text-purple-800">🔐 Create Super Admin Account</h2>
          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-sm text-slate-600 mb-3">Create a new Super Admin account with full system access.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="mohitmleena2@gmail.com"
                  className="w-full border rounded px-3 py-2"
                  value={newStaff.email}
                  onChange={e => setNewStaff(s => ({ ...s, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="123456789"
                  className="w-full border rounded px-3 py-2"
                  value={newStaff.password}
                  onChange={e => setNewStaff(s => ({ ...s, password: e.target.value }))}
                />
              </div>
            </div>
            <button
              onClick={() => {
                setNewStaff(s => ({ ...s, name: 'Super Admin', phone: '', role: 'Super Admin' }));
              }}
              className="mt-3 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Set Super Admin Details
            </button>
            <button
              onClick={handleAddStaff}
              className="ml-3 mt-3 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Create Super Admin Account
            </button>
          </div>
        </div>

        {/* Add New Staff Form */}
        <form className="bg-slate-50 rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAddStaff}>
          <h2 className="text-lg font-bold col-span-2 mb-2">Add New Staff</h2>
          <input type="text" required placeholder="Name" className="border rounded px-3 py-2" value={newStaff.name} onChange={e => setNewStaff(s => ({ ...s, name: e.target.value }))} />
          <input type="email" required placeholder="Gmail" className="border rounded px-3 py-2" value={newStaff.email} onChange={e => setNewStaff(s => ({ ...s, email: e.target.value }))} />
          <input type="tel" required placeholder="Phone Number" className="border rounded px-3 py-2" value={newStaff.phone} onChange={e => setNewStaff(s => ({ ...s, phone: e.target.value }))} />
          <input type="password" required placeholder="Set Password" className="border rounded px-3 py-2" value={newStaff.password} onChange={e => setNewStaff(s => ({ ...s, password: e.target.value }))} />
          <select required className="border rounded px-3 py-2" value={newStaff.role} onChange={e => setNewStaff(s => ({ ...s, role: e.target.value }))}>
            <option value="">Select Role</option>
            {roles.map(role => <option key={role} value={role}>{role}</option>)}
          </select>
          <button type="submit" className="col-span-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Add Staff</button>
        </form>
      </section>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="mb-4">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`p-3 rounded mb-2 ${alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
              {alert.message}
            </div>
          ))}
        </section>
      )}

      {/* Staff Table */}
      <section className="bg-white rounded-2xl shadow-xl p-6 mb-4">
        <h2 className="text-xl font-bold mb-4">Team Members</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Status</th>
                <th className="p-2">Joined</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                    </div>
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">No staff found.</td>
                </tr>
              ) : (
                staff.map((member: any) => (
                  <tr key={member.id} className="border-b hover:bg-slate-50">
                    <td className="p-2 font-medium">{member.name || 'N/A'}</td>
                    <td className="p-2">{member.email || 'N/A'}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === 'super_admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {member.role === 'super_admin' ? 'Super Admin' :
                         member.role === 'video_editor' ? 'Video Editor' :
                         member.role === 'script_writer' ? 'Script Writer' :
                         member.role === 'thumbnail_maker' ? 'Thumbnail Maker' :
                         member.role === 'uploader' ? 'Uploader' :
                         member.role === 'admin' ? 'Admin' :
                         member.role || 'N/A'}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : member.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.status || 'inactive'}
                      </span>
                    </td>
                    <td className="p-2">{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-2">
                      <button className="text-blue-600 hover:underline text-xs mr-2">Edit</button>
                      <button className="text-red-600 hover:underline text-xs">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="font-bold mb-4">Role Distribution</h3>
          {/* Pie chart placeholder */}
          <div className="h-48 flex items-center justify-center text-slate-400">Pie chart here</div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="font-bold mb-4">Recent Joins</h3>
          {/* Recent joins placeholder */}
          <div className="h-48 flex items-center justify-center text-slate-400">Recent joins here</div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="font-bold mb-4">Pending Onboarding</h3>
          {/* Pending onboarding placeholder */}
          <div className="h-48 flex items-center justify-center text-slate-400">Pending onboarding here</div>
        </div>
      </section>
    </div>
  );
};

export default StaffManagementView;
