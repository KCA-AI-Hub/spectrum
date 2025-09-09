// Main JavaScript for Flask Application

// Global Variables
let currentUser = null;
let currentCharacter = 'llama';

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    // Check authentication
    checkAuthentication();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Load user preferences
    loadUserPreferences();
}

// Check Authentication Status
function checkAuthentication() {
    // This would typically check with the server
    // For now, we'll check if we're on a protected page
    const protectedPages = ['/dashboard', '/video'];
    const currentPath = window.location.pathname;
    
    if (protectedPages.some(page => currentPath.includes(page))) {
        // User is on a protected page, so they must be authenticated
        console.log('User is authenticated');
    }
}

// Initialize Event Listeners
function initializeEventListeners() {
    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
    
    // Input validation
    const inputs = document.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateInput);
    });
    
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', smoothScroll);
    });
}

// Form Submit Handler
function handleFormSubmit(event) {
    const form = event.target;
    
    // Validate all required fields
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateInput({ target: field })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        event.preventDefault();
        return false;
    }
    
    // Show loading state
    const submitButton = form.querySelector('[type="submit"]');
    if (submitButton) {
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <span class="flex items-center justify-center">
                ${originalText}
                <span class="ml-2">
                    <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                </span>
            </span>
        `;
    }
}

// Input Validation
function validateInput(event) {
    const input = event.target;
    const value = input.value.trim();
    const isValid = value.length > 0;
    
    // Update UI based on validation
    if (isValid) {
        input.classList.remove('border-danger');
        input.classList.add('border-success');
        hideError(input);
    } else {
        input.classList.add('border-danger');
        input.classList.remove('border-success');
        showError(input, '이 필드는 필수입니다.');
    }
    
    return isValid;
}

// Show Error Message
function showError(input, message) {
    let errorElement = input.nextElementSibling;
    
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message text-danger text-sm mt-1';
        input.parentNode.insertBefore(errorElement, input.nextSibling);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Hide Error Message
function hideError(input) {
    const errorElement = input.nextElementSibling;
    
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.style.display = 'none';
    }
}

// Smooth Scroll
function smoothScroll(event) {
    event.preventDefault();
    
    const targetId = event.target.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Load User Preferences
function loadUserPreferences() {
    // Load from localStorage or session
    const savedCharacter = localStorage.getItem('selectedCharacter');
    if (savedCharacter) {
        currentCharacter = savedCharacter;
    }
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
}

// Save User Preferences
function saveUserPreferences() {
    localStorage.setItem('selectedCharacter', currentCharacter);
}

// API Helper Functions
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        showNotification('요청 처리 중 오류가 발생했습니다.', 'error');
        throw error;
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="notification-icon">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        background: ${type === 'success' ? 'rgba(152, 195, 121, 0.9)' : type === 'error' ? 'rgba(224, 108, 117, 0.9)' : 'rgba(86, 182, 194, 0.9)'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Export functions for use in templates
window.apiRequest = apiRequest;
window.showNotification = showNotification;
window.formatDate = formatDate;
window.formatTime = formatTime;