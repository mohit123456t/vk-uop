import React from 'react';
import { ICONS } from '../../constants';

const ProfileView = () => (
    <div className="space-y-8 max-w-4xl mx-auto">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Editor Profile</h1>
            <p className="text-slate-600">Showcase your skills and manage your account.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Editing Specialties</h3>
            <p className="text-sm text-slate-500 mb-3">Highlight your top skills to get matched with the right projects.</p>
            <div className="flex flex-wrap gap-2">
                {['Fast Cuts', 'Cinematic Color Grading', 'Meme Edits', 'Transitions', 'Motion Graphics'].map(niche => (
                    <span key={niche} className="bg-slate-800 text-white text-xs font-medium me-2 px-2.5 py-1 rounded-full">{niche}</span>
                ))}
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Portfolio</h3>
            <p className="text-sm text-slate-500 mb-4">Your best work, automatically highlighted.</p>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                <div className="aspect-[9/16] bg-slate-200 rounded-lg border flex items-center justify-center">
                    <p className="text-xs text-slate-500 p-2 text-center">Viral Reel 1</p>
                </div>
                 <div className="aspect-[9/16] bg-slate-200 rounded-lg border flex items-center justify-center">
                    <p className="text-xs text-slate-500 p-2 text-center">Cinematic Edit</p>
                </div>
                 <div className="aspect-[9/16] bg-slate-200 rounded-lg border flex items-center justify-center">
                    <p className="text-xs text-slate-500 p-2 text-center">High Engagement</p>
                </div>
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
            <h3 className="flex items-center font-bold text-lg text-slate-800 mb-4">{ICONS.lockClosed}<span className="ml-2">Security</span></h3>
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                <label htmlFor="2fa" className="font-medium text-sm">Enable Two-Factor Authentication</label>
                <input type="checkbox" id="2fa" defaultChecked />
            </div>
        </div>
    </div>
);

export default ProfileView;
