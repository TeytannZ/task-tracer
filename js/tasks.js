// Task management functionality

// Global variables
let tasks = [];
// Task form modal cancel button
document.getElementById('cancel-task').addEventListener('click', function() {
    hideModal('task-form-modal');
});

// Task edit form modal cancel button
document.getElementById('cancel-edit-task').addEventListener('click', function() {
    hideModal('task-edit-modal');
});

// Populate category select dropdown
function populateCategorySelect() {
    const categorySelect = document.getElementById('category-select');
    if (categorySelect) {
        categorySelect.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
}

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = loadData('taskTracker_tasks');
    if (savedTasks) {
        tasks = savedTasks;
    }
}

// Save tasks to localStorage
function saveTasks() {
    saveData('taskTracker_tasks', tasks);
}

// Render a single task
function renderTask(task, container) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task';
    taskElement.style.borderLeft = `4px solid ${task.color}`;
    
    // Check if task is collapsed
    const isCollapsed = task.isCollapsed === true;
    const collapseText = isCollapsed ? 'Expand' : 'Collapse';
    const displayStyle = isCollapsed ? 'none' : 'block';
    
    const successRate = calculateTaskSuccessRate(task);
    const points = calculateTaskPoints(task);
    
    taskElement.innerHTML = `
        <div class="task-info">
            <div class="task-name">${task.name}</div>
            <div class="task-date">Started on ${formatDate(task.startDate)}</div>
            <div class="task-success" style="color: ${task.color}">
                ${successRate}% success rate | Points: ${points}
            </div>
        </div>
        <div class="task-actions">
            <button class="btn btn-toggle" data-id="${task.id}">${collapseText}</button>
            <button class="btn btn-primary edit-task-btn" data-id="${task.id}">Edit</button>
        </div>
        <div class="task-details" style="display: ${displayStyle}; grid-column: 1 / -1; margin-top: 10px;">
            <div class="task-calendar">
                <div class="calendar-header">
                    ${getDaysOfWeek().map(day => `<div class="calendar-day-header">${day}</div>`).join('')}
                </div>
                <div class="calendar-grid" id="calendar-${task.id}">
                    ${generateCalendarDays(task).map(day => day).join('')}
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(taskElement);
    
    // Add event listener to calendar days
    const calendarGrid = taskElement.querySelector(`#calendar-${task.id}`);
    if (calendarGrid) {
        calendarGrid.querySelectorAll('.calendar-day:not(.disabled)').forEach(dayElement => {
            dayElement.addEventListener('click', function() {
                const dayIndex = parseInt(this.dataset.day);
                toggleDayStatus(task.id, dayIndex);
            });
        });
    }
    
    // Add event listener to edit button
    taskElement.querySelector('.edit-task-btn').addEventListener('click', function() {
        openEditTaskModal(task.id);
    });
    
    // Add event listener to collapse/expand button
    taskElement.querySelector('.btn-toggle').addEventListener('click', function() {
        toggleTaskCollapse(task.id);
    });
}

// Toggle task collapse state
function toggleTaskCollapse(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    // Toggle the collapsed state
    tasks[taskIndex].isCollapsed = !tasks[taskIndex].isCollapsed;
    
    // Save and re-render
    saveTasks();
    renderCategories();
}

// Calculate category statistics for graph
function calculateCategoryStats(categoryId) {
    const categoryTasks = tasks.filter(task => task.categoryId === categoryId);
    const stats = {
        totalTasks: categoryTasks.length,
        totalPoints: 0,
        totalSuccessRate: 0,
        dailyData: Array(30).fill(0)
    };
    
    if (categoryTasks.length === 0) return stats;
    
    // Calculate total points and average success rate
    categoryTasks.forEach(task => {
        stats.totalPoints += calculateTaskPoints(task);
        stats.totalSuccessRate += calculateTaskSuccessRate(task);
        
        // Aggregate daily data for graph
        if (task.completionStatus) {
            for (let i = 0; i < 30; i++) {
                if (task.completionStatus[i] === true) {
                    stats.dailyData[i]++;
                } else if (task.completionStatus[i] === false) {
                    stats.dailyData[i]--;
                }
            }
        }
    });
    
    stats.totalSuccessRate = Math.round(stats.totalSuccessRate / categoryTasks.length);
    
    return stats;
}

