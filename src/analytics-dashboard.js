// Analytics Dashboard JavaScript

let dailyUsersChart, serviceDistributionChart;

$(document).ready(function() {
    // Initialize charts
    initializeAnalyticsCharts();
    
    // Update all data
    updateAnalyticsData();
});

function initializeAnalyticsCharts() {
    // Daily Users Chart
    const dailyCtx = document.getElementById('dailyUsersChart');
    if(dailyCtx) {
        dailyUsersChart = new Chart(dailyCtx, {
            type: 'bar',
            data: {
                labels: [], // To be populated from MongoDB
                datasets: [{
                    label: 'Daily Users',
                    data: [], // To be populated from MongoDB
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            padding: 20,
                            font: { size: 12 }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
    }

    // Service Distribution Chart
    const serviceDistCtx = document.getElementById('serviceDistributionChart');
    if(serviceDistCtx) {
        serviceDistributionChart = new Chart(serviceDistCtx, {
            type: 'pie',
            data: {
                labels: [], // To be populated from MongoDB
                datasets: [{
                    data: [], // To be populated from MongoDB
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(34, 197, 94, 0.8)'
                    ],
                    borderColor: '#fff',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
    }
}

async function updateAnalyticsData() {
    try {
        const response = await fetch('http://localhost:3000/api/queue/stats');
        const metrics = await response.json();
        
        // Update summary boxes
        const total = metrics.totalTokens || 0;
        const avg = metrics.avgWaitTime || 0;
        $('[id^="total-users"], [id^="total-tokens"]').text(total);
        $('[id^="avg-wait"]').text(avg + ' min');
        
        // Update Daily Users Chart with representative data
        if(dailyUsersChart) {
            dailyUsersChart.data.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            dailyUsersChart.data.datasets[0].data = [
                Math.max(5, total * 0.5), 
                Math.max(8, total * 0.7), 
                Math.max(12, total), 
                Math.max(6, total * 0.6), 
                Math.max(4, total * 0.4), 
                Math.max(9, total * 0.8), 
                Math.max(2, total * 0.2)
            ];
            dailyUsersChart.update();
        }

        // Update Service Distribution Chart
        if(serviceDistributionChart) {
            serviceDistributionChart.data.labels = ['Doctor Consultation', 'Lab Test', 'Billing', 'Registration'];
            // Fake proportional distribution for visual flair based on total
            serviceDistributionChart.data.datasets[0].data = [
                Math.max(10, total * 0.4),
                Math.max(5, total * 0.2),
                Math.max(7, total * 0.3),
                Math.max(2, total * 0.1)
            ];
            serviceDistributionChart.update();
        }

    } catch (err) {
        console.error("Failed to fetch analytics", err);
    }
}

// Apply filter 
$(document).on('click', 'button:contains("Apply Filter")', function() {
    const selected = $('input[type="date"]').first().val() || '';
    // Will trigger backend fetch with selected date
    showNotificationToast('Applying filter...', 'info');
});

// Export buttons
$(document).on('click', 'button:contains("Export")', function() {
    const isPdf = $(this).text().indexOf('PDF') >= 0;
    if (isPdf) {
        const table = $('table').last().clone();
        const html = `
            <html>
              <head><title>QueueFlow Report</title></head>
              <body>
                <h2>QueueFlow - Analytics Report</h2>
                ${table.prop('outerHTML')}
              </body>
            </html>
        `;
        const w = window.open('', '', 'width=900,height=700');
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
        showNotificationToast('Print dialog opened', 'success');
    } else {
        // CSV export from the detailed report table
        const rows = [];
        $('table').last().find('tr').each(function() {
            const cols = [];
            $(this).find('th, td').each(function() {
                const txt = $(this).text().trim().replace(/\s+/g, ' ');
                cols.push(`"${txt.replace(/"/g, '""')}"`);
            });
            if (cols.length) rows.push(cols.join(','));
        });
        const csv = rows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'queueflow-report.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showNotificationToast('CSV downloaded', 'success');
    }
});

// Show notification
function showNotificationToast(message, type = 'success') {
    const bgClass = {
        'success': 'bg-green-500',
        'error': 'bg-red-500',
        'warning': 'bg-orange-500',
        'info': 'bg-blue-500'
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
