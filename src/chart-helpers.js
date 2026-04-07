// Analytics & Chart Helpers
// Author: Member 4 - Admin & Analytics Module

/**
 * Generates a color palette for charts
 */
function generateChartColors(count) {
    const baseColors = [
        'rgba(99, 102, 241, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
    ];
    return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
}

/**
 * Generates last N day labels for charts
 */
function getLastNDayLabels(n) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const labels = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(days[d.getDay()]);
    }
    return labels;
}

/**
 * Calculates percentage change between two numbers
 */
function percentChange(oldVal, newVal) {
    if (oldVal === 0) return newVal > 0 ? 100 : 0;
    return Math.round(((newVal - oldVal) / oldVal) * 100);
}

/**
 * Formats a number into a short readable format (e.g. 1200 -> 1.2k)
 */
function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
}

/**
 * Renders a trend indicator arrow based on change value
 */
function trendIndicator(change) {
    if (change > 0)  return `<span class="text-green-500 text-xs font-semibold">▲ ${change}%</span>`;
    if (change < 0)  return `<span class="text-red-500 text-xs font-semibold">▼ ${Math.abs(change)}%</span>`;
    return `<span class="text-slate-400 text-xs">— 0%</span>`;
}
