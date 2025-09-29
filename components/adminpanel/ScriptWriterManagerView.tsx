import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import authService, { UserProfile } from '../../services/authService';
import { ICONS } from '../../constants';
import { motion } from 'framer-motion';

interface StaffStats {
    assigned: number;
    pending: number;
    completed: number;
}

interface EnrichedStaffProfile extends UserProfile {
    stats: StaffStats;
}

const ScriptWriterManagerView = () => {
    const [scriptWriters, setScriptWriters] = useState<EnrichedStaffProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const role = 'script_writer';

    const fetchStaffData = useCallback(async () => {
        setLoading(true);
        try {
            const staffList = await authService.getUsersByRole(role);
            
            const enrichedStaff = await Promise.all(staffList.map(async (staff) => {
                // CORRECTED: Querying 'campaigns' collection with the correct field 'assignedScriptWriter'
                const tasksQuery = query(collection(db, 'campaigns'), where('assignedScriptWriter', '==', staff.uid));
                const tasksSnapshot = await getDocs(tasksQuery);
                
                const totalAssigned = tasksSnapshot.docs.length;
                const completedTasks = tasksSnapshot.docs.filter(doc => doc.data().status === 'Completed').length;

                const stats: StaffStats = {
                    assigned: totalAssigned,
                    pending: totalAssigned - completedTasks,
                    completed: completedTasks,
                };

                return { ...staff, stats };
            }));

            setScriptWriters(enrichedStaff);
        } catch (error) {
            console.error(`Failed to fetch ${role}s or their stats:`, error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStaffData();
        // CORRECTED: Real-time listener on the 'campaigns' collection
        const unsubscribe = onSnapshot(collection(db, 'campaigns'), () => {
            fetchStaffData();
        });
        return () => unsubscribe();
    }, [fetchStaffData]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 w-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
                <p className="text-center mt-4 font-semibold text-slate-700">Loading Script Writers...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Script Writer Management</h1>
                <p className="text-slate-500 mt-1">Manage and monitor script writer performance and assignments</p>
            </div>

            {scriptWriters.length === 0 ? (
                <motion.div 
                    className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-12 text-center"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                     <div className="text-slate-400 mb-4 text-4xl mx-auto w-fit">{ICONS.users}</div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Script Writers Found</h3>
                    <p className="text-slate-500">Add script writers to start managing their activities.</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scriptWriters.map((writer, index) => (
                        <motion.div 
                            key={writer.uid} 
                            className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6 hover:shadow-xl transition-shadow"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                               <div className="flex items-center">
                                     <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mr-3 border-2 border-white">
                                        <span className="text-sky-600 font-semibold text-sm">{writer.name?.charAt(0)?.toUpperCase() || 'S'}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{writer.name || 'Unnamed Writer'}</h3>
                                        <p className="text-sm text-slate-500">ID: {writer.uid.slice(-6)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6 text-center bg-white/30 p-3 rounded-lg">
                                <div>
                                    <div className="text-2xl font-bold text-slate-800">{writer.stats.assigned}</div>
                                    <div className="text-xs text-slate-500 uppercase font-semibold">Assigned</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-yellow-600">{writer.stats.pending}</div>
                                    <div className="text-xs text-slate-500 uppercase font-semibold">Pending</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{writer.stats.completed}</div>
                                    <div className="text-xs text-slate-500 uppercase font-semibold">Completed</div>
                                </div>
                            </div>
                             <div className="flex space-x-3">
                                <button className="flex-1 px-4 py-2.5 bg-slate-500/10 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-500/20 transition-colors">View Details</button>
                                <button className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">Assign Task</button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default ScriptWriterManagerView;
