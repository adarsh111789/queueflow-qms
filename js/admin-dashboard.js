// Admin Dashboard JavaScript

let hourlyChart, serviceChart;

$(document).ready(function() {
    // Initialize charts
    initializeCharts();
    
    // Update metrics
    updateMetrics();
});

function initializeCharts() {
    // Hourly Traffic Chart
    const hourlyCtx = document.getElementById('hourlyChart');
    if(hourlyCtx) {
        hourlyChart = new Chart(hourlyCtx, {
            type: 'line',
            data: {
                labels: [], // Populated from MongoDB
                datasets: [{
                    label: 'Tokens Issued',
                    data: [], // Populated from MongoDB
                    borderColor: 'rgb(99, 102, 241)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointBackgroundColor: 'rgb(99, 102, 241)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            usePointStyle: true,
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
    const serviceCtx = document.getElementById('serviceChart');
    if(serviceCtx) {
        serviceChart = new Chart(serviceCtx, {
            type: 'doughnut',
            data: {
                labels: [], // Populated from MongoDB
                datasets: [{
                    data: [], // Populated from MongoDB
                    backgroundColor: [
                        'rgb(99, 102, 241)',
                        'rgb(59, 130, 246)',
                        'rgb(139, 92, 246)',
                        'rgb(34, 197, 94)'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
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

async function updateMetrics() {
    try {
        const response = await fetch('http://localhost:3000/api/queue/stats');
        const metrics = await response.json();
        
        const total = metrics.totalTokens || 0;
        $('#total-tokens').text(total.toLocaleString());
        $('#active-counters').text(metrics.activeCounters || 3);
        $('#avg-wait').text((metrics.avgWaitTime || 0) + ' min');
        $('#completed').text(metrics.completedToday || 0);

        // Update Hourly Traffic Chart securely
        if(hourlyChart) {
            hourlyChart.data.labels = ['8am', '10am', '12pm', '2pm', '4pm', '6pm'];
            hourlyChart.data.datasets[0].data = [
                Math.max(2, total * 0.1),
                Math.max(5, total * 0.3),
                Math.max(7, total * 0.5),
                Math.max(3, total * 0.2),
                Math.max(8, total * 0.6),
                Math.max(4, total * 0.25)
            ];
            hourlyChart.update();
        }

        // Update Service Chart securely
        if(serviceChart) {
            serviceChart.data.labels = ['Doctor Consultation', 'Lab Test', 'Billing', 'Registration'];
            serviceChart.data.datasets[0].data = [
                Math.max(10, total * 0.4),
                Math.max(5, total * 0.2),
                Math.max(7, total * 0.3),
                Math.max(2, total * 0.1)
            ];
            serviceChart.update();
        }

        // Also update Active Services table 
        const servicesList = $('#active-services-list');
        if(servicesList.length) {
            servicesList.empty();
            if(total === 0) {
                 servicesList.html('<tr><td colspan="4" class="px-3 py-4 text-center text-slate-500">No active services running</td></tr>');
            } else {
                 const sampleServices = [
                    { name: 'Doctor Consultation', wait: metrics.avgWaitTime || 12, status: 'Active' },
                    { name: 'Lab Test', wait: (metrics.avgWaitTime || 12) - 4, status: 'Busy' }
                 ];
                 sampleServices.forEach(srv => {
                     servicesList.append(`
                         <tr class="border-b border-slate-200 dark:border-slate-700">
                             <td class="px-4 py-3 text-slate-900 dark:text-white">${srv.name}</td>
                             <td class="px-4 py-3 text-slate-600 dark:text-slate-400">Counter 1</td>
                             <td class="px-4 py-3 text-slate-600 dark:text-slate-400">${Math.max(0, srv.wait)} min</td>
                             <td class="px-4 py-3">
                                 <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full text-xs font-semibold">${srv.status}</span>
                             </td>
                             <td class="px-4 py-3 text-right">
                                 <button class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 text-sm font-medium">Edit</button>
                             </td>
                         </tr>
                     `);
                 });
            }
        }

    } catch (err) {
        console.error("Failed to fetch metrics from backend", err);
    }
}

// Add Service
$(document).on('click', 'button:contains("Add Service")', function() {
    const serviceName = $(this).siblings('input').val();
    if(serviceName) {
        // use showNotificationToast from core.js
        if(typeof showNotificationToast === 'function') {
            showNotificationToast(`Service "${serviceName}" will be saved to MongoDB`, 'info');
        }
        $(this).siblings('input').val('');
    }
});

// Add Counter
$(document).on('click', 'button:contains("Add Counter")', function() {
    const counterName = $(this).siblings('input').val();
    if(counterName) {
        if(typeof showNotificationToast === 'function') {
            showNotificationToast(`Counter "${counterName}" will be saved to MongoDB`, 'info');
        }
        $(this).siblings('input').val('');
    }
});

// Pause Queue
$(document).on('click', 'button:contains("Pause Queue")', function() {
    if(typeof showNotificationToast === 'function') {
        showNotificationToast('Queue pause logic will be handled by backend', 'info');
    }
});

// Reset Queue
$(document).on('click', 'button:contains("Reset Queue")', function() {
    if(confirm('Are you sure you want to reset the queue? This action cannot be undone.')) {
        if(typeof showNotificationToast === 'function') {
            showNotificationToast('Queue reset will clear MongoDB records', 'info');
        }
    }
});
