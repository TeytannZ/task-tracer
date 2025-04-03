// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Load data
    loadCategories();
    loadTasks();
    
    // Set default date for new tasks
    setDefaultDate();
    
    // Set up event handlers
    setupCategoryEventHandlers();
    setupTaskEventHandlers();
    
    // Set up sync listeners for real-time updates
    setupSyncListeners();
    
    // Initial rendering
    renderCategories();
  });
  
  // Handle clicks outside of modals to close them
  window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
      hideModal(event.target.id);
    }
  });