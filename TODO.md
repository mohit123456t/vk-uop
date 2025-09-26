# Campaign Approval & Assignment Workflow Implementation

## Overview
Implement multi-stage workflow: Brand creates campaign (status: 'Pending Approval') → Admin approves in CampaignManagerView and assigns to roles (scriptwriter → editor → thumbnail maker → uploader) with currentStage → Each role panel shows only assigned tasks for their stage → On completion (uploader uploads), status='Live', brand sees it. Real-time via onSnapshot. Brands list added to StaffManagementView.

## Steps
- [x] Add 'Brands' category to StaffManagementView.tsx: Show brands from 'brands' collection in user management.
- [ ] Fix TS errors in StaffManagementView.tsx: ICONS.briefcase → existing icon; handle missing props for brands (email, isActive); skip reset password for brands; exclude extra props in StaffCard spread.
- [ ] Update NewCampaignForm.tsx / BrandPanel: Set initial status='Pending Approval', currentStage='pending_approval'.
- [ ] components/adminpanel/CampaignManagerView.tsx: For pending campaigns, add "Approve & Assign" button. On click: Update doc status='Active', currentStage='scripting', assign first available scriptwriter (query 'users' where role='scriptwriter', isActive=true, pick random/first). Use updateDoc(doc(db, 'campaigns', id), { ... }).
- [ ] Role panels filtering:
  - [ ] components/ScriptWriterPanel.tsx / AssignedTasksView: Filter campaigns where assignedScriptWriter === currentUser.uid && currentStage === 'scripting'.
  - [ ] components/VideoEditorPanel.tsx / AssignedTasks: Filter where assignedEditor === uid && currentStage === 'editing'.
  - [ ] components/ThumbnailMakerPanel.tsx: Filter assignedThumbnailMaker === uid && 'thumbnailing'.
  - [ ] components/UploaderPanel.tsx / AssignedTasksView: Filter assignedUploader === uid && 'uploading'.
- [ ] Completion logic: In each role panel, add "Complete Task" button → Update currentStage to next (scripting→editing→thumbnailing→uploading→live), status='Live' on final.
- [ ] BrandPanel/DashboardView: Filter campaigns by brandId, show pending/live based on status.
- [ ] Admin DashboardView: Count by stage (pending_approval, scripting, etc.).
- [ ] SuperAdminPanel: Update computations for stages/assignments.
- [ ] Test: Create campaign as brand → Approve/assign as admin → Verify sequential task visibility in role panels → Complete stages → Brand sees live.

Followup: After edits, use browser_action to test flow (login as different roles, create/approve/complete). Install any missing firebase methods if needed (e.g., sendPasswordResetEmail).
