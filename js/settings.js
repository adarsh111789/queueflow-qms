// Settings Page JavaScript

$(document).ready(function() {
    // Tab switching
    $('.settings-tab').on('click', function() {
        const tab = $(this).data('tab');
        
        // Update tabs
        $('.settings-tab').removeClass('active bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-600')
            .addClass('text-slate-600 dark:text-slate-400 border-transparent')
            .prop('disabled', false);
        $(this).addClass('active bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-600')
            .prop('disabled', true);
        
        // Update content
        $('.settings-content').removeClass('active').addClass('hidden');
        $(`#${tab}`).removeClass('hidden').addClass('active').fadeIn(200);
    });

    // Form submissions
    $('button:contains("Save Changes")').on('click', function(e) {
        e.preventDefault();
        
        const fullName = $(this).closest('.settings-content').find('input[type="text"]').eq(0).val();
        const email = $(this).closest('.settings-content').find('input[type="email"]').val();
        
        if(!fullName || !email) {
            showNotificationToast('Please fill in all required fields', 'warning');
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('userFullName', fullName);
        localStorage.setItem('userEmail', email);
        
        showNotificationToast('Profile updated successfully', 'success');
    });

    $('button:contains("Save Preferences")').on('click', function(e) {
        e.preventDefault();
        showNotificationToast('Notification preferences saved', 'success');
    });

    $('button:contains("Save Settings")').on('click', function(e) {
        e.preventDefault();
        const theme = $(this).closest('.settings-content').find('select').eq(0).val();
        localStorage.setItem('theme', theme);
        showNotificationToast('System settings saved', 'success');
    });

    $('button:contains("Add New Service")').on('click', function(e) {
        e.preventDefault();
        showNotificationToast('New service dialog opened', 'info');
    });

    // Toggle switches
    $('input[type="checkbox"]').on('change', function() {
        const isChecked = $(this).is(':checked');
        console.log('Checkbox changed:', isChecked);
    });

    // Profile picture upload
    $('button:contains("Upload New")').on('click', function() {
        // Simulate file picker
        showNotificationToast('Profile picture upload feature', 'info');
    });

    // Edit service buttons
    $('button:contains("Edit")').on('click', function() {
        const serviceName = $(this).closest('.flex').find('.font-semibold').text();
        showNotificationToast(`Edit service: ${serviceName}`, 'info');
    });
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

// Load user data
function loadUserData() {
    const userFullName = localStorage.getItem('userFullName') || 'John Doe';
    const userEmail = localStorage.getItem('userEmail') || 'john@example.com';
    
    // Set form values
    $('input[type="text"]').eq(0).val(userFullName);
    $('input[type="email"]').val(userEmail);
}

// Initialize on load
$(document).ready(function() {
    loadUserData();
});
