// Staff Dashboard Utilities
// Author: Member 3 - Staff Dashboard Module

/**
 * Formats time elapsed since a given ISO date string
 */
function timeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const hrs = Math.floor(diffMins / 60);
    return `${hrs}h ago`;
}

/**
 * Returns a CSS badge color class based on token status
 */
function getStatusBadgeClass(status) {
    const map = {
        pending:   'bg-amber-100 text-amber-700',
        waiting:   'bg-blue-100 text-blue-700',
        serving:   'bg-green-100 text-green-700',
        completed: 'bg-slate-100 text-slate-500',
        cancelled: 'bg-red-100 text-red-700'
    };
    return map[status] || 'bg-gray-100 text-gray-600';
}

/**
 * Plays a soft audio beep to alert staff of a new pending token
 */
function playAlertBeep() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(520, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
    } catch(e) {
        // Audio not supported
    }
}

/**
 * Renders a status badge HTML element
 */
function renderStatusBadge(status) {
    const cls = getStatusBadgeClass(status);
    return `<span class="px-2 py-1 rounded-full text-xs font-semibold ${cls}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
}
