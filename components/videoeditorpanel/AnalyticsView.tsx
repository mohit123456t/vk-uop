
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ICONS } from '../../constants';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore as db } from '../../services/firebase';
import authService from '../../services/authService';

const AnalyticsView = () => {
    const [performanceData, setPerformanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((authState) => {
            if (authState.isAuthenticated && authState.userProfile) {
                fetchAnalyticsData(authState.userProfile.email);
            } else {
                setLoading(false);
                setError('User not authenticated.');
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchAnalyticsData = async (userEmail) => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'video_edit_tasks'), 
                where('assignedTo', '==', userEmail),
                where('status', '==', 'Approved')
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => {
                const taskData = doc.data();
                // Assuming performance data is stored within the task document
                return {
                    name: taskData.reelId || doc.id,
                    views: taskData.performance?.views || 0,
                    engagement: taskData.performance?.engagement || 0,
                };
            });
            setPerformanceData(data);
        } catch (err) {
            console.error("Error fetching analytics data: ", err);
            setError('Failed to fetch analytics data.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-10">Loading analytics...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    const topPerformingReel = [...performanceData].sort((a, b) => b.views - a.views)[0];

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Performance Analytics</h1>
                <p className="text-slate-600">See how your approved reels are performing.</p>
            </div>

            {performanceData.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
                    <ICONS.chart className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Analytics Data</h3>
                    <p className="text-slate-600">Performance data will appear here once your edited videos are approved.</p>
                </div>
            ) : (
                <>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Edited Reels Performance</h3>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis yAxisId="left" label={{ value: 'Views', angle: -90, position: 'insideLeft' }} />
                                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Engagement (%)', angle: -90, position: 'insideRight' }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="views" stroke="#4f46e5" strokeWidth={2} name="Total Views" />
                                    <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#64748b" strokeWidth={2} name="Engagement Rate" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    {topPerformingReel && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                            <h3 className="font-bold text-lg mb-4 text-slate-800">🏆 Top Performing Reel</h3>
                             <div className="flex items-center space-x-6">
                                <div className="w-24 aspect-[9/16] rounded-md border bg-slate-200 flex items-center justify-center">
                                    <p className="text-xs text-slate-500">{topPerformingReel.name}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">Reel ID: {topPerformingReel.name}</p>
                                    <div className="flex space-x-4 mt-2 text-sm">
                                        <p><strong>Views:</strong> {(topPerformingReel.views / 1000).toFixed(1)}k</p>
                                        <p><strong>Engagement:</strong> {topPerformingReel.engagement}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AnalyticsView;
