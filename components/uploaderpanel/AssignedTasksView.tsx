import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';
import ReelUploadView from './ReelUploadView';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import authService from '../../services/authService';

const AssignedTaskCard = ({ reel, onClick }) => {
    return (
        <div
            onClick={() => onClick(reel)}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Reel ID: {reel.id}</h3>
                    <p className="text-sm text-slate-600">Duration: {reel.duration}</p>
                </div>
                <div className="text-slate-400">{ICONS.video}</div>
            </div>

            <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Upload Reel
                </button>
                <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    Preview
                </button>
            </div>
        </div>
    );
};

const AssignedTasksView = () => {
    const [selectedReel, setSelectedReel] = useState(null);
    const [assignedReels, setAssignedReels] = useState([]);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((state) => {
            if (state.isAuthenticated && state.userProfile) {
                setUserProfile(state.userProfile);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!userProfile) return;

        const fetchTasks = async () => {
            try {
                const tasksRef = collection(db, 'uploader_tasks');
                const q = query(tasksRef, where('assignedTo', '==', userProfile.email), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const fetchedTasks = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAssignedReels(fetchedTasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };

        fetchTasks();
    }, [userProfile]);

    const handleReelClick = (reel) => {
        setSelectedReel(reel);
    };

    const handleBack = () => {
        setSelectedReel(null);
    };

    if (selectedReel) {
        return <ReelUploadView reel={selectedReel} onBack={handleBack} />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Assigned Tasks</h1>
                <p className="text-slate-600">Click on any reel to upload to Instagram</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {assignedReels.map(reel => (
                    <AssignedTaskCard
                        key={reel.id}
                        reel={reel}
                        onClick={handleReelClick}
                    />
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="text-blue-600">{ICONS.bell}</div>
                    <div>
                        <h3 className="font-medium text-blue-900 mb-1">Upload Instructions</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Click on any reel to open upload options</li>
                            <li>• Choose between Auto Upload or Manual Upload</li>
                            <li>• Auto Upload will post directly to Instagram</li>
                            <li>• Manual Upload opens Instagram for manual posting</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignedTasksView;
