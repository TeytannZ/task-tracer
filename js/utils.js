// utils.js - Utility functions for Task Tracker application

// Generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date for display (Month DD, YYYY)
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Format date as YYYY-MM-DD
function formatDateYYYYMMDD(date) {
    return date.toISOString().split('T')[0];
}

// Get today's date in YYYY-MM-DD format
function getTodayFormatted() {
    const today = new Date();
    return formatDateYYYYMMDD(today);
}

// Set a default date for task start (today)
function setDefaultDate() {
    const taskStartDate = document.getElementById('task-start-date');
    if (taskStartDate) {
        taskStartDate.value = getTodayFormatted();
    }
}

// Save data to localStorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Load data from localStorage
function loadData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// Show modal
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

// Hide modal
function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}