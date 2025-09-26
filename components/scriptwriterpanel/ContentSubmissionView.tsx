import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ICONS } from '../../constants';

const ContentSubmissionView = ({ userProfile }) => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [scriptUID, setScriptUID] = useState('');

    // Generate 4-digit script UID
    const generateScriptUID = () => {
        const uid = Math.floor(1000 + Math.random() * 9000).toString();
        setScriptUID(uid);
        return uid;
    };

    useEffect(() => {
        if (userProfile?.email) {
            fetchSubmissions();
        }
    }, [userProfile]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const submissionsQuery = query(
                collection(db, 'script_submissions'),
                where('submittedBy', '==', userProfile.email),
                orderBy('submittedAt', 'desc')
            );
            const submissionsSnapshot = await getDocs(submissionsQuery);
            const submissionsData = submissionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUploadedFiles(submissionsData);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setUploadedFiles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file && userProfile?.email) {
            setUploading(true);
            try {
                const uid = generateScriptUID();
                const fileData = {
                    name: file.name,
                    size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                    status: 'draft',
                    submittedAt: new Date().toISOString(),
                    submittedBy: userProfile.email,
                    scriptUID: uid,
                    fileType: file.type,
                    downloadUrl: '#', // In real app, upload to Firebase Storage
                };

                const docRef = await addDoc(collection(db, 'script_submissions'), fileData);
                setUploadedFiles(prev => [{ id: docRef.id, ...fileData }, ...prev]);
                setSelectedFile(null);
            } catch (error) {
                console.error('Error uploading file:', error);
                alert('Error uploading file. Please try again.');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleDownload = (file) => {
        // In real app, download from Firebase Storage
        alert(`Downloading ${file.name} (Script UID: ${file.scriptUID})`);
    };

    const handleSubmit = async (fileId) => {
        try {
            const fileRef = doc(db, 'script_submissions', fileId);
            await updateDoc(fileRef, {
                status: 'submitted',
                submittedAt: new Date().toISOString()
            });

            setUploadedFiles(uploadedFiles.map(file =>
                file.id === fileId ? { ...file, status: 'submitted' } : file
            ));
        } catch (error) {
            console.error('Error submitting file:', error);
            alert('Error submitting file. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                <span className="ml-3 text-lg text-slate-600">Loading submissions...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-slate-200/80 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">Upload Script Content</h2>
                        <p className="text-sm text-slate-600">Upload your script files with unique tracking IDs</p>
                    </div>
                    {scriptUID && (
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            Script UID: {scriptUID}
                        </div>
                    )}
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept=".docx,.pdf,.txt,.rtf"
                        disabled={uploading}
                    />
                    <label htmlFor="file-upload" className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
                        <div className="text-slate-500 mb-4">
                            {uploading ? (
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
                            ) : (
                                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <p className="text-lg font-medium text-slate-900 mb-1">
                            {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-slate-500">DOCX, PDF, TXT, RTF up to 50MB</p>
                        <p className="text-xs text-slate-400 mt-2">Each upload gets a unique 4-digit Script UID</p>
                    </label>
                </div>
            </div>

            {/* Submissions List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">My Script Submissions</h2>
                    <div className="text-sm text-slate-500">
                        {uploadedFiles.length} submission{uploadedFiles.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {uploadedFiles.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-slate-400 mb-4">
                            <span className="text-4xl">📝</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No submissions yet</h3>
                        <p className="text-slate-600">Upload your first script to get started</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {uploadedFiles.map(file => (
                            <div key={file.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                                            <svg className="h-5 w-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <p className="text-sm font-semibold text-slate-900">{file.name}</p>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                                #{file.scriptUID}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                                            <span>{file.size}</span>
                                            <span>•</span>
                                            <span>Uploaded {new Date(file.submittedAt).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>By: {userProfile?.name || 'You'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                        file.status === 'submitted'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {file.status === 'submitted' ? '✓ Submitted' : '⏳ Draft'}
                                    </span>
                                    <button
                                        onClick={() => handleDownload(file)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                        title="Download file"
                                    >
                                        {ICONS.download}
                                    </button>
                                    {file.status === 'draft' && (
                                        <button
                                            onClick={() => handleSubmit(file.id)}
                                            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
                                        >
                                            Submit Script
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentSubmissionView;
