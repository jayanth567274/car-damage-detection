// DOM Elements
const uploadForm = document.getElementById('uploadForm');
const carImageInput = document.getElementById('carImage');
const uploadBtn = document.getElementById('uploadBtn');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsSection = document.getElementById('resultsSection');
const damagedPartEl = document.getElementById('damagedPart');
const estimatedCostEl = document.getElementById('estimatedCost');
const severityEl = document.getElementById('severity');
const resultMessageEl = document.getElementById('resultMessage');
const damageDescriptionEl = document.getElementById('damageDescription');
const damageLocationEl = document.getElementById('damageLocation');
const userInfo = document.getElementById('userInfo');
const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');
const noHistory = document.getElementById('noHistory');
const refreshHistoryBtn = document.getElementById('refreshHistory');

// Global variables
let currentUser = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚗 Car Damage Detection App Loaded');
    
    // Check authentication status
    await checkAuthStatus();
    
    // Handle file selection for preview
    carImageInput.addEventListener('change', handleImagePreview);
    
    // Handle form submission
    uploadForm.addEventListener('submit', handleImageUpload);
    
    // Handle history refresh
    if (refreshHistoryBtn) {
        refreshHistoryBtn.addEventListener('click', loadHistory);
    }
});

/**
 * Check user authentication status
 */
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/user');
        const result = await response.json();
        
        if (response.ok && result.user) {
            currentUser = result.user;
            updateUserInterface(true);
            loadHistory(); // Load history for authenticated user
        } else {
            updateUserInterface(false);
        }
    } catch (error) {
        console.error('Auth check error:', error);
        updateUserInterface(false);
    }
}

/**
 * Update user interface based on authentication status
 */
function updateUserInterface(isAuthenticated) {
    if (isAuthenticated && currentUser) {
        // Show user info
        userInfo.innerHTML = `
            <span class="welcome-text">Welcome, ${currentUser.username}</span>
            <button class="logout-btn" onclick="handleLogout()">Logout</button>
        `;
        userInfo.classList.remove('hidden');
        
        // Show history section
        if (historySection) {
            historySection.classList.remove('hidden');
        }
        
        // Enable upload form
        if (uploadForm) {
            uploadForm.style.opacity = '1';
            uploadForm.style.pointerEvents = 'auto';
        }
        
    } else {
        // Show login and signup links
        userInfo.innerHTML = `
            <a href="/login" class="login-link" style="margin-right: 10px;">Login</a>
            <a href="/signup" class="login-link">Sign Up</a>
        `;
        userInfo.classList.remove('hidden');
        
        // Hide history section
        if (historySection) {
            historySection.classList.add('hidden');
        }
        
        // Disable upload form
        if (uploadForm) {
            uploadForm.style.opacity = '0.5';
            uploadForm.style.pointerEvents = 'none';
        }
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            currentUser = null;
            updateUserInterface(false);
            window.location.reload();
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

/**
 * Handle image preview when file is selected
 */
function handleImagePreview(event) {
    const file = event.target.files[0];
    
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError('Please select a valid image file (JPG/PNG)');
            return;
        }
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            showError('File size exceeds 5MB limit');
            return;
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
        
        // Clear any previous errors
        clearError();
    }
}

/**
 * Handle image upload and damage detection
 */
async function handleImageUpload(event) {
    event.preventDefault();
    
    // Check if user is authenticated
    if (!currentUser) {
        showError('Please login to use this feature');
        window.location.href = '/login';
        return;
    }
    
    const file = carImageInput.files[0];
    
    // Validation
    if (!file) {
        showError('Please select an image file');
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file (JPG/PNG)');
        return;
    }
    
    // Show loading state
    showLoading();
    
    try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('carImage', file);
        
        // Send request to backend
        const response = await fetch('/api/detect-damage', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to process image');
        }
        
        // Display results
        displayResults(result);
        
        // Reload history
        loadHistory();
        
    } catch (error) {
        console.error('Upload error:', error);
        showError(`Error: ${error.message}`);
    } finally {
        hideLoading();
    }
}

/**
 * Display detection results
 */
function displayResults(data) {
    // Update result elements
    damagedPartEl.textContent = data.damagedPart || '-';
    estimatedCostEl.textContent = data.estimatedCost || '-';
    severityEl.textContent = data.severity || '-';
    resultMessageEl.textContent = data.message || 'Analysis complete';
    
    // Update detailed information if available
    if (data.damageDescription) {
        damageDescriptionEl.textContent = data.damageDescription;
    } else {
        damageDescriptionEl.textContent = '-';
    }
    
    if (data.damageLocation) {
        damageLocationEl.textContent = data.damageLocation;
    } else {
        damageLocationEl.textContent = '-';
    }
    
    // Add severity-based styling
    severityEl.className = 'result-value severity';
    if (data.severity === 'Severe') {
        severityEl.style.color = '#e53e3e';
    } else if (data.severity === 'Moderate') {
        severityEl.style.color = '#d69e2e';
    } else {
        severityEl.style.color = '#38a169';
    }
    
    // Show results section
    resultsSection.classList.remove('hidden');
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    console.log('✅ Results displayed:', data);
}

