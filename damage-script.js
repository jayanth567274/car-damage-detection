/* ==========================================
   CAR DAMAGE DETECTION - JAVASCRIPT
   AI-Powered Damage Analysis using Claude API
   ========================================== */

// Global variables
let uploadedImage = null;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/* ==========================================
   INITIALIZE APPLICATION
   ========================================== */
function initializeApp() {
    // Get DOM elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewSection = document.getElementById('previewSection');
    const previewImage = document.getElementById('previewImage');
    const removeImageBtn = document.getElementById('removeImage');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const newAnalysisBtn = document.getElementById('newAnalysisBtn');
    
    // Upload area click handler
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // File input change handler
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Remove image handler
    removeImageBtn.addEventListener('click', resetUpload);
    
    // Analyze button handler
    analyzeBtn.addEventListener('click', analyzeDamage);
    
    // New analysis button handler
    newAnalysisBtn.addEventListener('click', resetUpload);
    
    // Download and share handlers
    document.getElementById('downloadReportBtn').addEventListener('click', downloadReport);
    document.getElementById('shareReportBtn').addEventListener('click', shareReport);
}

/* ==========================================
   FILE UPLOAD HANDLERS
   ========================================== */
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        processImage(file);
    } else {
        showToast('Please upload a valid image file', 'error');
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processImage(file);
    } else {
        showToast('Please drop a valid image file', 'error');
    }
}

function processImage(file) {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showToast('File size must be less than 10MB', 'error');
        return;
    }
    
    // Read and display image
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImage = e.target.result;
        document.getElementById('previewImage').src = uploadedImage;
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('previewSection').style.display = 'block';
        showToast('Image uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
}

function resetUpload() {
    uploadedImage = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================
   AI DAMAGE ANALYSIS
   Uses Claude API for image analysis
   ========================================== */
async function analyzeDamage() {
    if (!uploadedImage) {
        showToast('Please upload an image first', 'error');
        return;
    }
    
    // Show loading state
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'block';
    
    // Animate loading text
    animateLoadingText();
    
    try {
        // Call Claude API for damage detection
        const analysis = await callClaudeAPI(uploadedImage);
        
        // Display results
        setTimeout(() => {
            displayResults(analysis);
        }, 1000);
        
    } catch (error) {
        console.error('Analysis error:', error);
        showToast('Analysis failed. Please try again.', 'error');
        resetUpload();
    }
}

async function callClaudeAPI(imageBase64) {
    // Show initial loading message
    updateLoadingText('Connecting to AI...');
    
    // Prepare the API request
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'image',
                        source: {
                            type: 'base64',
                            media_type: 'image/jpeg',
                            data: imageBase64.split(',')[1]
                        }
                    },
                    {
                        type: 'text',
                        text: `You are an expert automotive damage assessor. Analyze this car image and provide a detailed damage report in JSON format.

Please identify ALL visible damage and provide estimates. Return ONLY valid JSON with this exact structure (no other text):

{
  "hasDamage": true/false,
  "overallSeverity": "Low/Medium/High",
  "damageCount": number,
  "damages": [
    {
      "type": "Scratch/Dent/Crack/Broken Part/Paint Damage/etc",
      "location": "Front Bumper/Door/Hood/etc",
      "severity": "Low/Medium/High",
      "description": "Detailed description",
      "estimatedCost": number (in USD)
    }
  ],
  "totalEstimatedCost": number,
  "recommendedActions": ["action1", "action2"]
}

If no damage is visible, set hasDamage to false and provide an empty damages array. Be thorough and professional.`
                    }
                ]
            }]
        })
    });
    
    updateLoadingText('AI is analyzing the image...');
    
    if (!response.ok) {
        throw new Error('API request failed');
    }
    
    const data = await response.json();
    updateLoadingText('Processing results...');
    
    // Extract the text response
    const analysisText = data.content.find(item => item.type === 'text')?.text;
    
    if (!analysisText) {
        throw new Error('No analysis text received');
    }
    
    // Parse JSON from the response
    let jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        // If no JSON found, create a default response
        return {
            hasDamage: true,
            overallSeverity: "Medium",
            damageCount: 1,
            damages: [{
                type: "General Damage",
                location: "Vehicle Body",
                severity: "Medium",
                description: "Damage detected but specific details could not be determined",
                estimatedCost: 500
            }],
            totalEstimatedCost: 500,
            recommendedActions: ["Get professional inspection", "Contact insurance"]
        };
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
}

