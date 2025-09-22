import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Loader from './components/Loader';
import RoleBasedPortalLogin from './components/RoleBasedPortalLogin';

// Lazy-loaded components
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const VideoEditorPanel = lazy(() => import('./components/VideoEditorPanel'));
const ScriptWriterPanel = lazy(() => import('./components/ScriptWriterPanel'));
const ThumbnailMakerPanel = lazy(() => import('./components/ThumbnailMakerPanel'));
const UploaderPanel = lazy(() => import('./components/UploaderPanel'));
const BrandPanel = lazy(() => import('./components/BrandPanel'));

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/portal" />} />
          <Route path="/portal" element={<RoleBasedPortalLogin />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/editor" element={<VideoEditorPanel />} />
          <Route path="/scriptwriter" element={<ScriptWriterPanel />} />
          <Route path="/thumbnail" element={<ThumbnailMakerPanel />} />
          <Route path="/uploader" element={<UploaderPanel />} />
          <Route path="/brand" element={<BrandPanel />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
