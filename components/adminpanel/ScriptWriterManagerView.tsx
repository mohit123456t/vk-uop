import React, { useState, useEffect } from 'react';
import { firestore } from '../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface ScriptWriter {
    id: string;
    name: string;
    email: string;
    totalEarnings: number;
    completedTasks: number;
    status: string;
}

const ScriptWriterManagerView = () => {
    const [scriptWriters, setScriptWriters] = useState<ScriptWriter[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWriter, setSelectedWriter] = useState<ScriptWriter | null>(null);

    useEffect(() => {
        const fetchScriptWriters = async () => {
            setLoading(true);
            const querySnapshot = await getDocs(collection(firestore, "users"));
            const writers: ScriptWriter[] = [];
            querySnapshot.forEach((doc) => {
                if (doc.data().role === 'script-writer') {
                    writers.push({ ...doc.data(), id: doc.id } as ScriptWriter);
                }
            });
            setScriptWriters(writers);
            setLoading(false);
        };
        fetchScriptWriters();
    }, []);

    const handleViewProfile = (writer: ScriptWriter) => {
        setSelectedWriter(writer);
    };

    const handleCloseProfile = () => {
        setSelectedWriter(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 w-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-900"></div>
                <p className="text-center mt-4 text-lg font-semibold text-slate-700">Loading script writers...</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Script Writer Manager</h1>
                <p className="text-slate-600">Manage and monitor script writer performance</p>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Earnings</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Completed Tasks</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {scriptWriters.map((writer) => (
                            <tr key={writer.id} className="hover:bg-gray-50">
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{writer.name}</p>
                                     <p className="text-gray-600 whitespace-no-wrap text-xs">{writer.email}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">${writer.totalEarnings.toFixed(2)}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{writer.completedTasks}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <span className={`relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight`}>
                                        <span aria-hidden className={`absolute inset-0 ${writer.status === 'Active' ? 'bg-green-200' : 'bg-red-200'} opacity-50 rounded-full`}></span>
                                        <span className="relative">{writer.status}</span>
                                    </span>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                                    <button onClick={() => handleViewProfile(writer)} className="text-indigo-600 hover:text-indigo-900 font-semibold">View Profile</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedWriter && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Script Writer Profile</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-700">Personal Details</h3>
                                <p className="text-slate-600 mt-2"><strong>Name:</strong> {selectedWriter.name}</p>
                                <p className="text-slate-600"><strong>Email:</strong> {selectedWriter.email}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-700">Work Summary</h3>
                                <p className="text-slate-600 mt-2"><strong>Total Earnings:</strong> ${selectedWriter.totalEarnings.toFixed(2)}</p>
                                <p className="text-slate-600"><strong>Completed Tasks:</strong> {selectedWriter.completedTasks}</p>
                                <p className="text-slate-600"><strong>Status:</strong> <span className={`font-semibold ${selectedWriter.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{selectedWriter.status}</span></p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-slate-700">Recent Activity</h3>
                            <div className="mt-4 border-t border-gray-200 pt-4">
                                <p className="text-slate-500">No recent activity to show.</p>
                            </div>
                        </div>
                        
                        <div className="mt-8 text-right">
                            <button onClick={handleCloseProfile} className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScriptWriterManagerView;