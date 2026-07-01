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

    updateOverallProgress();
    updateAnalytics();
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


function updateOverallProgress() {
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");

    const totalTarget = 100;
    const completed = problems.length;
    const percent = Math.min((completed / totalTarget) * 100, 100);

    if (progressFill) progressFill.style.width = percent + "%";
    if (progressText) progressText.innerText = Math.round(percent) + "% Completed";
}

function updateAnalytics() {
    const total = problems.length;
    const leetcode = problems.filter(p => p.category === "LeetCode").length;
    const mission = problems.filter(p => p.category === "A2Z").length;

    const leetcodePercent = total === 0 ? 0 : Math.round((leetcode / total) * 100);
    const missionPercent = total === 0 ? 0 : 100 - leetcodePercent;

    const totalBox = document.getElementById("analyticsTotal");
    const leetcodeBox = document.getElementById("leetcodeAnalytics");
    const missionBox = document.getElementById("missionAnalytics");
    const donut = document.querySelector(".donut-chart");

    if (totalBox) totalBox.innerText = total;
    if (leetcodeBox) leetcodeBox.innerText = `${leetcode} (${leetcodePercent}%)`;
    if (missionBox) missionBox.innerText = `${mission} (${missionPercent}%)`;

    if (donut) {
        donut.style.background =
            `conic-gradient(#0ea5e9 0 ${leetcodePercent}%, #ec4899 ${leetcodePercent}% 100%)`;
    }

    updateWeekRange();
    updateLineChart();
    updateCategoryDistribution();
}

function updateWeekRange() {
    const today = new Date();
    const day = today.getDay();
    const mondayDiff = day === 0 ? -6 : 1 - day;

    const start = new Date(today);
    start.setDate(today.getDate() + mondayDiff);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const formatDate = (date) => {
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short"
        });
    };

    const weekText = document.querySelector(".analytics-filter span:first-child");

    if (weekText) {
        weekText.innerText = `${formatDate(start)} - ${formatDate(end)}`;
    }
}

function updateLineChart() {
    const linePath = document.querySelector(".line-path");
    const areaPath = document.querySelector(".area-path");
    const badge = document.querySelector(".chart-value-badge");

    if (!linePath || !areaPath || !badge) return;

    const dayCounts = [];

    for (let i = 1; i <= 7; i++) {
        const count = problems.filter(p => p.day === "day" + i).length;
        dayCounts.push(count);
    }

    let runningTotal = 0;

    const cumulative = dayCounts.map(count => {
        runningTotal += count;
        return runningTotal;
    });

    const maxValue = Math.max(50, ...cumulative);
    const width = 300;
    const height = 170;

    const points = cumulative.map((value, index) => {
        const x = (index / 6) * width;
        const y = height - (value / maxValue) * height;
        return [x, y];
    });

    const lineD = points.map((point, index) => {
        return `${index === 0 ? "M" : "L"}${point[0]} ${point[1]}`;
    }).join(" ");

    const areaD = `${lineD} L${width} ${height} L0 ${height} Z`;

    linePath.setAttribute("d", lineD);
    areaPath.setAttribute("d", areaD);

    const lastPoint = points[points.length - 1];

    badge.innerText = cumulative[cumulative.length - 1];
    badge.style.left = `calc(${(lastPoint[0] / width) * 100}% - 15px)`;
    badge.style.top = `${lastPoint[1] - 12}px`;
}

function updateCategoryDistribution() {
    const categoryLegend = document.getElementById("categoryLegend");
    const categoryDonut = document.querySelector(".category-donut");

    if (!categoryLegend || !categoryDonut) return;

    const topicCounts = {};

    problems.forEach(problem => {
        const topic = problem.topic || "Others";
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });

    const entries = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    const total = problems.length || 1;
    const colors = ["#0ea5e9", "#7c3aed", "#06b6d4", "#f59e0b"];

    let start = 0;
    const gradientParts = [];
    let legendHTML = "";

    entries.forEach(([topic, count], index) => {
        const percent = Math.round((count / total) * 100);
        const end = start + percent;

        gradientParts.push(`${colors[index]} ${start}% ${end}%`);

        legendHTML += `
            <p>
                <span class="dot" style="background:${colors[index]}"></span>
                ${topic}
                <strong>${percent}%</strong>
            </p>
        `;

        start = end;
    });

    if (entries.length === 0) {
        categoryDonut.style.background =
            "conic-gradient(#1e293b 0 100%)";

        categoryLegend.innerHTML = `
            <p><span class="dot blue"></span> Arrays <strong>0%</strong></p>
            <p><span class="dot purple"></span> Sorting <strong>0%</strong></p>
            <p><span class="dot cyan"></span> Recursion <strong>0%</strong></p>
            <p><span class="dot orange"></span> Others <strong>0%</strong></p>
        `;
        return;
    }

    categoryDonut.style.background =
        `conic-gradient(${gradientParts.join(", ")})`;

    categoryLegend.innerHTML = legendHTML;
}

initializeApp();
