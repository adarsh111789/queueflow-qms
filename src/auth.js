// Authentication Page JavaScript

$(document).ready(function() {
    // Handle logout (frontend-only)
    try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('logout') === '1') {
            localStorage.removeItem('userRole');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userFullName');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('queueflow_completedCount');
            showNotificationToast('Logged out', 'info');
        }
    } catch (e) {
        // ignore
    }

    // Tab switching
    $('.auth-tab').on('click', function() {
        const tab = $(this).data('tab');
        
        // Update tabs
        $('.auth-tab').removeClass('active text-indigo-600 border-indigo-600').addClass('text-slate-600 dark:text-slate-400 border-transparent');
        $(this).addClass('active text-indigo-600 border-indigo-600');
        
        // Update forms
        $('.auth-form').removeClass('active').addClass('hidden');
        $(`#${tab}-form`).removeClass('hidden').addClass('active');
    });

    // Login form submission
    $('#login-form').on('submit', async function(e) {
        e.preventDefault();
        
        const email = $(this).find('input[type="email"]').val();
        const password = $(this).find('input[type="password"]').val();
        const role = $(this).find('select').val();
        
        // Show loading spinner
        const $btn = $(this).find('button');
        const $spinner = $(this).find('.login-spinner');
        $btn.prop('disabled', true);
        $spinner.removeClass('hidden');
        
        try {
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });
            const data = await res.json();
            
            if (res.ok) {
                // Store user info in localStorage
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userEmail', data.email);
                if(data.fullName) localStorage.setItem('userFullName', data.fullName);
                localStorage.setItem('isLoggedIn', 'true');
                
                showNotificationToast('Login successful!', 'success');
                
                setTimeout(() => {
                    // Redirect based on role
                    switch(data.role) {
                        case 'admin':
                            window.location.href = 'admin-dashboard.html';
                            break;
                        case 'staff':
                            window.location.href = 'staff-dashboard.html';
                            break;
                        case 'customer':
                            window.location.href = 'customer-token.html';
                            break;
                    }
                }, 1000);
            } else {
                showNotificationToast(data.message || 'Login failed', 'error');
                $btn.prop('disabled', false);
                $spinner.addClass('hidden');
            }
        } catch (err) {
            showNotificationToast('Network error, please try again.', 'error');
            $btn.prop('disabled', false);
            $spinner.addClass('hidden');
        }
    });

    // Register form submission
    $('#register-form').on('submit', async function(e) {
        e.preventDefault();
        
        const fullName = $(this).find('input[type="text"]').val();
        const email = $(this).find('input[type="email"]').val();
        const password = $(this).find('input[type="password"]').eq(0).val();
        const confirmPassword = $(this).find('input[type="password"]').eq(1).val();
        const role = $(this).find('select').val();
        
        // Validate passwords match
        if(password !== confirmPassword) {
            showNotificationToast('Passwords do not match', 'error');
            return;
        }
        
        // Show loading spinner
        const $btn = $(this).find('button');
        const $spinner = $(this).find('.register-spinner');
        $btn.prop('disabled', true);
        $spinner.removeClass('hidden');
        
        try {
            const res = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password, role })
            });
            const data = await res.json();
            
            if (res.ok) {
                // Store user info in localStorage automatically
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userEmail', data.email);
                localStorage.setItem('userFullName', data.fullName);
                localStorage.setItem('isLoggedIn', 'true');
                
                showNotificationToast('Account created successfully!', 'success');
                
                setTimeout(() => {
                    // Redirect based on role
                    switch(data.role) {
                        case 'admin':
                            window.location.href = 'admin-dashboard.html';
                            break;
                        case 'staff':
                            window.location.href = 'staff-dashboard.html';
                            break;
                        case 'customer':
                            window.location.href = 'customer-token.html';
                            break;
                    }
                }, 1000);
            } else {
                showNotificationToast(data.message || 'Registration failed', 'error');
                $btn.prop('disabled', false);
                $spinner.addClass('hidden');
            }
        } catch (err) {
            showNotificationToast('Network error, please try again.', 'error');
            $btn.prop('disabled', false);
            $spinner.addClass('hidden');
        }
    });

    // Floating label effect
    $('input, textarea').on('blur focus', function() {
        $(this).toggleClass('filled', this.value !== '');
    });

    // Input validation
    $('input[type="email"]').on('blur', function() {
        const email = $(this).val();
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        
        if(!isValid && email) {
            $(this).addClass('ring-2 ring-red-500');
        } else {
            $(this).removeClass('ring-2 ring-red-500');
        }
    });

    $('input[type="password"]').on('input', function() {
        const password = $(this).val();
        const hasMinLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        
        // You could show password strength indicator here
        if(hasMinLength && hasUpperCase && hasLowerCase && hasNumbers) {
            $(this).removeClass('ring-2 ring-yellow-500');
        } else if(password.length >= 6) {
            $(this).addClass('ring-2 ring-yellow-500');
        }
    });
});

// Show notification
function showNotificationToast(message, type = 'success') {
    const toast = $(`
        <div class="fixed bottom-4 left-4 px-6 py-3 rounded-lg shadow-lg text-white animate-slideUp z-50 toast ${type}">
            ${message}
        </div>
    `);
    
    const bgClass = {
        'success': 'bg-green-500',
        'error': 'bg-red-500',
        'warning': 'bg-orange-500',
        'info': 'bg-blue-500'
    }[type] || 'bg-green-500';
    
    toast.addClass(bgClass);
    $('body').append(toast);
    
    setTimeout(() => {
        toast.fadeOut(300, function() {
            $(this).remove();
        });
    }, 3000);
}
