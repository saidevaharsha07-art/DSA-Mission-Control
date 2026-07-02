const STORAGE_KEYS = {
    problems: "dsaMission.problems",
    streak: "dsaMission.streak",
    lastActiveDate: "dsaMission.lastActiveDate",
    profile: "dsaMission.profile",
    theme: "dsaMission.theme"
};

const quotes = [
    "Discipline beats motivation.",
    "Small progress every day becomes big results.",
    "Hard work compounds over time.",
    "Consistency is stronger than intensity.",
    "Focus on progress, not perfection.",
    "Show up daily. Results will follow."
];

const defaultProfile = {
    name: "Student",
    target: 100
};

let problems = loadProblems();
let profile = loadProfile();

function getElement(id) {
    return document.getElementById(id);
}

function loadProblems() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.problems);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

function saveProblems() {
    localStorage.setItem(STORAGE_KEYS.problems, JSON.stringify(problems));
}

function loadProfile() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.profile);
        return saved ? { ...defaultProfile, ...JSON.parse(saved) } : { ...defaultProfile };
    } catch {
        return { ...defaultProfile };
    }
}

function saveProfile() {
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
}

function cleanText(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function formatDay(day) {
    return `Day ${String(day || "day1").replace("day", "")}`;
}

function showRandomQuote() {
    const quote = getElement("quote");
    if (!quote) return;

    const randomIndex = Math.floor(Math.random() * quotes.length);
    quote.textContent = quotes[randomIndex];
}

function createDayOptions() {
    const problemDay = getElement("problemDay");
    const reflectionDay = getElement("reflectionDay");

    if (!problemDay || !reflectionDay) return;

    problemDay.innerHTML = "";
    reflectionDay.innerHTML = "";

    for (let i = 1; i <= 45; i++) {
        problemDay.appendChild(new Option(`Day ${i}`, `day${i}`));
        reflectionDay.appendChild(new Option(`Day ${i}`, `day${i}`));
    }

    let latestDay = "day1";

    for (let i = 45; i >= 1; i--) {
        const day = `day${i}`;
        const hasProblem = problems.some((problem) => problem.day === day);
        const hasReflection = localStorage.getItem(`${day}_reflection`);

        if (hasProblem || hasReflection) {
            latestDay = day;
            break;
        }
    }

    problemDay.value = latestDay;
    reflectionDay.value = latestDay;
}

function addProblem(event) {
    event.preventDefault();

    const problemDay = getElement("problemDay");
    const category = getElement("category");
    const problemName = getElement("problemName");
    const topic = getElement("topic");
    const formMessage = getElement("formMessage");

    const name = problemName.value.trim();
    const topicName = topic.value.trim() || "Arrays";

    if (!name) {
        formMessage.textContent = "Please enter a problem name.";
        problemName.focus();
        return;
    }

    problems.push({
        day: problemDay.value,
        category: category.value,
        name,
        topic: topicName,
        createdAt: new Date().toISOString()
    });

    saveProblems();

    problemName.value = "";
    topic.value = "";
    formMessage.textContent = "Problem added successfully.";

    displayProblems();
    updateStreak(true);
}

function deleteProblem(index) {
    problems.splice(index, 1);
    saveProblems();
    displayProblems();
}

function clearForm() {
    getElement("problemName").value = "";
    getElement("topic").value = "";
    getElement("formMessage").textContent = "";
}

function getFilteredProblems() {
    const searchValue = (getElement("searchInput")?.value || "").toLowerCase().trim();
    const categoryValue = getElement("categoryFilter")?.value || "All";

    return problems.filter((problem) => {
        const matchesCategory = categoryValue === "All" || problem.category === categoryValue;
        const searchableText = `${problem.name} ${problem.topic} ${problem.category} ${formatDay(problem.day)}`.toLowerCase();

        return matchesCategory && searchableText.includes(searchValue);
    });
}

function displayProblems() {
    const selectedDay = getElement("problemDay")?.value || "day1";
    const dayProblems = problems.filter((problem) => problem.day === selectedDay);

    renderProblemTable();
    renderTargetList(dayProblems);
    updateTargetProgress(dayProblems);
    updateSummary(dayProblems);
    updateOverallProgress();
    updateAnalytics();
}

function renderProblemTable() {
    const problemList = getElement("problemList");
    if (!problemList) return;

    const filteredProblems = getFilteredProblems();

    if (filteredProblems.length === 0) {
        problemList.innerHTML = `
      <tr>
        <td colspan="5">No problems match your filters yet.</td>
      </tr>
    `;
        return;
    }

    problemList.innerHTML = filteredProblems
        .map((problem) => {
            const realIndex = problems.indexOf(problem);

            return `
        <tr>
          <td><strong>${cleanText(problem.name)}</strong></td>
          <td>${cleanText(problem.topic || "Arrays")}</td>
          <td>${cleanText(problem.category)}</td>
          <td>${formatDay(problem.day)}</td>
          <td>
            <button type="button" data-delete-index="${realIndex}">
              Delete
            </button>
          </td>
        </tr>
      `;
        })
        .join("");
}

function renderTargetList(dayProblems) {
    const targetList = getElement("targetList");
    const targetDayTitle = getElement("targetDayTitle");
    const dayBadgeText = getElement("dayBadgeText");

    const selectedDay = getElement("problemDay")?.value || "day1";

    if (targetDayTitle) targetDayTitle.textContent = formatDay(selectedDay);
    if (dayBadgeText) dayBadgeText.textContent = formatDay(selectedDay);

    if (!targetList) return;

    if (dayProblems.length === 0) {
        targetList.innerHTML = `
      <p>No targets added yet. Add solved problems to start tracking progress.</p>
    `;
        return;
    }

    targetList.innerHTML = dayProblems
        .map((problem) => {
            return `
        <article>
          <strong>${cleanText(problem.name)}</strong>
          <p>${cleanText(problem.topic || "Arrays")} · ${cleanText(problem.category)}</p>
        </article>
      `;
        })
        .join("");
}

function updateTargetProgress(dayProblems) {
    const completed = dayProblems.length;
    const total = Math.max(4, completed);
    const percent = Math.min(Math.round((completed / total) * 100), 100);

    const completedText = getElement("targetCompletedText");
    const percentText = getElement("targetPercentText");
    const targetProgress = getElement("targetProgress");
    const targetProgressFill = getElement("targetProgressFill");

    if (completedText) completedText.textContent = `${completed} / ${total} completed`;
    if (percentText) percentText.textContent = `${percent}%`;

    if (targetProgress) {
        targetProgress.value = percent;
        targetProgress.textContent = `${percent}%`;
    }

    if (targetProgressFill) {
        targetProgressFill.style.width = `${percent}%`;
    }
}

function updateSummary(dayProblems) {
    const leetcodeCount = problems.filter((problem) => problem.category === "LeetCode").length;
    const a2zCount = problems.filter((problem) => problem.category === "A2Z").length;
    const currentTopic = dayProblems.find((problem) => problem.topic)?.topic || "Arrays";

    if (getElement("count")) getElement("count").textContent = problems.length;
    if (getElement("leetcodeCount")) getElement("leetcodeCount").textContent = leetcodeCount;
    if (getElement("a2zCount")) getElement("a2zCount").textContent = a2zCount;
    if (getElement("totalCount")) getElement("totalCount").textContent = problems.length;
    if (getElement("currentTopicSmall")) getElement("currentTopicSmall").textContent = currentTopic;
}

function updateOverallProgress() {
    const target = Number(profile.target) || 100;
    const percent = Math.min(Math.round((problems.length / target) * 100), 100);

    const overallProgress = getElement("overallProgress");
    const progressText = getElement("progressText");
    const progressFill = getElement("progressFill");
    const targetCount = getElement("targetCount");
    const targetGoalText = getElement("targetGoalText");

    if (overallProgress) {
        overallProgress.value = percent;
        overallProgress.textContent = `${percent}%`;
    }

    if (progressText) progressText.textContent = `${percent}% completed`;
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (targetCount) targetCount.textContent = target;
    if (targetGoalText) targetGoalText.textContent = target;
}

function updateStreak(shouldIncrease = false) {
    const today = new Date().toDateString();
    const lastActiveDate = localStorage.getItem(STORAGE_KEYS.lastActiveDate);
    let streak = Number(localStorage.getItem(STORAGE_KEYS.streak)) || 0;

    if (shouldIncrease && lastActiveDate !== today) {
        streak += 1;
        localStorage.setItem(STORAGE_KEYS.streak, String(streak));
        localStorage.setItem(STORAGE_KEYS.lastActiveDate, today);
    }

    const streakDays = getElement("streakDays");
    const streakText = getElement("streakText");

    if (streakDays) streakDays.textContent = streak;
    if (streakText) streakText.textContent = streak === 1 ? "1 day" : `${streak} days`;
}

function loadReflection() {
    const reflectionDay = getElement("reflectionDay");
    const reflectionViewer = getElement("reflectionViewer");
    const reflectionText = getElement("reflectionText");
    const reflectionDayTitle = getElement("reflectionDayTitle");

    if (!reflectionDay || !reflectionViewer || !reflectionText) return;

    const day = reflectionDay.value;
    const savedReflection = localStorage.getItem(`${day}_reflection`) || "";

    if (reflectionDayTitle) reflectionDayTitle.textContent = formatDay(day);
    reflectionText.value = savedReflection;

    if (!savedReflection) {
        reflectionViewer.innerHTML = `
      <section>
        <h3>What I learned</h3>
        <p>Add your key concepts, mistakes, and patterns here.</p>
      </section>

      <section>
        <h3>Challenges</h3>
        <p>Write what confused you or needs revision.</p>
      </section>

      <section>
        <h3>Next focus</h3>
        <p>Plan tomorrow's topic and problems.</p>
      </section>
    `;
        return;
    }

    reflectionViewer.innerHTML = `
    <section>
      <h3>Saved reflection</h3>
      <p>${cleanText(savedReflection).replace(/\n/g, "<br>")}</p>
    </section>
  `;
}

function saveReflection() {
    const reflectionDay = getElement("reflectionDay");
    const reflectionText = getElement("reflectionText");
    const savedMsg = getElement("savedMsg");

    if (!reflectionDay || !reflectionText) return;

    localStorage.setItem(`${reflectionDay.value}_reflection`, reflectionText.value.trim());

    if (savedMsg) {
        savedMsg.textContent = `Reflection saved for ${formatDay(reflectionDay.value)}.`;
    }

    loadReflection();
}

function clearReflectionMessage() {
    const savedMsg = getElement("savedMsg");
    if (savedMsg) savedMsg.textContent = "";
}

function updateAnalytics() {
    const total = problems.length;
    const leetcode = problems.filter((problem) => problem.category === "LeetCode").length;
    const mission = problems.filter((problem) => problem.category === "A2Z").length;

    const leetcodePercent = total ? Math.round((leetcode / total) * 100) : 0;
    const missionPercent = total ? 100 - leetcodePercent : 0;

    if (getElement("analyticsTotal")) getElement("analyticsTotal").textContent = total;
    if (getElement("leetcodeAnalytics")) getElement("leetcodeAnalytics").textContent = `${leetcode} (${leetcodePercent}%)`;
    if (getElement("missionAnalytics")) getElement("missionAnalytics").textContent = `${mission} (${missionPercent}%)`;

    const problemDonut = getElement("problemDonut");
    if (problemDonut) {
        problemDonut.style.background = `conic-gradient(#0ea5e9 0 ${leetcodePercent}%, #ec4899 ${leetcodePercent}% 100%)`;
    }

    updateLineChart();
    updateCategoryLegend();
    updateCalendarGrid();
    updateWeekRange();

    const calendarStreak = getElement("calendarStreak");
    if (calendarStreak) {
        calendarStreak.textContent = Number(localStorage.getItem(STORAGE_KEYS.streak)) || 0;
    }
}

function updateLineChart() {
    const linePath = getElement("analyticsLinePath");
    const areaPath = getElement("analyticsAreaPath");
    const dot = getElement("analyticsLineDot");
    const badge = getElement("dailyTotalBadge");

    if (!linePath || !areaPath || !dot || !badge) return;

    const dayCounts = [];

    for (let i = 1; i <= 7; i++) {
        dayCounts.push(problems.filter((problem) => problem.day === `day${i}`).length);
    }

    let runningTotal = 0;
    const cumulative = dayCounts.map((count) => {
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

    const lineD = points
        .map((point, index) => `${index === 0 ? "M" : "L"}${point[0]} ${point[1]}`)
        .join(" ");

    const areaD = `${lineD} L${width} ${height} L0 ${height} Z`;
    const lastPoint = points[points.length - 1];

    linePath.setAttribute("d", lineD);
    areaPath.setAttribute("d", areaD);
    dot.setAttribute("cx", lastPoint[0]);
    dot.setAttribute("cy", lastPoint[1]);

    badge.textContent = cumulative[cumulative.length - 1];
    badge.style.left = `calc(${(lastPoint[0] / width) * 100}% - 15px)`;
    badge.style.top = `${lastPoint[1] - 12}px`;
}

function updateCategoryLegend() {
    const categoryLegend = getElement("categoryLegend");
    const categoryDonut = getElement("categoryDonut");

    if (!categoryLegend || !categoryDonut) return;

    if (problems.length === 0) {
        categoryLegend.innerHTML = "<p>No topic data yet.</p>";
        categoryDonut.style.background = "conic-gradient(#1e293b 0 100%)";
        return;
    }

    const colors = ["#0ea5e9", "#7c3aed", "#06b6d4", "#f59e0b"];
    const topicCounts = {};

    problems.forEach((problem) => {
        const topic = problem.topic || "Arrays";
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });

    const entries = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    let start = 0;
    const gradientParts = [];

    categoryLegend.innerHTML = entries
        .map(([topic, count], index) => {
            const percent = Math.round((count / problems.length) * 100);
            const end = index === entries.length - 1 ? 100 : start + percent;

            gradientParts.push(`${colors[index]} ${start}% ${end}%`);
            start = end;

            return `
        <p>
          <span class="legend-dot" style="background:${colors[index]}"></span>
          ${cleanText(topic)}
          <strong>${percent}%</strong>
        </p>
      `;
        })
        .join("");

    categoryDonut.style.background = `conic-gradient(${gradientParts.join(", ")})`;
}

function updateCalendarGrid() {
    const calendarGrid = getElement("calendarGrid");
    if (!calendarGrid) return;

    const levels = [
        0, 0, 0, 1, 1, 2, 2,
        0, 0, 1, 2, 3, 3, 2,
        0, 0, 0, 1, 2, 3, 2,
        0, 0, 1, 1, 2, 4, 3,
        1, 1, 2, 3, 4, 4, 3,
        0, 0, 0, 2, 3, 2, 1,
        0, 0, 0, 0, 1, 1, 0
    ];

    calendarGrid.innerHTML = levels
        .map((level) => `<span class="${level ? `level-${level}` : ""}"></span>`)
        .join("");
}
function toggleTheme() {
    document.body.classList.toggle("light-mode");

    const isLightMode = document.body.classList.contains("light-mode");
    localStorage.setItem(STORAGE_KEYS.theme, isLightMode ? "light" : "dark");

    const themeToggle = getElement("themeToggle");
    if (themeToggle) {
        themeToggle.setAttribute("aria-pressed", String(isLightMode));
        themeToggle.textContent = isLightMode ? "Dark mode" : "Light mode";
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    const themeToggle = getElement("themeToggle");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }

    const isLightMode = document.body.classList.contains("light-mode");

    if (themeToggle) {
        themeToggle.setAttribute("aria-pressed", String(isLightMode));
        themeToggle.textContent = isLightMode ? "Dark mode" : "Light mode";
    }
}

function openProfileDialog() {
    const profileDialog = getElement("profileDialog");
    const profileNameInput = getElement("profileNameInput");
    const targetInput = getElement("targetInput");

    if (profileNameInput) profileNameInput.value = profile.name;
    if (targetInput) targetInput.value = profile.target;

    if (profileDialog && typeof profileDialog.showModal === "function") {
        profileDialog.showModal();
    }
}

function saveProfileFromForm(event) {
    event.preventDefault();

    const profileNameInput = getElement("profileNameInput");
    const targetInput = getElement("targetInput");
    const profileDialog = getElement("profileDialog");

    profile = {
        name: profileNameInput.value.trim() || "Student",
        target: Math.max(1, Number(targetInput.value) || 100)
    };

    saveProfile();
    updateProfileUI();
    updateOverallProgress();

    if (profileDialog) profileDialog.close();
}

function updateProfileUI() {
    const studentName = getElement("studentName");
    if (studentName) studentName.textContent = profile.name;

    const targetCount = getElement("targetCount");
    const targetGoalText = getElement("targetGoalText");

    if (targetCount) targetCount.textContent = profile.target;
    if (targetGoalText) targetGoalText.textContent = profile.target;
}

function bindEvents() {
    const problemForm = getElement("problemForm");
    if (problemForm) problemForm.addEventListener("submit", addProblem);

    const clearFormBtn = getElement("clearFormBtn");
    if (clearFormBtn) clearFormBtn.addEventListener("click", clearForm);

    const problemDay = getElement("problemDay");
    if (problemDay) problemDay.addEventListener("change", displayProblems);

    const searchInput = getElement("searchInput");
    if (searchInput) searchInput.addEventListener("input", renderProblemTable);

    const categoryFilter = getElement("categoryFilter");
    if (categoryFilter) categoryFilter.addEventListener("change", renderProblemTable);

    const problemList = getElement("problemList");
    if (problemList) {
        problemList.addEventListener("click", (event) => {
            const deleteButton = event.target.closest("[data-delete-index]");
            if (!deleteButton) return;

            deleteProblem(Number(deleteButton.dataset.deleteIndex));
        });
    }

    const reflectionDay = getElement("reflectionDay");
    if (reflectionDay) {
        reflectionDay.addEventListener("change", () => {
            clearReflectionMessage();
            loadReflection();
        });
    }

    const saveReflectionBtn = getElement("saveReflectionBtn");
    if (saveReflectionBtn) saveReflectionBtn.addEventListener("click", saveReflection);

    const editReflectionBtn = getElement("editReflectionBtn");
    if (editReflectionBtn) {
        editReflectionBtn.addEventListener("click", () => {
            getElement("reflectionText")?.focus();
        });
    }

    const cancelReflectionBtn = getElement("cancelReflectionBtn");
    if (cancelReflectionBtn) cancelReflectionBtn.addEventListener("click", loadReflection);

    const themeToggle = getElement("themeToggle");
    if (themeToggle) themeToggle.addEventListener("click", toggleTheme);

    const editProfileBtn = getElement("editProfileBtn");
    if (editProfileBtn) editProfileBtn.addEventListener("click", openProfileDialog);

    const profileForm = getElement("profileForm");
    if (profileForm) profileForm.addEventListener("submit", saveProfileFromForm);

    const closeProfileBtn = getElement("closeProfileBtn");
    if (closeProfileBtn) {
        closeProfileBtn.addEventListener("click", () => {
            const profileDialog = getElement("profileDialog");
            if (profileDialog) profileDialog.close();
        });
    }
}

function initializeApp() {
    loadTheme();
    updateProfileUI();
    showRandomQuote();
    createDayOptions();
    bindEvents();
    displayProblems();
    loadReflection();
    updateStreak(false);
}

initializeApp();