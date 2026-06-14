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
    const randomIndex = Math.floor(Math.random() * quotes.length);
    document.getElementById("quote").innerText = quotes[randomIndex];
}

function displayProblems() {
    const leetcodeList = document.getElementById("leetcodeList");
    const a2zList = document.getElementById("a2zList");
    const targetList = document.getElementById("targetList");
    const targetDayTitle = document.getElementById("targetDayTitle");
    const count = document.getElementById("count");
    const selectedDay = document.getElementById("problemDay").value;

    leetcodeList.innerHTML = "";
    a2zList.innerHTML = "";
    targetList.innerHTML = "";

    targetDayTitle.innerText = selectedDay.replace("day", "Day ");

    const dayProblems = problems.filter(problem => problem.day === selectedDay);

    dayProblems.forEach((problem, index) => {
        const realIndex = problems.indexOf(problem);

        const row = document.createElement("tr");

        row.innerHTML = `
    <td>
        <span class="problem-name-table">✅ ${problem.name}</span>
    </td>

    <td>
        <span class="topic-pill">${problem.topic}</span>
    </td>

    <td>
        <span class="status-pill">Done</span>
    </td>

    <td>
        <button class="delete-btn" onclick="deleteProblem(${realIndex})">🗑️</button>
    </td>
`;

        if (problem.category === "LeetCode") {
            leetcodeList.appendChild(row);
        } else if (problem.category === "A2Z") {
            a2zList.appendChild(row);
        }

        const targetItem = document.createElement("div");
        targetItem.className = "target-item";

        targetItem.innerHTML = `
    ${problem.category === "LeetCode" ? "🧠" : "📚"}
    <span class="badge">${problem.category}</span>
    ✅ ${problem.name}
`;

        targetItem.innerHTML = `
    <span class="problem-name">✅ ${problem.name}</span>
    <span class="badge">${problem.category}</span>
`;

        targetList.appendChild(targetItem);
    });

    if (dayProblems.length === 0) {
        targetList.innerHTML = `
        <div class="empty-target">
            🎯 No targets added yet.
            <small>
                (Add today's Mission DSA tracker or LeetCode problems to start tracking progress.)
            </small>
        </div>
    `;
    }

    count.innerText = problems.length;

    updateProgressBar();
    updateSummaryTable();
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

    document.getElementById("streakText").innerText =
        streak === 1 ? "1 Day" : `${streak} Days`;
}

function addProblem() {
    const category = document.getElementById("category").value;
    const problemName = document.getElementById("problemName").value.trim();
    const topic = document.getElementById("topic").value.trim();
    const day = document.getElementById("problemDay").value;

    if (problemName === "" || topic === "") {
        alert("Please fill all fields");
        return;
    }

    problems.push({
        day: day,
        category: category,
        name: problemName,
        topic: topic
    });

    localStorage.setItem("problems", JSON.stringify(problems));

    document.getElementById("problemName").value = "";
    document.getElementById("topic").value = "";

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

function updateProgressBar() {
    const completed = problems.length;
    const totalTarget = 100;
    const percentage = Math.min((completed / totalTarget) * 100, 100);

    document.getElementById("progressFill").style.width = percentage + "%";
    document.getElementById("progressText").innerText =
        Math.round(percentage) + "% Completed";
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
    const reflection = document.getElementById("reflectionText").value;

    localStorage.setItem(day + "_reflection", reflection);

    document.getElementById("reflectionViewer").innerText =
        reflection || "No reflection written yet.";

    document.getElementById("reflectionViewer").style.display = "block";
    document.getElementById("reflectionText").style.display = "none";
    document.getElementById("saveBtn").style.display = "none";

    document.getElementById("savedMsg").innerText =
        "Reflection saved for " + day.replace("day", "Day ");
}

function loadReflection() {
    const day = document.getElementById("reflectionDay").value;
    const dayNumber = day.replace("day", "");
    const reflection = localStorage.getItem(day + "_reflection") || "";

    document.getElementById("reflectionText").placeholder =
        "Write your Day " + dayNumber + " reflection...";

    document.getElementById("reflectionText").value = reflection;

    document.getElementById("reflectionViewer").innerText =
        reflection || "No reflection written yet.";

    document.getElementById("reflectionViewer").style.display = "block";
    document.getElementById("reflectionText").style.display = "none";
    document.getElementById("saveBtn").style.display = "none";
}

function createDayOptions() {
    const reflectionDay = document.getElementById("reflectionDay");
    const problemDay = document.getElementById("problemDay");

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

    reflectionDay.value = "day3";
    problemDay.value = "day3";
}

function updateSummaryTable() {
    const leetcodeCount = problems.filter(p => p.category === "LeetCode").length;
    const a2zCount = problems.filter(p => p.category === "A2Z").length;

    document.getElementById("leetcodeCount").innerText = leetcodeCount;
    document.getElementById("a2zCount").innerText = a2zCount;
    document.getElementById("totalCount").innerText = leetcodeCount + a2zCount;
}

showRandomQuote();
createDayOptions();
displayProblems();
loadReflection();
updateStreak();

document.getElementById("reflectionDay").addEventListener("change", loadReflection);
document.getElementById("problemDay").addEventListener("change", displayProblems);