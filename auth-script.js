// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

// Check which page we're on
const isLoginPage = !!loginForm;
const isSignupPage = !!signupForm;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Authentication page loaded');
    
    if (isLoginPage) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (isSignupPage) {
        signupForm.addEventListener('submit', handleSignup);
        
        // Password confirmation validation
        confirmPasswordInput.addEventListener('input', validatePasswords);
        passwordInput.addEventListener('input', validatePasswords);
    }
});

/**
 * Handle login form submission
 */
async function handleLogin(event) {
    event.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validation
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    // Email validation
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Disable button and show loading
    const submitBtn = loginForm.querySelector('.auth-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span>Signing In...';
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } else {
            showError(result.error || 'Login failed');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please try again.');
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

/**
 * Handle signup form submission
 */
async function handleSignup(event) {
    event.preventDefault();
    
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
        showError('Please fill in all fields');
        return;
    }
    
    if (username.length < 3) {
        showError('Username must be at least 3 characters');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    // Disable button and show loading
    const submitBtn = signupForm.querySelector('.auth-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span>Creating Account...';
    
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Account created successfully! Redirecting...');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } else {
            showError(result.error || 'Signup failed');
        }
        
    } catch (error) {
        console.error('Signup error:', error);
        showError('Network error. Please try again.');
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

/**
 * Validate passwords match
 */
function validatePasswords() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword && password !== confirmPassword) {
        confirmPasswordInput.style.borderColor = '#e53e3e';
        confirmPasswordInput.setCustomValidity('Passwords do not match');
    } else {
        confirmPasswordInput.style.borderColor = '#e2e8f0';
        confirmPasswordInput.setCustomValidity('');
    }
}

/**
 * Email validation helper
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show error message
 */
function showError(message) {
    removeMessages();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = isLoginPage ? loginForm : signupForm;
    form.parentNode.insertBefore(errorDiv, form.nextSibling);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

/**
 * Show success message
 */
function showSuccess(message) {
    removeMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const form = isLoginPage ? loginForm : signupForm;
    form.parentNode.insertBefore(successDiv, form.nextSibling);
}

/**
 * Remove existing messages
 */
function removeMessages() {
    const existingMessages = document.querySelectorAll('.error-message, .success-message');
    existingMessages.forEach(msg => msg.remove());
}

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Enter key submission
    if (event.key === 'Enter') {
        if (isLoginPage && !loginForm.querySelector('.auth-btn').disabled) {
            handleLogin(new Event('submit'));
        } else if (isSignupPage && !signupForm.querySelector('.auth-btn').disabled) {
            handleSignup(new Event('submit'));
        }
    }
    
    // Ctrl+L for login page, Ctrl+S for signup page
    if (event.ctrlKey) {
        if (event.key === 'l' || event.key === 'L') {
            event.preventDefault();
            if (!isLoginPage) {
                window.location.href = '/login';
            }
        } else if (event.key === 's' || event.key === 'S') {
            event.preventDefault();
            if (!isSignupPage) {
                window.location.href = '/signup';
            }
        }
    }
});

console.log('📝 Auth script loaded successfully');