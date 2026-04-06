// Core JavaScript for QueueFlow System

$(document).ready(function() {
    // Initialize tooltips and popovers
    initializeUI();
    
    // Smooth scroll to anchors
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        var target = $(this.getAttribute('href'));
        if(target.length) {
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 80
            }, 1000);
        }
    });

    // Dark mode toggle (if exists)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if(prefersDark.matches) {
        document.documentElement.classList.add('dark');
    }

    // Secure routes handling
    protectRoutes();

    // Auto-hide notification toast after 3 seconds
    setTimeout(() => {
        hideNotificationToast();
    }, 3000);
});

function protectRoutes() {
    const publicPages = ['/index.html', '/auth.html', '/'];
    const path = window.location.pathname;
    
    // Check if current path ends with any public page
    const isPublic = publicPages.some(pp => path.endsWith(pp)) || path === '/';
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole');

    // If not logged in and trying to access private page -> force auth
    if (!isLoggedIn && !isPublic) {
        window.location.replace('auth.html');
        return;
    }

    // Role-based guarding
    if (isLoggedIn && !isPublic) {
        if (path.includes('admin-dashboard') && role !== 'admin') {
            window.location.replace('index.html');
        }
    }
}

// Initialize UI Components
function initializeUI() {
    // Add hover effects to cards
    $('.card-hover').hover(
        function() {
            $(this).addClass('shadow-lg');
        },
        function() {
            $(this).removeClass('shadow-lg');
        }
    );

    // Initialize modal if exists
    if($('#token-modal').length) {
        initializeTokenModal();
    }
}

