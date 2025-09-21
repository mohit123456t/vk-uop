
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface Uploader {
    id: string;
    name: string;
    accounts: number;
    pending: number;
    completed: number;
    failed: number;
    status: string;
}

const UploaderControlView = () => {
    const [uploaders, setUploaders] = useState<Uploader[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'uploaders'), (snapshot) => {
            const uploadersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Uploader));
            setUploaders(uploadersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="text-center py-8">Loading uploaders...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Uploader Control</h1>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">Uploader</th>
                            <th className="px-6 py-3">Linked Accounts</th>
                            <th className="px-6 py-3">Pending</th>
                            <th className="px-6 py-3">Completed</th>
                            <th className="px-6 py-3">Failed / Errors</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {uploaders.map(u => (
                            <tr key={u.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                                <td className="px-6 py-4">{u.accounts}</td>
                                <td className="px-6 py-4">{u.pending}</td>
                                <td className="px-6 py-4">{u.completed}</td>
                                <td className="px-6 py-4 text-red-500 font-medium">{u.failed}</td>
                                <td className="px-6 py-4">{u.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UploaderControlView;
