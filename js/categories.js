// Category management functionality

// Global variables
let categories = [];

// Load categories from localStorage
function loadCategories() {
    const savedCategories = loadData('taskTracker_categories');
    if (savedCategories) {
        categories = savedCategories;
    }
    renderCategories();
}

// Save categories to localStorage
function saveCategories() {
    saveData('taskTracker_categories', categories);
}

// Toggle category expansion state
// Replace the existing toggleCategoryExpansion function with this:
function toggleCategoryExpansion(categoryId) {
    const categoryIndex = categories.findIndex(c => c.id === categoryId);
    if (categoryIndex === -1) return;
    
    // Toggle the expanded state
    categories[categoryIndex].isExpanded = !categories[categoryIndex].isExpanded;
    
    // Update the UI
    const categoryTasks = document.getElementById(`category-tasks-${categoryId}`);
    if (categoryTasks) {
        categoryTasks.style.display = categories[categoryIndex].isExpanded ? 'block' : 'none';
        
        // If we're expanding, render the tasks
        if (categories[categoryIndex].isExpanded) {
            const tasksContainer = document.getElementById(`category-tasks-list-${categoryId}`);
            const categoryTasks = tasks.filter(task => task.categoryId === categoryId);
            
            // Sort tasks by start date, newest first
            categoryTasks.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
            
            if (tasksContainer) {
                if (categoryTasks.length === 0) {
                    tasksContainer.innerHTML = '<p>No tasks in this category yet.</p>';
                } else {
                    tasksContainer.innerHTML = ''; // Clear existing content
                    categoryTasks.forEach(task => {
                        renderTask(task, tasksContainer);
                    });
                }
            }
        }
    }
    
    // Update the button text
    const toggleBtn = document.querySelector(`.category-toggle-btn[data-id="${categoryId}"]`);
    if (toggleBtn) {
        toggleBtn.textContent = categories[categoryIndex].isExpanded ? 'Collapse' : 'Expand';
    }
    
    // Save the updated state
    saveCategories();
}

