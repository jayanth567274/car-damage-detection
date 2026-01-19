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

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚗 Car Damage Detection App Loaded');
    
    // Handle file selection for preview
    carImageInput.addEventListener('change', handleImagePreview);
    
    // Handle form submission
    uploadForm.addEventListener('submit', handleImageUpload);
});

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

// Optional: Add keyboard shortcut (Ctrl+Enter) to submit
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'Enter' && !uploadBtn.disabled) {
        handleImageUpload(new Event('submit'));
    }
});

console.log('📝 Script loaded successfully');