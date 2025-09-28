
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const AddBrandForm = ({ onClose, onUserAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        brandName: '',
        role: 'brand'
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

    return (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Add New Brand</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Brand Name</label>
                    <input type="text" name="brandName" value={formData.brandName} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div className="flex space-x-2">
                    <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        {loading ? 'Adding...' : 'Add Brand'}
                    </button>
                    <button type="button" onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
                </div>
            </form>
        </div>
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
        const brandsData = [];
        querySnapshot.forEach(doc => brandsData.push({ id: doc.id, ...doc.data() }));
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
                <h1 className="text-2xl font-bold text-slate-900">Brand Management</h1>
                <button onClick={() => setShowAddBrandForm(!showAddBrandForm)} className="text-sm font-medium p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700">
                    {showAddBrandForm ? 'Close Form' : 'Add New Brand'}
                </button>
            </div>

            {showAddBrandForm && <AddBrandForm onClose={() => setShowAddBrandForm(false)} onUserAdded={handleUserAdded} />}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Registered Brands</h2>
                </div>
                {loading ? (
                     <div className="p-6 text-center">Loading brands...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Brand Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mobile</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {brands.map(brand => (
                                    <tr key={brand.id}>
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
            </div>
        </div>
    );
};

export default UserManagementView;
