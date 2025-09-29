import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import authService, { UserProfile } from '../../services/authService';
import { ICONS } from '../../constants';

interface StaffStats {
    assigned: number;
    pending: number;
    completed: number;
}

interface EnrichedStaffProfile extends UserProfile {
    stats: StaffStats;
}

const ThumbnailMakerManagerView = () => {
    const [thumbnailMakers, setThumbnailMakers] = useState<EnrichedStaffProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const role = 'thumbnail_maker';
    const taskCollectionName = 'thumbnail_tasks';

    const fetchStaffData = useCallback(async () => {
        setLoading(true);
        try {
            const staffList = await authService.getUsersByRole(role);
            
            const enrichedStaff = await Promise.all(staffList.map(async (staff) => {
                const tasksQuery = query(collection(db, taskCollectionName), where(role, '==', staff.email));
                const tasksSnapshot = await getDocs(tasksQuery);
                
                const stats: StaffStats = {
                    assigned: tasksSnapshot.docs.length,
                    pending: tasksSnapshot.docs.filter(doc => ['Assigned', 'In Progress', 'Revision'].includes(doc.data().status)).length,
                    completed: tasksSnapshot.docs.filter(doc => doc.data().status === 'Completed' || doc.data().status === 'Approved').length,
                };

                return { ...staff, stats };
            }));

            setThumbnailMakers(enrichedStaff);
        } catch (error) {
            console.error(`Failed to fetch ${role}s or their stats:`, error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStaffData();
        
        const unsubscribe = onSnapshot(collection(db, taskCollectionName), () => {
            fetchStaffData();
        });

        return () => unsubscribe();

    }, [fetchStaffData]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 w-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-900"></div>
                <p className="text-center mt-4 text-lg font-semibold text-slate-700">Loading Thumbnail Makers...</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Thumbnail Maker Management</h1>
                <p className="text-slate-600">Manage and monitor thumbnail maker performance and assignments</p>
            </div>

            {thumbnailMakers.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
                    <div className="text-slate-400 mb-4">{ICONS.users}</div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Thumbnail Makers Found</h3>
                    <p className="text-slate-500">Add thumbnail makers to start managing their activities.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {thumbnailMakers.map(maker => (
                        <div key={maker.uid} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                               <div className="flex items-center">
                                     <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-purple-600 font-semibold text-sm">{maker.name?.charAt(0)?.toUpperCase() || 'T'}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{maker.name || 'Unnamed Maker'}</h3>
                                        <p className="text-sm text-slate-500">ID: {maker.uid.slice(-6)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-slate-800">{maker.stats.assigned}</div>
                                    <div className="text-xs text-slate-500">Assigned</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-yellow-600">{maker.stats.pending}</div>
                                    <div className="text-xs text-slate-500">Pending</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{maker.stats.completed}</div>
                                    <div className="text-xs text-slate-500">Completed</div>
                                </div>
                            </div>
                             <div className="mt-4 flex space-x-2">
                                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">View Details</button>
                                <button className="flex-1 bg-green-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors">Assign Task</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThumbnailMakerManagerView;
