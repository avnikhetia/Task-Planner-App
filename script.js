// Get references to the DOM elements
const addTaskButton = document.getElementById("add-task-btn");
const taskInput = document.getElementById("task-input");
const taskDurationInput = document.getElementById("task-duration");
const taskTimeInput = document.getElementById("task-time");
const timeSlotContainer = document.getElementById("time-slot-container");
const currentDateHeader = document.getElementById("current-date-header");
const previousDayButton = document.getElementById("previous-day");
const nextDayButton = document.getElementById("next-day");

// Store tasks for different days in localStorage
let taskData = JSON.parse(localStorage.getItem("taskData")) || {};
let currentDate = new Date();

// Function to update current time and date
function updateTimeAndDate() {
    const currentTimeDate = document.getElementById("current-time-date");
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const time = now.toLocaleTimeString();
    currentTimeDate.textContent = `${formattedDate} | ${time}`;
}
setInterval(updateTimeAndDate, 1000);

// Function to format the current date
function setCurrentDate() {
    const formattedDate = currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    currentDateHeader.textContent = `Tasks for ${formattedDate}`;
}
setCurrentDate();

// Function to convert 24-hour format to 12-hour format
function convertTo12HourFormat(time) {
    let [hour, minute] = time.split(':');
    hour = parseInt(hour, 10);
    let period = hour >= 12 ? 'PM' : 'AM';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${period}`;
}

// Initialize time slots (24-hour format)
const timeSlots = [];
for (let i = 0; i < 24; i++) {
    let hour = i;
    let period = "AM";
    if (hour >= 12) {
        period = "PM";
        if (hour > 12) hour -= 12;
    }
    const formattedHour = hour === 0 ? 12 : hour;
    timeSlots.push(`${formattedHour}:00 ${period}`);
}

// Function to create time slots
function createTimeSlots() {
    timeSlotContainer.innerHTML = "";
    const todayTasks = taskData[currentDate.toDateString()] || {};

    timeSlots.forEach(timeSlot => {
        const slotDiv = document.createElement("div");
        slotDiv.classList.add("task-time-slot");
        slotDiv.innerHTML = `<h3>${timeSlot}</h3><ul id="task-list-${timeSlot}"></ul>`;
        timeSlotContainer.appendChild(slotDiv);

        const taskList = document.getElementById(`task-list-${timeSlot}`);
        const tasks = todayTasks[timeSlot] || [];

        tasks.forEach((task, index) => {
            const taskItem = document.createElement("li");
            taskItem.classList.add("task-item");
            taskItem.innerHTML = `
                <span>${task.description} <span class="duration">(Duration: ${task.duration} mins)</span></span>
                <span class="task-timer" id="task-timer-${timeSlot.replace(/\s+/g, '-')}-${index}">Time left: Not started</span>
                <button class="start-task" data-time-slot="${timeSlot}" data-index="${index}">Start</button>
                <button class="delete-task" data-time-slot="${timeSlot}" data-index="${index}">Delete</button>
            `;
            taskList.appendChild(taskItem);
        });
    });

    attachTaskEventListeners();
}
createTimeSlots();

// Function to save tasks in localStorage
function saveTasks() {
    localStorage.setItem("taskData", JSON.stringify(taskData));
}

// Function to add a new task
addTaskButton.addEventListener("click", function () {
    const taskText = taskInput.value.trim();
    const taskDuration = taskDurationInput.value.trim();
    const taskTime = taskTimeInput.value.trim();

    if (taskText && taskDuration && taskTime) {
        const formattedTaskTime = convertTo12HourFormat(taskTime);
        const taskTimeSlot = timeSlots.find(slot => slot.startsWith(formattedTaskTime.split(" ")[0]));

        if (taskTimeSlot) {
            const todayTasks = taskData[currentDate.toDateString()] || {};
            const newTask = { description: taskText, duration: taskDuration };

            if (!todayTasks[taskTimeSlot]) {
                todayTasks[taskTimeSlot] = [];
            }
            todayTasks[taskTimeSlot].push(newTask);
            taskData[currentDate.toDateString()] = todayTasks;
            saveTasks();
            createTimeSlots();
            taskInput.value = "";
            taskDurationInput.value = "";
            taskTimeInput.value = "";
        } else {
            alert("Please enter a valid time slot.");
        }
    } else {
        alert("Please fill in all fields.");
    }
});

// Function to start a task timer
function startTaskTimer(timeSlot, index) {
    const todayTasks = taskData[currentDate.toDateString()];
    if (!todayTasks || !todayTasks[timeSlot]) return;

    let task = todayTasks[timeSlot][index];
    if (!task) return;

    let duration = parseInt(task.duration, 10) * 60;
    const timerElement = document.getElementById(`task-timer-${timeSlot.replace(/\s+/g, '-')}-${index}`);

    if (timerElement) {
        timerElement.textContent = `Time left: ${task.duration} mins`;
        const interval = setInterval(() => {
            duration--;
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;
            timerElement.textContent = `Time left: ${minutes}m ${seconds}s`;
            if (duration <= 0) {
                clearInterval(interval);
                timerElement.textContent = "Task completed!";
            }
        }, 1000);
    }
}

// Function to delete a task
function deleteTask(timeSlot, index) {
    const todayTasks = taskData[currentDate.toDateString()];
    if (!todayTasks || !todayTasks[timeSlot]) return;

    todayTasks[timeSlot].splice(index, 1);
    if (todayTasks[timeSlot].length === 0) {
        delete todayTasks[timeSlot];
    }

    taskData[currentDate.toDateString()] = todayTasks;
    saveTasks();
    createTimeSlots();
}

// Function to attach event listeners to task buttons
function attachTaskEventListeners() {
    document.querySelectorAll(".start-task").forEach(button => {
        button.addEventListener("click", function () {
            const timeSlot = this.getAttribute("data-time-slot");
            const index = parseInt(this.getAttribute("data-index"), 10);
            startTaskTimer(timeSlot, index);
        });
    });

    document.querySelectorAll(".delete-task").forEach(button => {
        button.addEventListener("click", function () {
            const timeSlot = this.getAttribute("data-time-slot");
            const index = parseInt(this.getAttribute("data-index"), 10);
            deleteTask(timeSlot, index);
        });
    });
}



// Navigate to the previous day
previousDayButton.addEventListener("click", function () {
    currentDate.setDate(currentDate.getDate() - 1);
    setCurrentDate();
    createTimeSlots();
});

// Navigate to the next day
nextDayButton.addEventListener("click", function () {
    currentDate.setDate(currentDate.getDate() + 1);
    setCurrentDate();
    createTimeSlots();
});

const datePicker = document.getElementById("date-picker");

datePicker.addEventListener("change", function () {
    const selectedDate = new Date(this.value);  // Get selected date from the date picker
    if (!isNaN(selectedDate.getTime())) {  // Check if it's a valid date
        currentDate = selectedDate;
        setCurrentDate();  // Update the displayed date
        createTimeSlots();  // Refresh the task list for the new date
    }
});