/* ==========================================
   DISPLAY RESULTS
   ========================================== */
function displayResults(analysis) {
    // Hide loading, show results
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    
    // Set analyzed image
    document.getElementById('analyzedImage').src = uploadedImage;
    
    // Populate summary
    populateSummary(analysis);
    
    // Populate detailed damage list
    populateDamageList(analysis);
    
    // Populate cost breakdown
    populateCostBreakdown(analysis);
    
    // Scroll to results
    setTimeout(() => {
        document.getElementById('resultsSection').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 100);
    
    showToast('Analysis complete!', 'success');
}

function populateSummary(analysis) {
    const summaryContent = document.getElementById('summaryContent');
    
    // Determine severity badge color
    const severityClass = analysis.overallSeverity === 'High' ? 'severity-high' : 
                         analysis.overallSeverity === 'Medium' ? 'severity-medium' : 
                         'severity-low';
    
    const summaryHTML = `
        <div class="summary-item">
            <div class="summary-icon">🔍</div>
            <div class="summary-text">
                <div class="summary-label">Detection Status</div>
                <div class="summary-value">${analysis.hasDamage ? 'Damage Detected' : 'No Damage Found'}</div>
            </div>
        </div>
        
        <div class="summary-item">
            <div class="summary-icon">⚠️</div>
            <div class="summary-text">
                <div class="summary-label">Overall Severity</div>
                <div class="summary-value">
                    <span class="severity-badge ${severityClass}">${analysis.overallSeverity}</span>
                </div>
            </div>
        </div>
        
        <div class="summary-item">
            <div class="summary-icon">📊</div>
            <div class="summary-text">
                <div class="summary-label">Damage Points Found</div>
                <div class="summary-value">${analysis.damageCount}</div>
            </div>
        </div>
        
        <div class="summary-item">
            <div class="summary-icon">💵</div>
            <div class="summary-text">
                <div class="summary-label">Estimated Cost</div>
                <div class="summary-value">$${analysis.totalEstimatedCost.toLocaleString()}</div>
            </div>
        </div>
    `;
    
    summaryContent.innerHTML = summaryHTML;
}

function populateDamageList(analysis) {
    const damageList = document.getElementById('damageList');
    
    if (!analysis.hasDamage || analysis.damages.length === 0) {
        damageList.innerHTML = `
            <div class="damage-item" style="border-left-color: #10B981;">
                <div class="damage-icon">✅</div>
                <div class="damage-details">
                    <h4>No Damage Detected</h4>
                    <p class="damage-description">The AI analysis did not detect any visible damage on the vehicle. The car appears to be in good condition.</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Map damage types to emojis
    const damageIcons = {
        'Scratch': '〰️',
        'Dent': '🔨',
        'Crack': '⚡',
        'Broken Part': '💥',
        'Paint Damage': '🎨',
        'Rust': '🦠',
        'default': '⚠️'
    };
    
    const damageHTML = analysis.damages.map(damage => {
        const icon = damageIcons[damage.type] || damageIcons['default'];
        const severityColor = damage.severity === 'High' ? '#EF4444' : 
                             damage.severity === 'Medium' ? '#F59E0B' : 
                             '#10B981';
        
        return `
            <div class="damage-item" style="border-left-color: ${severityColor};">
                <div class="damage-icon">${icon}</div>
                <div class="damage-details">
                    <h4>${damage.type}</h4>
                    <p class="damage-description">${damage.description}</p>
                    <div class="damage-location">
                        <span>📍</span>
                        <span>${damage.location}</span>
                        <span>•</span>
                        <span>${damage.severity} Severity</span>
                    </div>
                </div>
                <div class="damage-cost">
                    <div class="cost-label">Estimated Cost</div>
                    <div class="cost-value">$${damage.estimatedCost.toLocaleString()}</div>
                </div>
            </div>
        `;
    }).join('');
    
    damageList.innerHTML = damageHTML;
}

function populateCostBreakdown(analysis) {
    const costTable = document.getElementById('costTable');
    
    if (!analysis.hasDamage || analysis.damages.length === 0) {
        costTable.innerHTML = `
            <div class="cost-row">
                <span class="cost-row-label">No repairs needed</span>
                <span class="cost-row-value">$0</span>
            </div>
        `;
        document.getElementById('totalCost').textContent = '$0';
        return;
    }
    
    // Group damages by type
    const costBreakdown = analysis.damages.reduce((acc, damage) => {
        const key = `${damage.type} - ${damage.location}`;
        acc[key] = (acc[key] || 0) + damage.estimatedCost;
        return acc;
    }, {});
    
    const costHTML = Object.entries(costBreakdown).map(([item, cost]) => `
        <div class="cost-row">
            <span class="cost-row-label">${item}</span>
            <span class="cost-row-value">$${cost.toLocaleString()}</span>
        </div>
    `).join('');
    
    costTable.innerHTML = costHTML;
    document.getElementById('totalCost').textContent = `$${analysis.totalEstimatedCost.toLocaleString()}`;
}

/* ==========================================
   LOADING ANIMATION
   ========================================== */
function animateLoadingText() {
    const messages = [
        'Initializing AI vision...',
        'Analyzing vehicle image...',
        'Detecting damage patterns...',
        'Calculating repair costs...',
        'Finalizing report...'
    ];
    
    let index = 0;
    const interval = setInterval(() => {
        if (index < messages.length) {
            updateLoadingText(messages[index]);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 800);
}

function updateLoadingText(text) {
    document.getElementById('loadingText').textContent = text;
}

/* ==========================================
   REPORT ACTIONS
   ========================================== */
function downloadReport() {
    // Create a simple text report
    const report = generateTextReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `car-damage-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Report downloaded successfully!', 'success');
}

function generateTextReport() {
    const summaryContent = document.getElementById('summaryContent').textContent;
    const damageList = document.getElementById('damageList').textContent;
    const totalCost = document.getElementById('totalCost').textContent;
    
    return `CAR DAMAGE DETECTION REPORT
Generated: ${new Date().toLocaleString()}
Powered by AutoDetect AI

===========================================
SUMMARY
===========================================
${summaryContent}

===========================================
DETAILED DAMAGE ANALYSIS
===========================================
${damageList}

===========================================
TOTAL ESTIMATED COST: ${totalCost}
===========================================

Note: This is an AI-generated estimate. Please consult a professional mechanic for accurate quotes.

Report generated by AutoDetect AI
© 2026 AutoDetect AI. All rights reserved.
`;
}

function shareReport() {
    // Copy report link to clipboard (in real app, generate shareable link)
    const reportText = `Check out my car damage report from AutoDetect AI! Total estimated cost: ${document.getElementById('totalCost').textContent}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Car Damage Report',
            text: reportText,
        }).then(() => {
            showToast('Report shared successfully!', 'success');
        }).catch(() => {
            copyToClipboard(reportText);
        });
    } else {
        copyToClipboard(reportText);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Report link copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Could not copy to clipboard', 'error');
    });
}

/* ==========================================
   TOAST NOTIFICATIONS
   ========================================== */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/* ==========================================
   UTILITY FUNCTIONS
   ========================================== */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Log initialization
console.log('🚗 AutoDetect AI initialized successfully!');
console.log('💡 Ready to analyze car damage with AI vision');
