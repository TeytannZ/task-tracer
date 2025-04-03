// Sync functionality for Task Tracker application

// Set up listeners for real-time updates
function setupSyncListeners() {
    // Listen for category changes
    database.ref('categories').on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        categories = Object.values(data);
        renderCategories();
      }
    });
  
    // Listen for task changes
    database.ref('tasks').on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        tasks = Object.values(data);
        renderCategories();
      }
    });
  }
  
  // Save categories to Firebase
  function syncCategories() {
    database.ref('categories').set(
      categories.reduce((acc, category) => {
        acc[category.id] = category;
        return acc;
      }, {})
    );
  }
  
  // Save tasks to Firebase
  function syncTasks() {
    database.ref('tasks').set(
      tasks.reduce((acc, task) => {
        acc[task.id] = task;
        return acc;
      }, {})
    );
  }
  
  // Modify existing functions to use Firebase
  function saveCategories() {
    // Still save to localStorage as backup
    saveData('taskTracker_categories', categories);
    // Sync to Firebase
    syncCategories();
  }
  
  function saveTasks() {
    // Still save to localStorage as backup
    saveData('taskTracker_tasks', tasks);
    // Sync to Firebase
    syncTasks();
  }
  
  function loadCategories() {
    // First try to load from localStorage
    const savedCategories = loadData('taskTracker_categories');
    if (savedCategories) {
      categories = savedCategories;
    }
    
    // Then check Firebase
    database.ref('categories').once('value').then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        categories = Object.values(data);
        renderCategories();
      } else if (categories.length > 0) {
        // If we have categories from localStorage but not in Firebase, sync them
        syncCategories();
      }
    });
  }
  
  function loadTasks() {
    // First try to load from localStorage
    const savedTasks = loadData('taskTracker_tasks');
    if (savedTasks) {
      tasks = savedTasks;
    }
    
    // Then check Firebase
    database.ref('tasks').once('value').then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        tasks = Object.values(data);
        renderCategories();
      } else if (tasks.length > 0) {
        // If we have tasks from localStorage but not in Firebase, sync them
        syncTasks();
      }
    });
  }