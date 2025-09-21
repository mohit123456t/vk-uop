import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffManagementView from './StaffManagementView';
import ReelsUploadedPage from './ReelsUploadedPage';
import SuperAdminDashboard from './SuperAdminDashboard';
import SuperAdminFinance from './SuperAdminFinance';
import UploaderManagerView from './UploaderManagerView';
import ScriptWriterManagerView from './ScriptWriterManagerView';
import ThumbnailMakerManagerView from './ThumbnailMakerManagerView';
import VideoEditorManagerView from './VideoEditorManagerView';
import { ICONS } from '../../constants';
import { db } from '../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

const superAdminNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: ICONS.layout },
  { id: 'staff_management', label: 'Staff Management', icon: ICONS.usersGroup },
  { id: 'uploader_manager', label: 'Uploader Manager', icon: ICONS.upload },
  { id: 'script_writer_manager', label: 'Script Writer Manager', icon: ICONS.pencilSquare },
  { id: 'thumbnail_maker_manager', label: 'Thumbnail Maker Manager', icon: ICONS.photo },
  { id: 'video_editor_manager', label: 'Video Editor Manager', icon: ICONS.video },
  { id: 'reels_uploaded', label: 'Reels Uploaded', icon: ICONS.upload },
  { id: 'finance', label: 'Finance', icon: ICONS.currencyRupee },
];

const SuperAdminPanel = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [financeData, setFinanceData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let useEffectCallCount = 0;
    let fetchDataCallCount = 0;

    console.log('SuperAdminPanel useEffect started');
    useEffectCallCount++;

    let isMounted = true;

    const fetchDashboardData = async () => {
      console.log('fetchDashboardData called');
      try {
        const querySnapshot = await getDocs(collection(db, 'superAdminDashboard'));
        console.log('Dashboard querySnapshot size:', querySnapshot.size);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          console.log('Dashboard data fetched:', data);
          if (isMounted) setDashboardData(data);
        } else {
          console.warn('Dashboard collection is empty');
          if (isMounted) setDashboardData(null);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (isMounted) setDashboardData(null);
      }
    };

    const fetchFinanceData = async () => {
      console.log('fetchFinanceData called');
      try {
        const querySnapshot = await getDocs(collection(db, 'superAdminFinance'));
        console.log('Finance querySnapshot size:', querySnapshot.size);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          console.log('Finance data fetched:', data);
          if (isMounted) setFinanceData(data);
        } else {
          console.warn('Finance collection is empty');
          if (isMounted) setFinanceData(null);
        }
      } catch (error) {
        console.error('Error fetching finance data:', error);
        if (isMounted) setFinanceData(null);
      }
    };

    const fetchData = async () => {
      fetchDataCallCount++;
      console.log('fetchData called', fetchDataCallCount, 'times');
      try {
        await Promise.all([fetchDashboardData(), fetchFinanceData()]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (isMounted) {
          console.log('Setting isLoading to false');
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Forced fallback to stop loader after 5 seconds
    const forcedTimeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Forced timeout reached, stopping loader');
        setIsLoading(false);
      }
    }, 5000);

    // Timeout fallback to stop loader after 10 seconds
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Data fetch timeout, stopping loader');
        setIsLoading(false);
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      clearTimeout(forcedTimeoutId);
    };
  }, []);

  const renderView = () => {
    // Loader hata diya gaya hai user request par
    if (!dashboardData && !financeData) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-600 text-lg">
          No fetched data - Loader removed as per user request
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <SuperAdminDashboard data={dashboardData} />;
      case 'staff_management':
        return <StaffManagementView />;
      case 'uploader_manager':
        return <UploaderManagerView />;
      case 'script_writer_manager':
        return <ScriptWriterManagerView />;
      case 'thumbnail_maker_manager':
        return <ThumbnailMakerManagerView />;
      case 'video_editor_manager':
        return <VideoEditorManagerView />;
      case 'reels_uploaded':
        return <ReelsUploadedPage />;
      case 'finance':
        return <SuperAdminFinance data={financeData} />;
      default:
        return <SuperAdminDashboard data={dashboardData} />;
    }
  };

  return (
    <div className="flex h-full">
      <aside className="w-64 flex-shrink-0 bg-slate-900 text-slate-300 flex flex-col no-scrollbar">
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {superAdminNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeView === item.id ? 'bg-slate-700/50 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto bg-slate-100 p-8">{renderView()}</main>
    </div>
  );
};

export default SuperAdminPanel;
