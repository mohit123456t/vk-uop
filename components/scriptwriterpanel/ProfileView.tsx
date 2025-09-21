import React from 'react';

const ProfileView = () => (
    <div className="space-y-8 max-w-4xl mx-auto">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Profile</h1>
            <p className="text-slate-600">Manage your portfolio, skills, and account security.</p>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <h3 className="font-bold text-lg text-slate-800 mb-4">Name</h3>
                <input type="text" defaultValue="Rahul K." className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <h3 className="font-bold text-lg text-slate-800 mb-4">ID Number</h3>
                <input type="text" defaultValue="SWP-00123" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" readOnly />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <h3 className="font-bold text-lg text-slate-800 mb-4">Email</h3>
                <input type="email" defaultValue="rahul.k@example.com" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <h3 className="font-bold text-lg text-slate-800 mb-4">Phone</h3>
                <input type="tel" defaultValue="+91 98765 43210" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <h3 className="font-bold text-lg text-slate-800 mb-4">Settings</h3>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">Notifications</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">Dark Mode</span>
                    </label>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 flex items-end">
                <button type="submit" className="w-full bg-slate-900 text-white py-2 px-4 rounded-md hover:bg-slate-700 transition-colors">Save Changes</button>
            </div>
        </form>
    </div>
);

export default ProfileView;