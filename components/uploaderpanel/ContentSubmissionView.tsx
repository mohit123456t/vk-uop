import React, { useState } from 'react';

const ContentSubmissionView = () => {
    const [uploadedFiles, setUploadedFiles] = useState([
        { id: 1, name: 'video1.mp4', size: '25MB', status: 'draft', uploadedAt: '2023-10-01' },
        { id: 2, name: 'thumbnail.jpg', size: '2MB', status: 'submitted', uploadedAt: '2023-10-02' },
    ]);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const newFile = {
                id: Date.now(),
                name: file.name,
                size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                status: 'draft',
                uploadedAt: new Date().toISOString().split('T')[0],
            };
            setUploadedFiles([...uploadedFiles, newFile]);
        }
    };

    const handleDownload = (file) => {
        // Simulate download
        alert(`Downloading ${file.name}`);
    };

    const handleSubmit = (fileId) => {
        setUploadedFiles(uploadedFiles.map(file =>
            file.id === fileId ? { ...file, status: 'submitted' } : file
        ));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Upload Content</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept=".mp4,.jpg,.png,.pdf,.docx"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="text-gray-500 mb-2">
                            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <p className="text-lg font-medium text-gray-900">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">MP4, JPG, PNG, PDF, DOCX up to 100MB</p>
                    </label>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Submitted Content</h2>
                <div className="space-y-4">
                    {uploadedFiles.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                    <p className="text-sm text-gray-500">{file.size} • Uploaded {file.uploadedAt}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    file.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {file.status}
                                </span>
                                <button
                                    onClick={() => handleDownload(file)}
                                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                >
                                    Download
                                </button>
                                {file.status === 'draft' && (
                                    <button
                                        onClick={() => handleSubmit(file.id)}
                                        className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                                    >
                                        Submit
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContentSubmissionView;
