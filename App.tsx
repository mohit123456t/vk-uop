import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import BrandPanel from './components/brandpanel/BrandPanel';
import AdminPanel from './components/adminpanel/AdminPanel';
import SuperAdminPanel from './components/superadminpanel/SuperAdminPanel';
import UploaderPanel from './components/uploaderpanel/UploaderPanel';
import ScriptWriterPanel from './components/scriptwriterpanel/ScriptWriterPanel';
import VideoEditorPanel from './components/videoeditorpanel/VideoEditorPanel';
import ThumbnailMakerPanel from './components/thumbnailmakerpanel/ThumbnailMakerPanel';

import PrivateRoute from './components/PrivateRoute';
import RoleBasedPortalLogin from './components/RoleBasedPortalLogin';

const AnimatedBackground = () => (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:radial-gradient(ellipse_at_center,white_25%,transparent_80%)]"></div>
        <div className="absolute top-0 -left-1/4 w-[50rem] h-[50rem] bg-slate-200/20 rounded-full filter blur-3xl opacity-20 animate-aurora"></div>
        <div className="absolute top-0 -right-1/4 w-[50rem] h-[50rem] bg-slate-300/20 rounded-full filter blur-3xl opacity-20 animate-aurora [animation-delay:-15s]"></div>
        <div className="absolute -bottom-1/2 left-1/4 w-[60rem] h-[60rem] bg-slate-200/10 rounded-full filter blur-3xl opacity-20 animate-aurora [animation-delay:-30s]"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-[60rem] h-[60rem] bg-slate-300/10 rounded-full filter blur-3xl opacity-20 animate-aurora [animation-delay:-45s]"></div>
    </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/portal" element={<RoleBasedPortalLogin />} />
          <Route path="/brand" element={<PrivateRoute requiredRole="brand"><BrandPanel /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute requiredRole="admin"><AdminPanel /></PrivateRoute>} />
          <Route path="/super-admin" element={<SuperAdminPanel />} />
          <Route path="/uploader" element={<PrivateRoute requiredRole="uploader"><UploaderPanel /></PrivateRoute>} />
          <Route path="/script-writer" element={<PrivateRoute requiredRole="script_writer"><ScriptWriterPanel /></PrivateRoute>} />
          <Route path="/video-editor" element={<PrivateRoute requiredRole="video_editor"><VideoEditorPanel /></PrivateRoute>} />
          <Route path="/thumbnail-maker" element={<PrivateRoute requiredRole="thumbnail_maker"><ThumbnailMakerPanel /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
