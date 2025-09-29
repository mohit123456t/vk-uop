# Video Editor Panel Fixes

## Previous Profile Loading Fix
- [x] Update authService.ts to include proper isLoading state during profile fetch
- [x] Update ProfileView.tsx to use full authState and show loading only during fetch or unauthenticated state
BT 
## Current Task: Sidebar Text Colors and Loading Timeout (0.3s max)
- [x] Update VideoEditorPanel.tsx: Change active nav item ('Assigned Tasks') text to consistent dark color (text-slate-800)
- [x] Update AssignedTasks.tsx: Change 'View Tasks' button to dark text on light background (text-slate-800, bg-slate-100 hover:bg-slate-200)
- [x] Update AssignedTasks.tsx: Implement 300ms loading timeout using getDocs with Promise.race; show "Loading slowly..." if timeout, keep onSnapshot for updates without re-loading
- [x] Update ProfileView.tsx: Add optional 100ms minimum delay to loading display for smoothness (if auth <100ms)
- [x] Relaunch dev server if needed (`npm run dev`) - Already running as per user
- [x] Test: Login as video editor, navigate to Assigned Tasks (verify button text, loading <0.3s, data shows), Profile (quick load, data displays)
- [x] If needed: Create test video editor user and sample campaign in Firestore for assignedEditor matching UID
