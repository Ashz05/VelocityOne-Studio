// ACL-ADLC Markdown Studio Mobile PWA Controller

// 1. Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker active, scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration failed:', err);
      });
  });
}

// 2. Primary Mobile Navigation Drawer Controls
function toggleMobileNavDrawer() {
  if (typeof toggleNavDrawer === 'function') {
    toggleNavDrawer();
  } else {
    const drawer = document.getElementById('navDrawer');
    const backdrop = document.getElementById('navDrawerBackdrop');
    if (drawer) drawer.classList.toggle('open');
    if (backdrop) backdrop.classList.toggle('open');
  }
}

// 3. Document / Agent Sidebar Drawer Controls
function toggleMobileDocSidebar() {
  const isAgents = document.body.classList.contains('view-agents');
  const targetSelector = isAgents ? '#agentsView aside.sidebar' : '#studioView aside.sidebar';
  const sidebar = document.querySelector(targetSelector) || document.querySelector('aside.sidebar');
  const backdrop = document.getElementById('mobileDrawerBackdrop');
  if (sidebar && backdrop) {
    sidebar.classList.toggle('mobile-open');
    backdrop.classList.toggle('active');
  }
}

function closeMobileDocSidebar() {
  const sidebars = document.querySelectorAll('aside.sidebar');
  const backdrop = document.getElementById('mobileDrawerBackdrop');
  sidebars.forEach((sb) => sb.classList.remove('mobile-open'));
  if (backdrop) backdrop.classList.remove('active');
}

// Close doc drawer automatically when a document or agent item is clicked on mobile
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768) {
    if (e.target.closest('.file-item') || e.target.closest('.agent-item')) {
      closeMobileDocSidebar();
    }
  }
});

// 4. Update Mobile Active File Display Pill
function updateMobileActiveFileName(fileName) {
  const el = document.getElementById('mobileActiveFileName');
  if (el) {
    el.textContent = fileName || 'Select Document';
  }
}

// 5. Sync Mobile Approval Bar Status
function syncMobileApprovalBar(status) {
  const badge = document.getElementById('mobileStatusBadge');
  const btnApprove = document.getElementById('btnMobileApprove');
  const btnReject = document.getElementById('btnMobileReject');
  const btnReview = document.getElementById('btnMobileReview');
  if (!badge) return;

  const raw = status === 'Accepted' || status === 'approved' ? 'Approved' : status || 'In Review';
  badge.className = `mobile-approval-badge ${raw.toLowerCase().replace(/\s+/g, '-')}`;

  if (raw === 'Approved') {
    badge.innerHTML = '🟢 Approved';
    btnApprove?.classList.add('active');
    btnReject?.classList.remove('active');
    btnReview?.classList.remove('active');
  } else if (raw === 'Rejected') {
    badge.innerHTML = '🔴 Rejected';
    btnApprove?.classList.remove('active');
    btnReject?.classList.add('active');
    btnReview?.classList.remove('active');
  } else {
    badge.innerHTML = '🟡 In Review';
    btnApprove?.classList.remove('active');
    btnReject?.classList.remove('active');
    btnReview?.classList.add('active');
  }
}

// 6. Handle Manager Mobile Approval Actions
async function applyMobileApproval(decision) {
  const file = typeof getActiveFile === 'function' ? getActiveFile() : null;
  if (!file) {
    if (typeof showToast === 'function') {
      showToast('Please select a document first', 'warning');
    } else {
      alert('Please select a document from the file menu first.');
    }
    return;
  }

  // Update dropdown if present
  const statusSelect = document.getElementById('statusSelect');
  if (statusSelect) {
    statusSelect.value = decision;
  }

  syncMobileApprovalBar(decision);

  if (typeof onStatusChange === 'function') {
    await onStatusChange(decision);
  } else if (typeof saveCurrentFile === 'function') {
    file.status = decision;
    await saveCurrentFile();
  }

  if (typeof showToast === 'function') {
    if (decision === 'Approved') {
      showToast('🎉 Document Approved! Phase gate unblocked.', 'green');
    } else if (decision === 'Rejected') {
      showToast('⚠️ Document marked Rejected. Revisions requested.', 'red');
    } else {
      showToast('Document set to In Review.', 'yellow');
    }
  }
}

// Expose globally
window.toggleMobileSidebar = toggleMobileDocSidebar; // backward compatibility
window.closeMobileSidebar = closeMobileDocSidebar;   // backward compatibility
window.toggleMobileNavDrawer = toggleMobileNavDrawer;
window.toggleMobileDocSidebar = toggleMobileDocSidebar;
window.closeMobileDocSidebar = closeMobileDocSidebar;
window.updateMobileActiveFileName = updateMobileActiveFileName;
window.syncMobileApprovalBar = syncMobileApprovalBar;
window.applyMobileApproval = applyMobileApproval;
