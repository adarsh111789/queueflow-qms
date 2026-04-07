// Staff Dashboard JavaScript (Wired for MongoDB Fetching in the future)

$(document).ready(function() {
    updateStaffData();
    setInterval(updateStaffData, 5000); // Polling every 5 seconds for live updates
});

async function updateStaffData() {
    try {
        // Fetch stats
        const response = await fetch('http://localhost:3000/api/queue/stats');
        const metrics = await response.json();
        
        $('#waiting-count').text(metrics.waitingCount || 0);
        $('#avg-service-time').text((metrics.avgWaitTime || 0) + ' min');
        $('#completed-today').text(metrics.completedToday || 0);

        // Populate Active Queue
        const activeList = $('#token-list');
        activeList.empty();
        
        let currentServingToken = '-';
        if (metrics.upcomingTokens && metrics.upcomingTokens.length > 0) {
            currentServingToken = metrics.upcomingTokens[0];
            $('#current-token').text(currentServingToken);
            $('#service-type').text('In Service');
            $('#customer-name').text('Walk-in');
            
            // Re-render rest of active queue
            metrics.upcomingTokens.slice(1).forEach((tk) => {
                activeList.append(`
                    <tr class="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                        <td class="px-3 py-3 text-slate-900 dark:text-white font-bold">${tk}</td>
                        <td class="px-3 py-3 text-slate-600 dark:text-slate-400">Walk-in</td>
                        <td class="px-3 py-3"><span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full text-xs font-semibold">Waiting</span></td>
                        <td class="px-3 py-3 text-right">
                            <button class="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium" onclick="nextToken()">Complete</button>
                        </td>
                    </tr>
                `);
            });
        } else {
            $('#current-token').text('-');
            $('#service-type').text('-');
            $('#customer-name').text('-');
            activeList.html('<tr><td colspan="4" class="px-3 py-4 text-center text-slate-500">No active tokens</td></tr>');
        }

        // Fetch Pending Approvals
        const pendingRes = await fetch('http://localhost:3000/api/queue/pending');
        const pendingTokens = await pendingRes.json();
        
        $('#pending-count').text(pendingTokens.length);
        
        const pendingList = $('#pending-list');
        pendingList.empty();
        
        if(pendingTokens.length === 0) {
            pendingList.html('<tr><td colspan="4" class="px-3 py-4 text-center text-slate-500">No pending tokens</td></tr>');
        } else {
            pendingTokens.forEach(pt => {
                pendingList.append(`
                    <tr class="border-b border-amber-200/50 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700/50 transition">
                        <td class="px-3 py-3 text-slate-900 dark:text-white font-bold">${pt.tokenId}</td>
                        <td class="px-3 py-3 text-slate-600 dark:text-slate-400">${pt.customerName}</td>
                        <td class="px-3 py-3 text-slate-600 dark:text-slate-400">${pt.serviceType}</td>
                        <td class="px-3 py-3 text-right gap-2 flex justify-end">
                            <button onclick="approveToken('${pt.tokenId}')" class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-bold transition">Approve</button>
                        </td>
                    </tr>
                `);
            });
        }

    } catch (err) {
        console.error("Failed to fetch dashboard data", err);
    }
}

// Global approval function
window.approveToken = async function(tokenId) {
    try {
        const res = await fetch(`http://localhost:3000/api/queue/approve/${tokenId}`, { method: 'PATCH' });
        if(res.ok) {
            showNotificationToast(`Token ${tokenId} approved to join queue.`, 'success');
            updateStaffData(); // quick refresh
        } else {
            showNotificationToast(`Failed to approve ${tokenId}.`, 'error');
        }
    } catch(e) {
        showNotificationToast('Network error during approval.', 'error');
    }
}

window.nextToken = function() {
    // Relying on core API for advanceQueue
    if (typeof advanceQueue === 'function') {
        advanceQueue();
    }
    setTimeout(updateStaffData, 500);
};

window.recallToken = function() {
    const currentToken = $('#current-token').text();
    showNotificationToast(`Token recalled`, 'warning');
};

window.skipToken = function() {
    if (typeof advanceQueue === 'function') {
        advanceQueue();
    }
    showNotificationToast(`Token skipped`, 'warning');
    setTimeout(updateStaffData, 500);
};

// Show notification
function showNotificationToast(message, type = 'success') {
    const bgClass = {
        'success': 'bg-green-500',
        'error': 'bg-red-500',
        'warning': 'bg-orange-500'
    }[type] || 'bg-green-500';

    const toast = $(`
        <div class="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white animate-slideUp z-50 ${bgClass}">
            ${message}
        </div>
    `);
    
    $('body').append(toast);
    
    setTimeout(() => {
        toast.fadeOut(300, function() {
            $(this).remove();
        });
    }, 3000);
}
