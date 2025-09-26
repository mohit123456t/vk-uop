import React, { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";

interface Uploader {
    id: string;
    name: string;
    email: string;
    totalEarnings: number;
    completedTasks: number;
    status: string;
}

const UploaderManagerView = () => {
    const [uploaders, setUploaders] = useState<Uploader[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUploader, setSelectedUploader] = useState<Uploader | null>(null);

    useEffect(() => {
        const fetchUploaders = async () => {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "users"));
            const uploaderList: Uploader[] = [];
            querySnapshot.forEach((doc) => {
                if (doc.data().role === 'uploader') {
                    uploaderList.push({ ...doc.data(), id: doc.id } as Uploader);
                }
            });
            setUploaders(uploaderList);
            setLoading(false);
        };
        fetchUploaders();
    }, []);

    const handleViewProfile = (uploader: Uploader) => {
        setSelectedUploader(uploader);
    };

    const handleCloseProfile = () => {
        setSelectedUploader(null);
    };

    if (loading) {
        return <div className="text-center py-10">Loading Uploaders...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Uploader Management</h1>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                            <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                            <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Earnings</th>
                            <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Completed Tasks</th>
                            <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-100"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {uploaders.map(uploader => (
                            <tr key={uploader.id}>
                                <td className="px-5 py-5 border-b border-slate-200 bg-white text-sm">
                                    <p className="text-slate-900 whitespace-no-wrap">{uploader.name}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-slate-200 bg-white text-sm">
                                    <p className="text-slate-900 whitespace-no-wrap">{uploader.email}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-slate-200 bg-white text-sm">
                                    <p className="text-slate-900 whitespace-no-wrap">₹{uploader.totalEarnings.toFixed(2)}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-slate-200 bg-white text-sm">
                                    <p className="text-slate-900 whitespace-no-wrap">{uploader.completedTasks}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-slate-200 bg-white text-sm">
                                    <span className={`relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight`}>
                                        <span aria-hidden className={`absolute inset-0 ${uploader.status === 'Active' ? 'bg-green-200' : 'bg-red-200'} opacity-50 rounded-full`}></span>
                                        <span className="relative">{uploader.status}</span>
                                    </span>
                                </td>
                                <td className="px-5 py-5 border-b border-slate-200 bg-white text-sm text-right">
                                    <button onClick={() => handleViewProfile(uploader)} className="text-indigo-600 hover:text-indigo-900">View Profile</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedUploader && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">{selectedUploader.name}'s Profile</h2>
                        <div className="space-y-3">
                            <p><span className="font-semibold">Email:</span> {selectedUploader.email}</p>
                            <p><span className="font-semibold">Total Earnings:</span> ₹{selectedUploader.totalEarnings.toFixed(2)}</p>
                            <p><span className="font-semibold">Completed Tasks:</span> {selectedUploader.completedTasks}</p>
                            <p><span className="font-semibold">Status:</span> {selectedUploader.status}</p>
                        </div>
                        <button onClick={handleCloseProfile} className="mt-6 w-full bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-900 transition-colors">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploaderManagerView;