// Generate category graph HTML
function generateCategoryGraph(categoryId) {
    const stats = calculateCategoryStats(categoryId);
    
    // Find max value for scaling
    const maxValue = Math.max(1, ...stats.dailyData.map(v => Math.abs(v)));
    
    const graphHTML = `
        <div class="category-graph">
            <div class="graph-header">
                <span>Category Performance</span>
                <span>${stats.totalPoints} points | ${stats.totalSuccessRate}% success rate</span>
            </div>
            <div class="graph-container">
                ${stats.dailyData.map((value, index) => {
                    const height = Math.abs(value) / maxValue * 80;
                    const barClass = value >= 0 ? 'positive' : 'negative';
                    return `<div class="graph-bar ${barClass}" style="height: ${height}px;" title="Day ${index+1}: ${value} points"></div>`;
                }).join('')}
            </div>
        </div>
    `;
    
    return graphHTML;
}

// Open edit task modal
function openEditTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-category-id').value = task.categoryId;
    document.getElementById('edit-task-name').value = task.name;
    document.getElementById('edit-task-start-date').value = task.startDate;
    document.getElementById('edit-task-color').value = task.color;
    
    // Update the color picker selection
    document.querySelectorAll('#edit-color-picker .color-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.color === task.color) {
            option.classList.add('selected');
        }
    });
    
    showModal('task-edit-modal');
}

// Get days of week for calendar header
function getDaysOfWeek() {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}

// Generate calendar days for a task
function generateCalendarDays(task) {
    const today = new Date();
    const startDate = new Date(task.startDate);
    const days = [];
    
    // Calculate end date (30 days from start)
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);
    
    // Get day of week of the start date to determine offset
    const startDay = startDate.getDay();
    
    // Add empty cells for days before start date
    for (let i = 0; i < startDay; i++) {
        days.push(`<div class="calendar-day disabled"></div>`);
    }
    
    // Add 30 days from start date
    for (let i = 0; i < 30; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        // Determine if this date is in the future
        const isFuture = currentDate > today;
        
        // Get status of this day from task completion status
        let status = 'neutral';
        if (!isFuture && task.completionStatus && task.completionStatus[i] !== undefined) {
            status = task.completionStatus[i] ? 'success' : 'fail';
        }
        
        const dayClass = isFuture ? 'calendar-day disabled' : `calendar-day ${status}`;
        
        days.push(`<div class="${dayClass}" data-day="${i}">${currentDate.getDate()}</div>`);
    }
    
    return days;
}

// Toggle day status (success/fail/neutral)
function toggleDayStatus(taskId, dayIndex) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    
    // Initialize completion status if it doesn't exist
    if (!task.completionStatus) {
        task.completionStatus = {};
    }
    
    // Cycle through statuses: neutral (undefined) -> success -> fail -> neutral
    if (task.completionStatus[dayIndex] === undefined) {
        task.completionStatus[dayIndex] = true; // success
    } else if (task.completionStatus[dayIndex] === true) {
        task.completionStatus[dayIndex] = false; // fail
    } else {
        delete task.completionStatus[dayIndex]; // back to neutral
    }
    
    // Save tasks
    saveTasks();
    
    // Instead of re-rendering everything, just update the specific task's calendar
    updateTaskCalendar(task);
    
    // Update category chart without full re-render
    updateCategoryChart(task.categoryId);
}

// New function to update just a single task's calendar
function updateTaskCalendar(task) {
    // Find the calendar grid for this task
    const calendarGrid = document.getElementById(`calendar-${task.id}`);
    if (!calendarGrid) return;
    
    // Update each day's status in the existing calendar
    calendarGrid.querySelectorAll('.calendar-day:not(.disabled)').forEach(dayElement => {
        const dayIndex = parseInt(dayElement.dataset.day);
        
        // Remove existing status classes
        dayElement.classList.remove('success', 'fail', 'neutral');
        
        // Determine the new status class
        let status = 'neutral';
        if (task.completionStatus && task.completionStatus[dayIndex] !== undefined) {
            status = task.completionStatus[dayIndex] ? 'success' : 'fail';
        }
        
        // Add the new status class
        dayElement.classList.add(status);
    });
    
    // Update task success rate and points display
    const taskElement = calendarGrid.closest('.task');
    if (taskElement) {
        const successRate = calculateTaskSuccessRate(task);
        const points = calculateTaskPoints(task);
        
        const taskSuccessElement = taskElement.querySelector('.task-success');
        if (taskSuccessElement) {
            taskSuccessElement.innerHTML = `${successRate}% success rate | Points: ${points}`;
        }
    }
}

