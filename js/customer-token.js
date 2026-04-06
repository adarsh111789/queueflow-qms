// Customer Token Page JavaScript

$(document).ready(function() {
    // Service card selection
    $('.service-card').on('click', function() {
        $('.service-card').removeClass('border-indigo-600 shadow-lg');
        $(this).addClass('border-indigo-600 shadow-lg');
        
        // Enable button
        $('#get-token-btn').prop('disabled', false);
        $('#get-token-btn').text('Get Token');
    });

    // Get token button
    $('#get-token-btn').on('click', async function() {
        const selectedService = $('.service-card.border-indigo-600').data('service');
        const serviceName = $('.service-card.border-indigo-600 h3').text() || 'Unknown Service';
        
        if(!selectedService) {
            showNotificationToast('Please select a service', 'warning');
            return;
        }

        // Disable button during loading
        const $btn = $(this);
        $btn.prop('disabled', true).text('Generating...');

        try {
            const userName = localStorage.getItem('userFullName') || localStorage.getItem('userEmail') || 'Guest';
            const response = await fetch('http://localhost:3000/api/queue/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    serviceType: serviceName, 
                    customerName: userName 
                })
            });
            const data = await response.json();

            // Update modal with response
            $('#modal-token-number').text(data.tokenId);
            $('#modal-position').text('Pending Approval');
            $('#modal-wait-time').text('TBD');
            
            // Show modal
            $('#token-modal').removeClass('hidden').addClass('animate-scaleIn');

            // Force quick refresh
            refreshQueueList();
            
            $btn.prop('disabled', false).text('Get Token');
        } catch(err) {
            console.error("Failed to generate token", err);
            showNotificationToast('Failed to create token. Network error.', 'error');
            $btn.prop('disabled', false).text('Get Token');
        }
    });

    // Service buttons in modal
    window.printToken = function() {
        const tokenNumber = $('#modal-token-number').text();
        const position = $('#modal-position').text();
        const waitTime = $('#modal-wait-time').text();
        
        const printContent = `
            <html>
                <head>
                    <title>Queue Token - ${tokenNumber}</title>
                    <style>
                        body { 
                            font-family: 'Poppins', Arial, sans-serif; 
                            text-align: center; 
                            background: white;
                            margin: 0;
                            padding: 40px;
                        }
                        .token-box { 
                            border: 3px solid #4f46e5; 
                            padding: 60px; 
                            width: 400px; 
                            margin: 0 auto;
                            border-radius: 12px;
                            background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%);
                            color: white;
                        }
                        h1 { font-size: 24px; margin: 0 0 20px 0; }
                        .token-number { 
                            font-size: 96px; 
                            font-weight: bold; 
                            margin: 30px 0;
                            letter-spacing: 10px;
                        }
                        .info { 
                            font-size: 20px; 
                            margin: 15px 0;
                            opacity: 0.95;
                        }
                        .footer { 
                            margin-top: 40px;
                            font-size: 14px;
                            opacity: 0.8;
                            border-top: 1px solid rgba(255,255,255,0.3);
                            padding-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="token-box">
                        <h1>Your Queue Token</h1>
                        <div class="token-number">${tokenNumber}</div>
                        <div class="info">Position: <strong>${position}</strong></div>
                        <div class="info">Est. Wait: <strong>${waitTime}</strong></div>
                        <div class="footer">Please keep this token safe. You will need it at the counter.</div>
                    </div>
                </body>
            </html>
        `;
        
        const printWindow = window.open('', '', 'width=600,height=700');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
        
        showNotificationToast('Token printed successfully', 'success');
    };

    window.closeTokenModal = function() {
        $('#token-modal').addClass('hidden').removeClass('animate-scaleIn');
        
        // Reset service selection
        $('.service-card').removeClass('border-indigo-600 shadow-lg');
        $('#get-token-btn').prop('disabled', true).text('Select a Service to Get Token');
    };

    refreshQueueList();
    setInterval(refreshQueueList, 5000);
    updateServiceInfo();
});

async function refreshQueueList() {
    try {
        const response = await fetch('http://localhost:3000/api/queue/stats');
        const metrics = await response.json();
        
        let currentServing = { token: '-', counter: 1 };
        let queue = [];
        
        if (metrics.upcomingTokens && metrics.upcomingTokens.length > 0) {
            currentServing.token = metrics.upcomingTokens[0];
            
            queue = metrics.upcomingTokens.slice(1).map((tokenId, index) => ({
                token: tokenId,
                customer: 'Walk-in',
                service: 'Service',
                waitTime: ((index + 1) * 5)
            }));
        }
        
        updateQueueDisplay({
            currentServing,
            queue
        });
    } catch(e) {
        console.error("Failed to fetch queue list", e);
    }
}

// Update queue display
function updateQueueDisplay(data) {
    const queueList = $('#queue-list');
    queueList.empty();
    if (data.currentServing && $('#now-serving').length) {
        $('#now-serving .text-5xl').text(data.currentServing.token);
        $('#now-serving p').text('Counter ' + (data.currentServing.counter || 1));
    }
    if (data.queue.length === 0) {
        queueList.html('<div class="p-3 text-center text-slate-600 dark:text-slate-400">No customers waiting</div>');
    } else {
        data.queue.forEach((item) => {
            const row = `
                <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition">
                    <div class="flex-1">
                        <div class="font-semibold text-slate-900 dark:text-white">${item.token}</div>
                        <div class="text-sm text-slate-600 dark:text-slate-400">${item.customer}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm font-medium text-indigo-600 dark:text-indigo-400">${item.service}</div>
                        <div class="text-xs text-slate-600 dark:text-slate-400">Wait: ${item.waitTime} min</div>
                    </div>
                </div>
            `;
            queueList.append(row);
        });
    }
    $('#update-time').text('just now');
}

// Update service information
function updateServiceInfo() {
    const services = [
        { name: 'Doctor Consultation', waiting: 24, avgWait: 15 },
        { name: 'Lab Test', waiting: 12, avgWait: 8 },
        { name: 'Billing', waiting: 8, avgWait: 10 },
        { name: 'Registration', waiting: 15, avgWait: 12 }
    ];

    // Update service cards with real data (if needed)
}

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

// Utility functions (must match core.js)
function generateTokenNumber(prefix = 'A') {
    const num = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `${prefix}-${num}`;
}

function calculateWaitTime(position, avgServiceTime) {
    return Math.ceil((position - 1) * avgServiceTime);
}
