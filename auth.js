// Authentication module for Golpo
// Handles user authentication state and UI updates

let currentUser = null;
let authInitialized = false;

// Fetch current user data
async function fetchCurrentUser() {
  try {
    const response = await fetch('/api/auth/user');
    if (response.ok) {
      const user = await response.json();
      currentUser = user;
      updateAuthUI();
      return user;
    } else {
      currentUser = null;
      updateAuthUI();
      return null;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    currentUser = null;
    updateAuthUI();
    return null;
  }
}

// Update the UI based on authentication state
function updateAuthUI() {
  const authButton = document.getElementById('authButton');
  if (!authButton) return;

  if (currentUser) {
    // User is logged in
    authButton.innerHTML = `
      <div class="user-menu">
        <button class="user-menu-btn" id="userMenuBtn" title="User Menu">
          <img src="${currentUser.profileImageUrl || 'assets/logo.png'}" 
               alt="${currentUser.firstName || 'User'}" 
               class="user-avatar"
               onerror="this.src='assets/logo.png'">
          <span class="user-name">${currentUser.firstName || 'User'}</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        <div class="user-dropdown" id="userDropdown" style="display: none;">
          <div class="user-info">
            <img src="${currentUser.profileImageUrl || 'assets/logo.png'}" 
                 alt="${currentUser.firstName || 'User'}" 
                 class="user-avatar-large"
                 onerror="this.src='assets/logo.png'">
            <div class="user-details">
              <div class="user-full-name">${currentUser.firstName || ''} ${currentUser.lastName || ''}</div>
              <div class="user-email">${currentUser.email || ''}</div>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" onclick="handleLogout()">
            <i class="fas fa-sign-out-alt"></i>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    `;

    // Add dropdown toggle functionality
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuBtn && userDropdown) {
      userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.style.display = userDropdown.style.display === 'none' ? 'block' : 'none';
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        userDropdown.style.display = 'none';
      });
    }
  } else {
    // User is not logged in
    authButton.innerHTML = `
      <button class="control-btn login-btn" onclick="handleLogin()" title="Log In">
        <i class="fas fa-sign-in-alt"></i>
        <span>Log In</span>
      </button>
    `;
  }
}

// Handle login
function handleLogin() {
  window.location.href = '/api/login';
}

// Handle logout
function handleLogout() {
  window.location.href = '/api/logout';
}

// Initialize authentication
async function initAuth() {
  if (authInitialized) return;
  authInitialized = true;
  await fetchCurrentUser();
}

// Export to global scope
window.currentUser = null;
window.fetchCurrentUser = fetchCurrentUser;
window.updateAuthUI = updateAuthUI;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.initAuth = initAuth;
window.getCurrentUser = () => currentUser;
window.isAuthenticated = () => currentUser !== null;

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}