// Show notification toast
function showNotificationToast(message, type = 'success') {
    const toast = $(`
        <div class="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white animate-slideUp z-50 toast ${type}">
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

// Hide notification toast
function hideNotificationToast() {
    $('#notification-toast').addClass('hidden');
}

// Format time to HH:MM format
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Format date
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Generate random token number
function generateTokenNumber(prefix = 'A') {
    const num = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `${prefix}-${num}`;
}

// Calculate wait time
function calculateWaitTime(position, avgServiceTime) {
    return Math.ceil((position - 1) * avgServiceTime);
}

// Fetch data and update UI from MongoDB via Express API
async function refreshQueueDisplay() {
    try {
        const response = await fetch('http://localhost:3000/api/queue/stats');
        const metrics = await response.json();
        
        if($('#main-token').length && metrics.upcomingTokens && metrics.upcomingTokens.length > 0) {
            $('#main-token').text(metrics.upcomingTokens[0]);
        } else if($('#main-token').length) {
            $('#main-token').text('-');
        }
        
        if($('#main-counter').length) {
            $('#main-counter').text('-');
        }
        if($('#queue-count').length) {
            $('#queue-count').text(metrics.waitingCount || 0);
        }
        if($('#avg-wait').length) {
            $('#avg-wait').text((metrics.avgWaitTime || 0) + ' min');
        }
        
        if($('#upcoming-tokens').length && metrics.upcomingTokens) {
            updateUpcomingTokens(metrics.upcomingTokens.slice(1, 7)); // slice offsets the main token
        }
    } catch(e) {
        console.error("Failed to refresh queue from backend:", e);
    }
}

// Queue actions linked to backend
async function advanceQueue() {
    try {
        const res = await fetch('http://localhost:3000/api/queue/call', { method: 'PATCH' });
        if(res.ok && typeof showNotificationToast === 'function') {
            const data = await res.json();
            showNotificationToast(`Called token ${data.calledToken.tokenId}!`, 'success');
        } else {
            console.error("Failed to advance queue");
        }
    } catch(err) {
        console.error(err);
    }
}

async function callToken(tokenIndex) {
    // For now simply advances queue since tokenIndex logic requires more robust API
    advanceQueue();
}

// Update digital clock
function updateClock() {
    const now = new Date();
    const timeString = formatTime(now);
    const dateString = formatDate(now);
    
    if($('#digital-clock').length) {
        $('#digital-clock').text(timeString);
    }
    if($('#current-date').length) {
        $('#current-date').text(dateString);
    }
}

// Start clock updates
setInterval(updateClock, 1000);
updateClock();

// Simulate auto-refresh for queue
function startQueueAutoRefresh(interval = 5000) {
    setInterval(() => {
        refreshQueueDisplay();
    }, interval);
}

    // Auto-refresh is already setting up interval
    // Handled above natively

// Update upcoming tokens display
function updateUpcomingTokens(tokens) {
    const container = $('#upcoming-tokens');
    container.empty();
    
    tokens.forEach(token => {
        const tokenEl = $(`
            <div class="bg-slate-700 rounded-lg p-4 text-center hover:bg-indigo-600 transition cursor-pointer">
                <div class="text-2xl font-bold text-white">${token}</div>
            </div>
        `);
        container.append(tokenEl);
    });
}

// Initialize token modal
function initializeTokenModal() {
    // Modal is already in HTML
}

// Close token modal
function closeTokenModal() {
    $('#token-modal').addClass('hidden');
}

// Print token
function printToken() {
    const tokenNumber = $('#modal-token-number').text();
    const position = $('#modal-position').text();
    const waitTime = $('#modal-wait-time').text();
    
    const printContent = `
        <html>
            <head>
                <title>Queue Token - ${tokenNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; }
                    .token-box { 
                        border: 2px solid #000; 
                        padding: 40px; 
                        width: 300px; 
                        margin: 50px auto;
                    }
                    .token-number { font-size: 72px; font-weight: bold; margin: 20px 0; }
                    .info { font-size: 18px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="token-box">
                    <h1>Your Queue Token</h1>
                    <div class="token-number">${tokenNumber}</div>
                    <div class="info">Position: ${position}</div>
                    <div class="info">Estimated Wait: ${waitTime}</div>
                </div>
            </body>
        </html>
    `;
    
    const printWindow = window.open('', '', 'width=600,height=400');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// Debounce function for search and filters
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Form validation helper
function validateForm(formId) {
    const form = $(`#${formId}`);
    const inputs = form.find('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.each(function() {
        if(!$(this).val()) {
            $(this).addClass('ring-2 ring-red-500');
            isValid = false;
        } else {
            $(this).removeClass('ring-2 ring-red-500');
        }
    });
    
    return isValid;
}

// Export data to CSV
function exportDataToCSV(filename, data) {
    const csvContent = "data:text/csv;charset=utf-8," + 
        data.map(row => row.join(',')).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    link.click();
}

// Local storage helpers
function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromLocalStorage(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}

function removeFromLocalStorage(key) {
    localStorage.removeItem(key);
}

// Chart helper for Chart.js
function initializeChart(canvasId, type, labels, datasets, options = {}) {
    const ctx = document.getElementById(canvasId);
    if(!ctx) return;
    
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        }
    };
    
    return new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {...defaultOptions, ...options}
    });
}

// Permission helper
function hasPermission(permission) {
    const userRole = getFromLocalStorage('userRole');
    const permissions = {
        'admin': ['view_dashboard', 'manage_queue', 'manage_users', 'view_analytics', 'export_data'],
        'staff': ['manage_queue', 'view_dashboard'],
        'customer': ['get_token', 'track_queue']
    };
    
    return permissions[userRole]?.includes(permission) || false;
}

// Responsive sidebar toggle
function toggleSidebar() {
    const sidebar = $('.sidebar');
    sidebar.toggleClass('hidden');
}

// Initialize page based on user role
function initializePageByRole() {
    const userRole = getFromLocalStorage('userRole');
    
    switch(userRole) {
        case 'admin':
            // Load admin-specific features
            break;
        case 'staff':
            // Load staff-specific features
            break;
        case 'customer':
            // Load customer-specific features
            break;
    }
}

// Utility: Render template
function renderTemplate(templateString, data) {
    return templateString.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || '');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('QueueFlow System Initialized');
    
    // Dynamically set user name from login
    const userFullName = localStorage.getItem('userFullName') || localStorage.getItem('userEmail') || 'Guest';
    const profileNameEls = document.querySelectorAll('.user-profile-name');
    profileNameEls.forEach(el => {
        if (el.tagName === 'INPUT') {
            el.value = userFullName;
        } else {
            el.textContent = userFullName;
        }
    });
});
