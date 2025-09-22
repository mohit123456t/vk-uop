import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Loader from './components/Loader';

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
    return (
        <Router>
            <Suspense fallback={<Loader />}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<RoleBasedPortalLogin />} />
                    <Route path="/instagram-callback" element={<InstagramCallback />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-use" element={<TermsOfUse />} />

                    {/* The /portal route now correctly points to the login component,
                        which will handle the redirection logic itself. */}
                    <Route path="/portal" element={<RoleBasedPortalLogin />} />

                    {/* Private Role-Based Routes */}
                    <Route path="/admin" element={<PrivateRoute requiredRole="admin"><AdminPanel /></PrivateRoute>} />
                    <Route path="/brand" element={<PrivateRoute requiredRole="brand"><BrandPanel /></PrivateRoute>} />
                    <Route path="/thumbnail" element={<PrivateRoute requiredRole="thumbnail-maker"><ThumbnailMakerPanel /></PrivateRoute>} />
                    <Route path="/scriptwriter" element={<PrivateRoute requiredRole="script-writer"><ScriptWriterPanel /></PrivateRoute>} />
                    <Route path="/videoeditor" element={<PrivateRoute requiredRole="video-editor"><VideoEditorPanel /></PrivateRoute>} />
                    <Route path="/uploader" element={<PrivateRoute requiredRole="uploader"><UploaderPanel /></PrivateRoute>} />

                    {/* Fallback Redirect */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Suspense>
        </Router>
    );
};

export default App;
