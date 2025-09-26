import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import BrandPanel from './components/BrandPanel';
import PortalLogin from './components/PortalLogin';
import AdminPanel from './components/AdminPanel';
import SuperAdminPanel from './components/adminpanel/SuperAdminPanel';
import UploaderPanel from './components/UploaderPanel';
import ScriptWriterPanel from './components/ScriptWriterPanel';
import VideoEditorPanel from './components/VideoEditorPanel';

import ThumbnailMakerPanel from './components/ThumbnailMakerPanel';
import InstagramCallback from './components/InstagramCallback';
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
          <Route path="/portal" element={<PortalLogin />} />
          <Route path="/role-login" element={<RoleBasedPortalLogin />} />
          <Route path="/brand" element={<BrandPanel onNavigate={() => {}} />} />
          <Route path="/admin" element={<AdminPanel onNavigate={() => {}} />} />
          <Route path="/super-admin" element={<SuperAdminPanel />} />
          <Route path="/uploader" element={<UploaderPanel onNavigate={() => {}} />} />
          <Route path="/script-writer" element={<ScriptWriterPanel onNavigate={() => {}} />} />
          <Route path="/video-editor" element={<VideoEditorPanel onNavigate={() => {}} />} />
          <Route path="/thumbnail-maker" element={<ThumbnailMakerPanel onNavigate={() => {}} />} />
          <Route path="/instagram-callback" element={<InstagramCallback />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
