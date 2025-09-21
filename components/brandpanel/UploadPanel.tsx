import React, { useState } from 'react';

const UploadPanel = ({ onUpload }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }
        setUploading(true);
        setError(null);
        try {
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            onUpload(file);
            setFile(null);
        } catch (err) {
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow border border-slate-200">
            <h2 className="text-lg font-semibold mb-4">Upload Campaign Asset</h2>
            <input type="file" onChange={handleFileChange} className="mb-4" />
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-700 disabled:opacity-50"
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
};

export default UploadPanel;