/**
 * Load user detection history
 */
async function loadHistory() {
    if (!currentUser) return;
    
    try {
        const response = await fetch('/api/history');
        const result = await response.json();
        
        if (response.ok) {
            displayHistory(result.history);
        } else {
            throw new Error(result.error || 'Failed to load history');
        }
    } catch (error) {
        console.error('History load error:', error);
        showError('Failed to load history');
    }
}

/**
 * Display history items
 */
function displayHistory(historyItems) {
    if (!historyItems || historyItems.length === 0) {
        historyList.classList.add('hidden');
        noHistory.classList.remove('hidden');
        return;
    }
    
    historyList.classList.remove('hidden');
    noHistory.classList.add('hidden');
    
    historyList.innerHTML = historyItems.map(item => `
        <div class="history-item">
            <div class="history-header">
                <div class="history-part">${item.damagedPart}</div>
                <div>
                    <span class="history-date">${new Date(item.timestamp).toLocaleDateString()}</span>
                    <button class="delete-history-btn" onclick="deleteHistoryItem(${item.id})" title="Delete">×</button>
                </div>
            </div>
            <div class="history-details">
                <div class="history-detail-item">
                    <h4>Estimated Cost</h4>
                    <p class="history-cost">${item.estimatedCost}</p>
                </div>
                <div class="history-detail-item">
                    <h4>Severity</h4>
                    <p class="history-severity">${item.severity}</p>
                </div>
            </div>
            <div class="history-description">
                <small>${item.damageDescription || ''}</small>
            </div>
        </div>
    `).join('');
}

/**
 * Delete history item
 */
async function deleteHistoryItem(id) {
    if (!confirm('Are you sure you want to delete this history record?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/history/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            loadHistory(); // Refresh history
            showSuccess('History record deleted successfully');
        } else {
            throw new Error(result.error || 'Failed to delete record');
        }
    } catch (error) {
        console.error('Delete history error:', error);
        showError('Failed to delete history record');
    }
}

/**
 * Show loading indicator
 */
function showLoading() {
    loadingIndicator.classList.remove('hidden');
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<span class="btn-text">🔄 Analyzing...</span>';
    
    // Hide previous results
    resultsSection.classList.add('hidden');
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    loadingIndicator.classList.add('hidden');
    uploadBtn.disabled = false;
    uploadBtn.innerHTML = '<span class="btn-text">🔍 Detect Damage</span>';
}

/**
 * Show error message
 */
function showError(message) {
    // Create error element if it doesn't exist
    let errorEl = document.querySelector('.error-message');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.style.cssText = `
            color: #e53e3e;
            background: #fed7d7;
            border: 1px solid #feb2b2;
            border-radius: 8px;
            padding: 12px;
            margin: 15px 0;
            text-align: center;
            font-weight: 500;
        `;
        uploadForm.appendChild(errorEl);
    }
    
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 5000);
}

/**
 * Show success message
 */
function showSuccess(message) {
    // Create success element if it doesn't exist
    let successEl = document.querySelector('.success-message');
    if (!successEl) {
        successEl = document.createElement('div');
        successEl.className = 'success-message';
        successEl.style.cssText = `
            color: #38a169;
            background: #c6f6d5;
            border: 1px solid #9ae6b4;
            border-radius: 8px;
            padding: 12px;
            margin: 15px 0;
            text-align: center;
            font-weight: 500;
        `;
        uploadForm.appendChild(successEl);
    }
    
    successEl.textContent = message;
    successEl.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        successEl.style.display = 'none';
    }, 3000);
}

/**
 * Clear error messages
 */
function clearError() {
    const errorEl = document.querySelector('.error-message');
    if (errorEl) {
        errorEl.style.display = 'none';
    }
}

/**
 * Reset form and results
 */
function resetForm() {
    uploadForm.reset();
    imagePreview.classList.add('hidden');
    resultsSection.classList.add('hidden');
    clearError();
}

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Ctrl+Enter to submit
    if (event.ctrlKey && event.key === 'Enter' && !uploadBtn.disabled) {
        handleImageUpload(new Event('submit'));
    }
    
    // Ctrl+H to refresh history
    if (event.ctrlKey && event.key === 'h' && currentUser) {
        event.preventDefault();
        loadHistory();
    }
});

console.log('📝 Enhanced script loaded successfully');