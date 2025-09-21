import React, { useState } from 'react';
import { ICONS } from '../../constants';

const ReelUploadView = ({ reel, onBack }) => {
    const [uploadType, setUploadType] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleAutoUpload = async () => {
        setIsUploading(true);
        // Simulate auto upload process
        setTimeout(() => {
            alert(`Reel ${reel.id} uploaded automatically to Instagram!`);
            setIsUploading(false);
        }, 2000);
    };

    const handleManualUpload = () => {
        alert(`Opening Instagram for manual upload of Reel ${reel.id}...`);
        // Here you would integrate with Instagram API for manual upload
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center text-slate-600 hover:text-slate-800"
                >
                    <span className="mr-2">←</span>
                    Back to Tasks
                </button>
                <h1 className="text-2xl font-bold text-slate-900">Upload Reel</h1>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Reel ID: {reel.id}</h3>
                        <div className="bg-slate-100 px-3 py-1 rounded-full text-sm text-slate-600 inline-block">
                            Ready for Upload
                        </div>
                    </div>
                    <div className="text-slate-400">{ICONS.video}</div>
                </div>

                {/* Video Preview Placeholder */}
                <div className="bg-slate-100 rounded-lg p-8 text-center mb-6">
                    <div className="w-16 h-16 bg-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🎬</span>
                    </div>
                    <p className="text-slate-600">Video Preview</p>
                    <p className="text-sm text-slate-500 mt-1">Duration: {reel.duration}</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-medium text-slate-700 mb-1">Script Content:</p>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{reel.script}</p>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-slate-700 mb-1">Hashtags:</p>
                        <div className="flex flex-wrap gap-1">
                            {reel.hashtags.map((hashtag, index) => (
                                <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {hashtag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Upload Options</h3>

                {!uploadType ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setUploadType('auto')}
                            className="p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
                        >
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-xl">🚀</span>
                            </div>
                            <h4 className="font-semibold text-green-800 mb-2">Auto Upload</h4>
                            <p className="text-sm text-green-600">Upload automatically to Instagram</p>
                        </button>

                        <button
                            onClick={() => setUploadType('manual')}
                            className="p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-xl">📱</span>
                            </div>
                            <h4 className="font-semibold text-blue-800 mb-2">Manual Upload</h4>
                            <p className="text-sm text-blue-600">Upload manually to Instagram</p>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {uploadType === 'auto' && (
                            <div className="text-center">
                                <h4 className="font-semibold text-green-800 mb-4">Auto Upload Selected</h4>
                                <button
                                    onClick={handleAutoUpload}
                                    disabled={isUploading}
                                    className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {isUploading ? 'Uploading...' : 'Upload Automatically'}
                                </button>
                            </div>
                        )}

                        {uploadType === 'manual' && (
                            <div className="text-center">
                                <h4 className="font-semibold text-blue-800 mb-4">Manual Upload Selected</h4>
                                <button
                                    onClick={handleManualUpload}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Open Instagram
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => setUploadType('')}
                            className="w-full text-slate-600 hover:text-slate-800 text-sm"
                        >
                            ← Change Upload Method
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReelUploadView;
