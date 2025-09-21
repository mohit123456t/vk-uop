import React from 'react';
import { ICONS } from '../../constants';

const CollaborationView = () => (
    <div className="flex h-[80vh] bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="w-1/3 border-r">
            <div className="p-4 border-b">
                <h3 className="font-bold text-slate-800">Team Chat</h3>
            </div>
            <div className="p-2 space-y-1">
                <div className="p-2 rounded-lg bg-slate-100">
                    <p className="font-semibold text-sm">Priya M. (Video Editor)</p>
                    <p className="text-xs text-slate-500 truncate">Okay, I've received the script for S027...</p>
                </div>
                <div className="p-2 rounded-lg hover:bg-slate-100">
                    <p className="font-semibold text-sm">Admin</p>
                    <p className="text-xs text-slate-500 truncate">Quick check-in on the 'Summer Glow'...</p>
                </div>
                 <div className="p-2 rounded-lg hover:bg-slate-100">
                    <p className="font-semibold text-sm">#summer-glow-campaign</p>
                    <p className="text-xs text-slate-500 truncate">Rahul: Hey team, what's the vibe...</p>
                </div>
            </div>
        </div>
        <div className="w-2/3 flex flex-col">
            <div className="p-4 border-b flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <h3 className="font-bold text-slate-800">Priya M. (Video Editor)</h3>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50">
                 <div className="flex justify-start">
                    <div className="bg-slate-200 rounded-lg p-3 max-w-md">
                        <p className="text-sm">Hey Rahul, just got the approved script for S027. Looks great! Do you have any visual references for the 'splash shot'?</p>
                    </div>
                 </div>
                 <div className="flex justify-end">
                    <div className="bg-slate-800 text-white rounded-lg p-3 max-w-md">
                        <p className="text-sm">Awesome! Yeah, I've attached some links in the task manager. Let me know if you need anything else.</p>
                    </div>
                 </div>
            </div>
            <div className="p-4 border-t bg-white">
                <input type="text" placeholder="Type your message..." className="w-full p-2 border rounded-md" />
            </div>
        </div>
    </div>
);

export default CollaborationView;