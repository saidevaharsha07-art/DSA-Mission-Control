let problems = JSON.parse(localStorage.getItem("problems")) || [];

const quotes = [
    "Discipline beats motivation.",
    "Small progress every day becomes big results.",
    "Hard work compounds over time.",
    "One problem a day keeps failure away.",
    "Consistency is stronger than intensity.",
    "Focus on progress, not perfection.",
    "Show up daily. Results will follow."
];

function showRandomQuote() {
    const quote = document.getElementById("quote");
    if (!quote) return;

    const randomIndex = Math.floor(Math.random() * quotes.length);
    quote.innerText = quotes[randomIndex];
}

function displayProblems() {
    const leetcodeList = document.getElementById("leetcodeList");
    const a2zList = document.getElementById("a2zList");
    const targetList = document.getElementById("targetList");
    const targetDayTitle = document.getElementById("targetDayTitle");
    const count = document.getElementById("count");
    const problemDay = document.getElementById("problemDay");

    if (!problemDay) return;

    const selectedDay = problemDay.value;
    const dayNumber = selectedDay.replace("day", "");

    if (leetcodeList) leetcodeList.innerHTML = "";
    if (a2zList) a2zList.innerHTML = "";
    if (targetList) targetList.innerHTML = "";
    if (targetDayTitle) targetDayTitle.innerText = "Day " + dayNumber;

    const dayProblems = problems.filter(problem => problem.day === selectedDay);

    dayProblems.forEach(problem => {
        const realIndex = problems.indexOf(problem);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <span class="problem-name-table">✅ ${problem.name}</span>
            </td>
            <td>
                <span class="topic-pill">${problem.topic || "Arrays"}</span>
            </td>
            <td>
                <span class="status-pill">Done</span>
            </td>
            <td>
                <button class="delete-btn" onclick="deleteProblem(${realIndex})">🗑️</button>
            </td>
        `;

        if (problem.category === "LeetCode" && leetcodeList) {
            leetcodeList.appendChild(row);
        } else if (problem.category === "A2Z" && a2zList) {
            a2zList.appendChild(row);
        }
    });

    displayTargetList(dayProblems);
    updateCurrentTopic(dayProblems);
    updateTargetProgress(dayProblems);
    updateSummaryTable();

    if (count) count.innerText = problems.length;
}

function displayTargetList(dayProblems) {
    const targetList = document.getElementById("targetList");
    if (!targetList) return;

    targetList.innerHTML = "";

    if (dayProblems.length === 0) {
        targetList.innerHTML = `
            <div class="empty-target">
                🎯 No targets added yet.
                <small>Add today's problems to start tracking progress.</small>
            </div>
        `;
        return;
    }

    dayProblems.forEach(problem => {
        const item = document.createElement("div");
        item.className = "target-item";

        item.innerHTML = `
            <div class="status-dot">✓</div>

            <div class="problem-name">
                ${problem.name}
            </div>

            <div class="difficulty">
                Easy
            </div>

            <div class="status-dot">
                ✓
            </div>
        `;

        targetList.appendChild(item);
    });
}

function updateTargetProgress(dayProblems) {
    const completedText = document.getElementById("targetCompletedText");
    const percentText = document.getElementById("targetPercentText");
    const progressFill = document.getElementById("targetProgressFill");

    const completed = dayProblems.length;
    const total = Math.max(4, completed);
    const percent = total === 0 ? 0 : Math.min((completed / total) * 100, 100);

    if (completedText) {
        completedText.innerText = `${completed} / ${total} Completed`;
    }

    if (percentText) {
        percentText.innerText = `${Math.round(percent)}%`;
    }

    if (progressFill) {
        progressFill.style.width = percent + "%";
    }
}

function updateCurrentTopic(dayProblems) {
    const currentTopic = document.getElementById("currentTopic");
    if (!currentTopic) return;

    if (dayProblems.length > 0 && dayProblems[0].topic) {
        currentTopic.innerText = dayProblems[0].topic;
    } else {
        currentTopic.innerText = "Arrays";
    }
}

function updateStreak() {
    const today = new Date().toDateString();
    const lastActiveDate = localStorage.getItem("lastActiveDate");
    let streak = Number(localStorage.getItem("streak")) || 0;

    if (lastActiveDate !== today) {
        streak++;
        localStorage.setItem("streak", streak);
        localStorage.setItem("lastActiveDate", today);
    }

    const streakDays = document.getElementById("streakDays");
    const streakText = document.getElementById("streakText");

    if (streakDays) {
        streakDays.innerText = streak;
    }

    if (streakText) {
        streakText.innerText = streak === 1 ? "1 Day" : `${streak} Days`;
    }
}

function addProblem() {
    const category = document.getElementById("category").value;
    const problemName = document.getElementById("problemName").value.trim();
    const topicInput = document.getElementById("topic");
    const day = document.getElementById("problemDay").value;

    const topic = topicInput ? topicInput.value.trim() : "Arrays";

    if (problemName === "") {
        alert("Please enter problem name");
        return;
    }

    problems.push({
        day: day,
        category: category,
        name: problemName,
        topic: topic || "Arrays"
    });

    localStorage.setItem("problems", JSON.stringify(problems));

    document.getElementById("problemName").value = "";

    if (topicInput) {
        topicInput.value = "";
    }

    displayProblems();
    updateStreak();
}

function deleteProblem(index) {
    problems.splice(index, 1);
    localStorage.setItem("problems", JSON.stringify(problems));
    displayProblems();
}

function clearAll() {
    problems = [];
    localStorage.removeItem("problems");
    displayProblems();
}

function editReflection() {
    const day = document.getElementById("reflectionDay").value;
    const reflection = localStorage.getItem(day + "_reflection") || "";

    document.getElementById("reflectionText").value = reflection;
    document.getElementById("reflectionViewer").style.display = "none";
    document.getElementById("reflectionText").style.display = "block";
    document.getElementById("saveBtn").style.display = "inline-block";
}

function saveReflection() {
    const day = document.getElementById("reflectionDay").value;
    const reflection = document.getElementById("reflectionText").value.trim();

    localStorage.setItem(day + "_reflection", reflection);

    loadReflection();

    document.getElementById("savedMsg").innerText =
        "Reflection saved for " + day.replace("day", "Day ");
}

function loadReflection() {
    const day = document.getElementById("reflectionDay").value;
    const dayNumber = day.replace("day", "");
    const reflection = localStorage.getItem(day + "_reflection") || "";

    const reflectionTitle = document.getElementById("reflectionDayTitle");
    const reflectionText = document.getElementById("reflectionText");
    const reflectionViewer = document.getElementById("reflectionViewer");
    const saveBtn = document.getElementById("saveBtn");

    if (reflectionTitle) {
        reflectionTitle.innerText = "Day " + dayNumber;
    }

    reflectionText.placeholder = "Write your Day " + dayNumber + " reflection...";
    reflectionText.value = reflection;

    if (reflection.trim() === "") {
        reflectionViewer.innerHTML = `
            <div class="reflection-box">
                <h3>What I Learned</h3>
                <ul>
                    <li>Add your learnings here</li>
                    <li>Important concepts</li>
                    <li>Patterns you noticed</li>
                </ul>
            </div>

            <div class="reflection-box">
                <h3>Challenges Faced</h3>
                <ul>
                    <li>Add your difficulties here</li>
                    <li>Edge cases</li>
                    <li>Logic mistakes</li>
                </ul>
            </div>

            <div class="reflection-box">
                <h3>Tomorrow's Focus</h3>
                <ul>
                    <li>Add tomorrow's plan</li>
                    <li>Revision topics</li>
                    <li>Next problems</li>
                </ul>
            </div>
        `;
    } else {
        reflectionViewer.innerHTML = `
            <div class="reflection-box full-reflection">
                <h3>Saved Reflection</h3>
                <p>${reflection.replace(/\n/g, "<br>")}</p>
            </div>
        `;
    }

    reflectionViewer.style.display = "grid";
    reflectionText.style.display = "none";
    saveBtn.style.display = "none";
}

function createDayOptions() {
    const reflectionDay = document.getElementById("reflectionDay");
    const problemDay = document.getElementById("problemDay");

    if (!reflectionDay || !problemDay) return;

    reflectionDay.innerHTML = "";
    problemDay.innerHTML = "";

    for (let i = 1; i <= 45; i++) {
        let option1 = document.createElement("option");
        option1.value = "day" + i;
        option1.innerText = "Day " + i;
        reflectionDay.appendChild(option1);

        let option2 = document.createElement("option");
        option2.value = "day" + i;
        option2.innerText = "Day " + i;
        problemDay.appendChild(option2);
    }

    let latestDay = "day7";

    for (let i = 45; i >= 1; i--) {
        const hasProblems = problems.some(problem => problem.day === "day" + i);
        const hasReflection = localStorage.getItem("day" + i + "_reflection");

        if (hasProblems || hasReflection) {
            latestDay = "day" + i;
            break;
        }
    }

    reflectionDay.value = latestDay;
    problemDay.value = latestDay;
}

function updateSummaryTable() {
    const leetcodeCount = problems.filter(p => p.category === "LeetCode").length;
    const a2zCount = problems.filter(p => p.category === "A2Z").length;

    const leetcodeCountBox = document.getElementById("leetcodeCount");
    const a2zCountBox = document.getElementById("a2zCount");
    const totalCountBox = document.getElementById("totalCount");

    if (leetcodeCountBox) leetcodeCountBox.innerText = leetcodeCount;
    if (a2zCountBox) a2zCountBox.innerText = a2zCount;
    if (totalCountBox) totalCountBox.innerText = leetcodeCount + a2zCount;
}

function initializeApp() {
    showRandomQuote();
    createDayOptions();
    displayProblems();
    loadReflection();
    updateStreak();

    const reflectionDay = document.getElementById("reflectionDay");
    const problemDay = document.getElementById("problemDay");

    if (reflectionDay) {
        reflectionDay.addEventListener("change", function () {
            loadReflection();
        });
    }

    if (problemDay) {
        problemDay.addEventListener("change", function () {
            displayProblems();
        });
    }
}

initializeApp();