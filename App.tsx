
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';
import PrivateRoute from './components/PrivateRoute';
import Loader from './components/Loader';

// Lazy load the components
const LandingPage = lazy(() => import('./components/LandingPage'));
const RoleBasedPortalLogin = lazy(() => import('./components/RoleBasedPortalLogin'));
const InstagramCallback = lazy(() => import('./components/InstagramCallback'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./components/TermsOfUse'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const BrandPanel = lazy(() => import('./components/BrandPanel'));
const ThumbnailMakerPanel = lazy(() => import('./components/ThumbnailMakerPanel'));
const ScriptWriterPanel = lazy(() => import('./components/ScriptWriterPanel'));
const VideoEditorPanel = lazy(() => import('./components/VideoEditorPanel'));
const UploaderPanel = lazy(() => import('./components/UploaderPanel'));

const App: React.FC = () => {
    const { isAuthenticated, userProfile, isLoading } = authService.state;

    if (isLoading) {
        return <Loader />;
    }

    return (
        <Router>
            <Suspense fallback={<Loader />}>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<RoleBasedPortalLogin />} />
                    <Route path="/instagram-callback" element={<InstagramCallback />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-use" element={<TermsOfUse />} />

                    {/* Private Routes */}
                    <Route 
                        path="/portal" 
                        element={
                            <PrivateRoute>
                                {userProfile ? (
                                    userProfile.role === 'admin' ? <Navigate to="/admin" /> :
                                    userProfile.role === 'brand' ? <Navigate to="/brand" /> :
                                    userProfile.role === 'thumbnail_maker' ? <Navigate to="/thumbnail" /> :
                                    userProfile.role === 'script_writer' ? <Navigate to="/scriptwriter" /> :
                                    userProfile.role === 'video_editor' ? <Navigate to="/videoeditor" /> :
                                    userProfile.role === 'uploader' ? <Navigate to="/uploader" /> :
                                    <Navigate to="/login" />
                                ) : (
                                    <Navigate to="/login" />
                                )}
                            </PrivateRoute>
                        }
                    />

                    <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
                    <Route path="/brand" element={<PrivateRoute><BrandPanel /></PrivateRoute>} />
                    <Route path="/thumbnail" element={<PrivateRoute><ThumbnailMakerPanel /></PrivateRoute>} />
                    <Route path="/scriptwriter" element={<PrivateRoute><ScriptWriterPanel /></PrivateRoute>} />
                    <Route path="/videoeditor" element={<PrivateRoute><VideoEditorPanel /></PrivateRoute>} />
                    <Route path="/uploader" element={<PrivateRoute><UploaderPanel /></PrivateRoute>} />

                    {/* Fallback Redirect */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Suspense>
        </Router>
    );
};

export default App;
