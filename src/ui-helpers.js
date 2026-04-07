// UI Helper Utilities for Customer Pages
// Author: Member 2 - Customer UI Module

/**
 * Shows an animated loading spinner on a button
 */
function setButtonLoading(btnId, loadingText = 'Loading...') {
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.disabled = true;
        btn.dataset.originalText = btn.textContent;
        btn.innerHTML = `<span class="animate-spin inline-block mr-2">⟳</span>${loadingText}`;
    }
}

/**
 * Resets button to original state
 */
function resetButton(btnId) {
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.disabled = false;
        btn.textContent = btn.dataset.originalText || 'Submit';
    }
}

/**
 * Validates email format
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Formats wait time nicely
 */
function formatWaitTime(minutes) {
    if (minutes < 1) return 'Less than 1 min';
    if (minutes === 1) return '1 minute';
    if (minutes < 60) return `${minutes} minutes`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hour${hrs > 1 ? 's' : ''}`;
}

/**
 * Format token ID with leading zeros
 */
function formatTokenId(prefix, number) {
    return `${prefix}-${String(number).padStart(3, '0')}`;
}

/**
 * Saves user session to localStorage
 */
function saveUserSession(data) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userFullName', data.fullName || '');
    localStorage.setItem('userEmail', data.email || '');
    localStorage.setItem('userRole', data.role || 'customer');
}

/**
 * Clears user session from localStorage
 */
function clearUserSession() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    window.location.href = 'auth.html';
}
