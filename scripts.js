document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.getElementById('add-button');
    const resetButton = document.getElementById('reset-button');
    const habitInput = document.getElementById('habit-input');
    const habitCategory = document.getElementById('habit-category');
    const habitList = document.getElementById('habit-list');
    const completedCount = document.getElementById('completed-count');
    const ctx = document.getElementById('habit-chart').getContext('2d');

    let completedHabits = 0;
    let totalHabits = 0;
    let habits = JSON.parse(localStorage.getItem('habits')) || [];

    const habitChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Completed', 'Not Completed'],
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#28a745', '#dc3545'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                datalabels: {
                    formatter: (value) => value.toFixed(2) + '%',
                    color: '#fff',
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.label}: ${tooltipItem.raw.toFixed(2)}%`;
                        }
                    }
                }
            }
        }
    });

    const updateChart = () => {
        const completedPercentage = totalHabits ? (completedHabits / totalHabits) * 100 : 0;
        const nonCompletedPercentage = 100 - completedPercentage;

        habitChart.data.datasets[0].data = [completedPercentage, nonCompletedPercentage];
        habitChart.update();
    };

    const createHabitItem = (habit) => {
        const habitItem = document.createElement('div');
        habitItem.className = 'habit-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = habit.completed;
        if (habit.completed) {
            completedHabits++;
        }
        
        const label = document.createElement('label');
        label.textContent = `${habit.text} (${habit.category})`;

        const streak = document.createElement('span');
        streak.textContent = `Streak: ${habit.streak} days`;
        streak.style.marginLeft = '10px';

        const editButton = document.createElement('button');
        editButton.innerHTML = '&#9998;'; // Edit icon
        editButton.onclick = () => {
            const newText = prompt('Edit habit:', habit.text);
            if (newText !== null && newText.trim() !== '') {
                label.textContent = `${newText.trim()} (${habit.category})`;
                habit.text = newText.trim();
                saveHabits();
            }
        };

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '&#10006;'; // Delete icon
        deleteButton.onclick = () => {
            habitList.removeChild(habitItem);
            totalHabits--;
            if (checkbox.checked) {
                completedHabits--;
                completedCount.textContent = completedHabits;
            }
            habits = habits.filter(h => h !== habit);
            saveHabits();
            updateChart();
        };

        habitItem.appendChild(checkbox);
        habitItem.appendChild(label);
        habitItem.appendChild(streak);
        habitItem.appendChild(editButton);
        habitItem.appendChild(deleteButton);
        
        habitList.appendChild(habitItem);
    };

    const saveHabits = () => {
        localStorage.setItem('habits', JSON.stringify(habits));
    };

    addButton.addEventListener('click', function() {
        const habitText = habitInput.value.trim();
        const category = habitCategory.value;
        if (habitText === '') return;

        const habit = {
            text: habitText,
            category: category,
            completed: false,
            streak: 0
        };

        habits.push(habit);
        createHabitItem(habit);
        habitInput.value = '';
        totalHabits++;
        updateChart();
        saveHabits();
    });

    resetButton.addEventListener('click', function() {
        habitList.innerHTML = '';
        habits = [];
        completedHabits = 0;
        totalHabits = 0;
        completedCount.textContent = completedHabits;
        updateChart();
        saveHabits();
    });

    habitList.addEventListener('change', function(event) {
        if (event.target.type === 'checkbox') {
            const habitItem = event.target.parentElement;
            const habitText = habitItem.querySelector('label').textContent;
            const habit = habits.find(h => `${h.text} (${h.category})` === habitText);

            if (event.target.checked) {
                completedHabits++;
                habit.completed = true;
            } else {
                completedHabits--;
                habit.completed = false;
            }

            completedCount.textContent = completedHabits;
            updateChart();
            saveHabits();
        }
    });

    habits.forEach(createHabitItem);
    updateChart();
});