// New function to update just the category chart
function updateCategoryChart(categoryId) {
    const categoryTasks = tasks.filter(task => task.categoryId === categoryId);
    createCategoryChart(categoryId, categoryTasks);
}

// Calculate task success rate (only count days up to current date)
function calculateTaskSuccessRate(task) {
    if (!task.completionStatus) return 0;
    
    const today = new Date();
    const startDate = new Date(task.startDate);
    
    // Calculate how many days have passed since the start date (up to 30)
    let daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1; // +1 to include today
    daysPassed = Math.min(Math.max(0, daysPassed), 30);
    
    if (daysPassed === 0) return 0;
    
    // Count successful days
    let successfulDays = 0;
    for (let i = 0; i < daysPassed; i++) {
        if (task.completionStatus[i] === true) {
            successfulDays++;
        }
    }
    
    return Math.round((successfulDays / daysPassed) * 100);
}

// Calculate task points score (success = +1, fail = -1)
function calculateTaskPoints(task) {
    if (!task.completionStatus) return 0;
    
    let points = 0;
    
    // Calculate points based on completion status
    for (const day in task.completionStatus) {
        if (task.completionStatus[day] === true) {
            points += 1; // Success days add 1 point
        } else if (task.completionStatus[day] === false) {
            points -= 1; // Fail days subtract 1 point
        }
    }
    
    return points;
}

// Setup task event handlers
function setupTaskEventHandlers() {
    // Task form submission
    // Task form submission - Improved handling
document.getElementById('task-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Try to get category from either the select dropdown or the hidden field
    let categoryId = document.getElementById('category-select')?.value;
    if (!categoryId) {
        categoryId = document.getElementById('modal-category-id')?.value;
    }
    
    const taskName = document.getElementById('task-name').value;
    const startDate = document.getElementById('task-start-date').value;
    const taskColor = document.getElementById('task-color').value;
    
    if (!categoryId || !taskName.trim() || !startDate) {
        alert("Please fill in all required fields");
        return;
    }
    
    const newTask = {
        id: generateId(),
        categoryId,
        name: taskName,
        startDate,
        color: taskColor,
        completionStatus: {},
        isCollapsed: false
    };
    
    tasks.push(newTask);
    saveTasks();
    
    // Reset form
    this.reset();
    setDefaultDate();
    
    // Reset color picker
    document.getElementById('task-color').value = '#4361ee';
    document.querySelectorAll('#color-picker .color-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.color === '#4361ee') {
            option.classList.add('selected');
        }
    });
    
    renderCategories();
    hideModal('task-form-modal');
});
    
    // Task edit form submission
    document.getElementById('task-edit-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const taskId = document.getElementById('edit-task-id').value;
        const taskName = document.getElementById('edit-task-name').value;
        const startDate = document.getElementById('edit-task-start-date').value;
        const taskColor = document.getElementById('edit-task-color').value;
        
        if (!taskId || !taskName.trim() || !startDate) return;
        
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;
        
        tasks[taskIndex].name = taskName;
        tasks[taskIndex].startDate = startDate;
        tasks[taskIndex].color = taskColor;
        
        saveTasks();
        renderCategories();
        hideModal('task-edit-modal');
    });
    
    // Delete task button
    document.getElementById('delete-task-btn').addEventListener('click', function() {
        const taskId = document.getElementById('edit-task-id').value;
        
        if (confirm('Are you sure you want to delete this task?')) {
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                tasks.splice(taskIndex, 1);
                saveTasks();
                renderCategories();
                hideModal('task-edit-modal');
            }
        }
    });
    
    // Color picker for new task
    document.querySelectorAll('#color-picker .color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('#color-picker .color-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
            document.getElementById('task-color').value = this.dataset.color;
        });
    });
    
    // Color picker for edit task
    document.querySelectorAll('#edit-color-picker .color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('#edit-color-picker .color-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
            document.getElementById('edit-task-color').value = this.dataset.color;
        });
    });
}