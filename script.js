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
let currentTopic = "Arrays";
function displayProblems() {
    const leetcodeList = document.getElementById("leetcodeList");
    const a2zList = document.getElementById("a2zList");
    const count = document.getElementById("count");
    const selectedDay = document.getElementById("problemDay").value;

    leetcodeList.innerHTML = "";
    a2zList.innerHTML = "";

    problems.forEach((problem, index) => {
        if (problem.day !== selectedDay) return;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${problem.name}</td>
            <td>${problem.topic}</td>
            <td>✅ Done</td>
            <td>
                <button onclick="deleteProblem(${index})">🗑️</button>
            </td>
        `;

        if (problem.category === "LeetCode") {
            leetcodeList.appendChild(row);
        } else if (problem.category === "A2Z") {
            a2zList.appendChild(row);
        }
    });

    const selectedDayProblems = problems.filter(problem => problem.day === selectedDay);

    count.innerText = selectedDayProblems.length;
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

    document.getElementById("streak").innerText = streak;
}

function addProblem() {
    const category = document.getElementById("category").value;
    const problemName = document.getElementById("problemName").value;
    const topic = document.getElementById("topic").value;

    if (problemName === "" || topic === "") {
        alert("Please fill all fields");
        return;
    }

    problems.push({
        day: document.getElementById("problemDay").value,
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
    const selectedDay = document.getElementById("problemDay").value;
    const completed = problems.filter(problem => problem.day === selectedDay).length;

    const totalTarget = 100;
    const percentage = Math.min((completed / totalTarget) * 100, 100);

    document.getElementById("progressFill").style.width = percentage + "%";
    document.getElementById("progressText").innerText = Math.round(percentage) + "% Completed";
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

    reflectionDay.value = "day1";
    problemDay.value = "day1";
}

function updateSummaryTable() {
    const selectedDay = document.getElementById("problemDay").value;

    const leetcodeCount = problems.filter(
        p => p.day === selectedDay && p.category === "LeetCode"
    ).length;

    const a2zCount = problems.filter(
        p => p.day === selectedDay && p.category === "A2Z"
    ).length;

    document.getElementById("leetcodeCount").innerText = leetcodeCount;
    document.getElementById("a2zCount").innerText = a2zCount;
    document.getElementById("totalCount").innerText =
        leetcodeCount + a2zCount;
}

document.getElementById("reflectionDay").addEventListener("change", loadReflection);

showRandomQuote();
createDayOptions();
displayProblems();
loadReflection();
updateStreak();

document.getElementById("reflectionDay")
    .addEventListener("change", loadReflection);

document.getElementById("problemDay")
    .addEventListener("change", displayProblems);