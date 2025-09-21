
import React from 'react';
import { ICONS } from '../../constants';

const thumbnails = [
    { id: 'T001', reel: 'R451', maker: 'Vikas G.', status: 'Pending Approval', ctr: 'N/A' },
    { id: 'T002', reel: 'R452', maker: 'Anita K.', status: 'Approved', ctr: '5.2%' },
];

const ThumbnailMakerControlView = () => (
     <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Thumbnail Maker Control</h1>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
             <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th className="px-6 py-3">Thumbnail ID</th>
                        <th className="px-6 py-3">Reel ID</th>
                        <th className="px-6 py-3">Designer</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Performance (CTR)</th>
                        <th className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {thumbnails.map(t => (
                        <tr key={t.id} className="bg-white border-b hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900">{t.id}</td>
                            <td className="px-6 py-4">{t.reel}</td>
                            <td className="px-6 py-4">{t.maker}</td>
                            <td className="px-6 py-4">{t.status}</td>
                            <td className="px-6 py-4">{t.ctr}</td>
                            <td className="px-6 py-4 flex items-center space-x-2">
                                {t.status === 'Pending Approval' && <>
                                    <button className="text-sm font-medium hover:underline text-slate-600">Preview</button>
                                    <button className="text-green-600 hover:text-green-800">{ICONS.checkCircle}</button>
                                    <button className="text-red-600 hover:text-red-800">{ICONS.xCircle}</button>
                                </>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default ThumbnailMakerControlView;