// Render all categories and their tasks
function renderCategories() {
    const categoriesContainer = document.getElementById('categories-container');
    
    // Show empty state if no categories
    if (categories.length === 0) {
      categoriesContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-clipboard-list empty-icon"></i>
          <p>You don't have any categories or tasks yet.</p>
          <button id="empty-add-category-btn" class="btn btn-primary">
            <i class="fas fa-folder-plus"></i> Add Your First Category
          </button>
        </div>
      `;
      const emptyAddCategoryBtn = document.getElementById('empty-add-category-btn');
      if (emptyAddCategoryBtn) {
        emptyAddCategoryBtn.addEventListener('click', () => showModal('category-modal'));
      }
      return;
    }
    
    // Render categories
    categoriesContainer.innerHTML = '';
    
    categories.forEach(category => {
      const categoryTasks = tasks.filter(task => task.categoryId === category.id);
      
      // Sort tasks by start date, newest first
      categoryTasks.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      
      // Calculate category success rate and color
      const categorySuccessRate = calculateCategorySuccessRate(categoryTasks);
      const categoryColor = category.color || '#4361ee';
      
      // Check if category is expanded (default to true)
      const isExpanded = category.isExpanded !== false;
      const expandText = isExpanded ? 'Collapse' : 'Expand';
      
      const categoryElement = document.createElement('div');
      categoryElement.className = 'category';
      categoryElement.innerHTML = `
        <div class="category-header" style="background-color: ${categoryColor}">
          <div class="category-name">${category.name}</div>
          <div class="category-stats">
            <div class="stat">${categoryTasks.length} tasks</div>
            <div class="stat">${categorySuccessRate}% success rate</div>
            <button class="btn category-toggle-btn" data-id="${category.id}">${expandText}</button>
            <button class="btn edit-category-btn" data-id="${category.id}">Edit</button>
          </div>
        </div>
        <div class="category-content">
          <div class="chart-container">
            <canvas id="chart-${category.id}"></canvas>
          </div>
          <div id="category-tasks-${category.id}" class="category-tasks" style="display: ${isExpanded ? 'block' : 'none'}">
            <button class="btn btn-primary add-task-btn" data-category-id="${category.id}" style="margin-bottom: 10px;">
              <i class="fas fa-plus"></i> Add Task
            </button>
            <div id="category-tasks-list-${category.id}"></div>
          </div>
        </div>
      `;
      
      categoriesContainer.appendChild(categoryElement);
      
      // Add event listener for category toggle
      categoryElement.querySelector('.category-toggle-btn').addEventListener('click', function() {
        toggleCategoryExpansion(category.id);
      });
      
      // Add event listener for the "Add Task" button
      categoryElement.querySelector('.add-task-btn').addEventListener('click', function() {
        openAddTaskModal(this.dataset.categoryId);
      });
      
      // Create chart and render tasks
      createCategoryChart(category.id, categoryTasks);
      
      if (isExpanded) {
        const tasksContainer = document.getElementById(`category-tasks-list-${category.id}`);
        
        if (categoryTasks.length === 0) {
          tasksContainer.innerHTML = '<p>No tasks in this category yet.</p>';
        } else {
          categoryTasks.forEach(task => {
            renderTask(task, tasksContainer);
          });
        }
      }
    });
    
    // Add event listeners for edit category buttons
    document.querySelectorAll('.edit-category-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const categoryId = this.dataset.id;
        openEditCategoryModal(categoryId);
      });
    });
}

// Function to open the Add Task modal with pre-selected category
function openAddTaskModal(categoryId) {
    // Set the category in the dropdown
    const categorySelect = document.getElementById('category-select');
    if (categorySelect) {
        categorySelect.value = categoryId;
    } else {
        // If no dropdown (using hidden field instead)
        document.getElementById('modal-category-id').value = categoryId;
    }
    
    // Reset form fields
    document.getElementById('task-name').value = '';
    document.getElementById('task-start-date').value = getTodayFormatted();
    document.getElementById('task-color').value = '#4361ee';
    
    // Reset color picker selection
    document.querySelectorAll('#color-picker .color-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.color === '#4361ee') {
            option.classList.add('selected');
        }
    });
    
    // Show the task form modal
    showModal('task-form-modal');
}
// Open edit category modal
function openEditCategoryModal(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    document.getElementById('category-modal-title').textContent = 'Edit Category';
    document.getElementById('category-id').value = category.id;
    document.getElementById('category-name').value = category.name;
    
    // Set the category color
    const categoryColor = category.color || '#4361ee';
    document.getElementById('category-color').value = categoryColor;
    
    // Update the color picker selection
    document.querySelectorAll('#category-color-picker .color-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.color === categoryColor) {
            option.classList.add('selected');
        }
    });
    
    // Show the delete button
    document.getElementById('delete-category-btn').style.display = 'block';
    
    showModal('category-modal');
}

// Delete category and all its tasks
function deleteCategory(categoryId) {
    if (confirm('Are you sure you want to delete this category and all its tasks?')) {
        // Remove the category
        const categoryIndex = categories.findIndex(c => c.id === categoryId);
        if (categoryIndex !== -1) {
            categories.splice(categoryIndex, 1);
            saveCategories();
        }
        
        // Remove all tasks in the category
        tasks = tasks.filter(task => task.categoryId !== categoryId);
        saveTasks();
        
        // Update UI
        renderCategories();
        hideModal('category-modal');
    }
}

// Calculate category success rate
function calculateCategorySuccessRate(categoryTasks) {
    if (categoryTasks.length === 0) return 0;
    
    const totalSuccessRate = categoryTasks.reduce((sum, task) => {
        return sum + calculateTaskSuccessRate(task);
    }, 0);
    
    return Math.round(totalSuccessRate / categoryTasks.length);
}

// Create category progress chart
function createCategoryChart(categoryId, categoryTasks) {
    if (categoryTasks.length === 0) return;
    
    // Sort tasks by start date to find the earliest date
    const sortedTasks = [...categoryTasks].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const earliestStartDate = new Date(sortedTasks[0].startDate);
    
    // Calculate the maximum day range we need to cover
    const today = new Date();
    const totalDaysRange = Math.min(
        Math.ceil((today - earliestStartDate) / (1000 * 60 * 60 * 24)) + 1,
        60 // Cap at 60 days to prevent overly large charts
    );
    
    // Create labels for all days in the range
    const labels = [];
    for (let i = 0; i < totalDaysRange; i++) {
        const currentDate = new Date(earliestStartDate);
        currentDate.setDate(earliestStartDate.getDate() + i);
        labels.push(formatDate(currentDate));
    }
    
    // Initialize an array to track cumulative points for all tasks
    const cumulativePoints = Array(totalDaysRange).fill(0);
    
    // Calculate cumulative points for each task and add to the total
    categoryTasks.forEach(task => {
        if (!task.completionStatus) return;
        
        const taskStartDate = new Date(task.startDate);
        // Calculate the offset in days from the earliest task
        const dayOffset = Math.floor((taskStartDate - earliestStartDate) / (1000 * 60 * 60 * 24));
        
        // Add each day's points to the cumulative array
        Object.keys(task.completionStatus).forEach(dayIndex => {
            const absoluteDayIndex = parseInt(dayIndex) + dayOffset;
            
            // Make sure we don't go beyond our array bounds
            if (absoluteDayIndex >= 0 && absoluteDayIndex < totalDaysRange) {
                // Success adds 1, failure subtracts 1
                cumulativePoints[absoluteDayIndex] += task.completionStatus[dayIndex] === true ? 1 : -1;
            }
        });
    });
    
    // Calculate running total for cumulative effect
    for (let i = 1; i < cumulativePoints.length; i++) {
        cumulativePoints[i] += cumulativePoints[i - 1];
    }
    
    // Create chart
    const ctx = document.getElementById(`chart-${categoryId}`).getContext('2d');
    
    // Check if a chart already exists
    if (window.taskCharts && window.taskCharts[categoryId]) {
        window.taskCharts[categoryId].destroy();
    }
    
    // Initialize taskCharts object if it doesn't exist
    if (!window.taskCharts) {
        window.taskCharts = {};
    }
    
    // Get the category color
    const category = categories.find(c => c.id === categoryId);
    const categoryColor = category && category.color ? category.color : '#4361ee';
    
    // Create new chart
    window.taskCharts[categoryId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'All Tasks Combined',
                data: cumulativePoints,
                borderColor: categoryColor,
                backgroundColor: `${categoryColor}33`, // Add transparency for fill
                tension: 0.1, // Slight curve for the line
                pointBackgroundColor: categoryColor,
                pointRadius: 3,
                pointHoverRadius: 5,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Cumulative Points (Success +1, Fail -1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    ticks: {
                        maxTicksLimit: 10, // Limit the number of date labels shown
                        maxRotation: 45, // Rotate the labels
                        minRotation: 45 // Rotate the labels
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const points = context.raw;
                            return `Total points: ${points}`;
                        }
                    }
                }
            }
        }
    });
}

// Add category event handlers
function setupCategoryEventHandlers() {
    // Add category button
    document.getElementById('add-category-btn').addEventListener('click', () => {
        document.getElementById('category-modal-title').textContent = 'Add Category';
        document.getElementById('category-id').value = '';
        document.getElementById('category-name').value = '';
        
        // Initialize color picker
        document.getElementById('category-color').value = '#4361ee';
        document.querySelectorAll('#category-color-picker .color-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.color === '#4361ee') {
                option.classList.add('selected');
            }
        });
        
        // Hide delete button for new categories
        document.getElementById('delete-category-btn').style.display = 'none';
        
        showModal('category-modal');
    });

    // Category form submission
    document.getElementById('category-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const categoryId = document.getElementById('category-id').value;
        const categoryName = document.getElementById('category-name').value;
        const categoryColor = document.getElementById('category-color').value;
        
        if (!categoryName.trim()) return;
        
        // Edit existing category
        if (categoryId) {
            const categoryIndex = categories.findIndex(c => c.id === categoryId);
            if (categoryIndex !== -1) {
                categories[categoryIndex].name = categoryName;
                categories[categoryIndex].color = categoryColor;
            }
        } 
        // Add new category
        else {
            const newCategory = {
                id: generateId(),
                name: categoryName,
                color: categoryColor,
                isExpanded: true
            };
            categories.push(newCategory);
        }
        
        saveCategories();
        renderCategories();
        hideModal('category-modal');
    });
    
    // Cancel category button
    document.getElementById('cancel-category').addEventListener('click', function() {
        hideModal('category-modal');
    });
    
    // Delete category button
    document.getElementById('delete-category-btn').addEventListener('click', function() {
        const categoryId = document.getElementById('category-id').value;
        deleteCategory(categoryId);
    });
    
    // Close modal buttons
    document.querySelectorAll('.modal .close').forEach(btn => {
        btn.addEventListener('click', function() {
            hideModal(this.closest('.modal').id);
        });
    });

// Category color picker
document.querySelectorAll('#category-color-picker .color-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('#category-color-picker .color-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        this.classList.add('selected');
        document.getElementById('category-color').value = this.dataset.color;
    });
});
}