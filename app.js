const currentUser = {
  id: 1,
  name: "Avery",
  age: 28,
  location: "Seattle",
  interests: ["Hiking", "Coffee", "Travel", "Music"],
  goals: ["Long-term relationship", "Outdoor adventures"],
};

const predefinedInterests = ["Hiking", "Coffee", "Travel", "Music", "Cooking", "Yoga", "Art", "Reading", "Running", "Tech", "Photography", "Food"];
const predefinedGoals = ["Long-term relationship", "Outdoor adventures", "Travel companion", "Meaningful connection", "Creative life", "Fun dates", "Shared interests", "Adventure"];
const predefinedLocations = ["Seattle", "Portland", "Vancouver"];

let isEditing = false;

let isEditingCandidate = false;

let editingCandidateId = null;

let currentCandidateIndex = 0;

let likedCandidates = [];

let matches = [];

function generateSelect(options, selectedValues, id, multiple = false) {
  const multipleAttr = multiple ? 'multiple' : '';
  const optionsHtml = options.map(option => {
    const selected = selectedValues.includes(option) ? 'selected' : '';
    return `<option value="${option}" ${selected}>${option}</option>`;
  }).join('');
  return `<select id="${id}" ${multipleAttr}>${optionsHtml}</select>`;
}

const candidates = [
  {
    id: 2,
    name: "Jordan",
    age: 26,
    location: "Seattle",
    interests: ["Coffee", "Cooking", "Travel", "Yoga"],
    goals: ["Travel companion", "Meaningful connection"],
  },
  {
    id: 3,
    name: "Harper",
    age: 30,
    location: "Portland",
    interests: ["Hiking", "Music", "Art", "Reading"],
    goals: ["Long-term relationship", "Creative life"],
  },
  {
    id: 4,
    name: "Riley",
    age: 27,
    location: "Seattle",
    interests: ["Running", "Music", "Tech", "Coffee"],
    goals: ["Fun dates", "Shared interests"],
  },
  {
    id: 5,
    name: "Quinn",
    age: 29,
    location: "Vancouver",
    interests: ["Travel", "Photography", "Music", "Food"],
    goals: ["Adventure", "Meaningful connection"],
  },
];

function renderProfile(targetId, user) {
  const container = document.getElementById(targetId);
  if (isEditing) {
    container.innerHTML = `
      <p><strong>Name:</strong> <input type="text" id="editName" value="${user.name}"></p>
      <p><strong>Age:</strong> <input type="number" id="editAge" value="${user.age}"></p>
      <p><strong>Location:</strong> ${generateSelect(predefinedLocations, [user.location], 'editLocation')}</p>
      <p><strong>Interests:</strong> ${generateSelect(predefinedInterests, user.interests, 'editInterests', true)}</p>
      <p><strong>Goals:</strong> ${generateSelect(predefinedGoals, user.goals, 'editGoals', true)}</p>
      <button id="saveBtn">Save</button>
      <button id="cancelBtn">Cancel</button>
    `;
  } else {
    const interests = user.interests.map((interest) => `<span>${interest}</span>`).join(" ");
    const goals = user.goals.map((goal) => `<span>${goal}</span>`).join(" ");

    container.innerHTML = `
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Age:</strong> ${user.age}</p>
      <p><strong>Location:</strong> ${user.location}</p>
      <p><strong>Interests:</strong></p>
      <div class="badge">${interests}</div>
      <p><strong>Goals:</strong></p>
      <div class="badge">${goals}</div>
      <button id="editBtn">Edit Profile</button>
    `;
  }
}

function renderCandidates() {
  const list = document.getElementById("candidateList");
  list.innerHTML = candidates
    .map((candidate) => {
      if (isEditingCandidate && editingCandidateId === candidate.id) {
        return `
          <article class="profile-card editing">
            <h3>Editing ${candidate.name}</h3>
            <p><strong>Name:</strong> <input type="text" id="editCandName" value="${candidate.name}"></p>
            <p><strong>Age:</strong> <input type="number" id="editCandAge" value="${candidate.age}"></p>
            <p><strong>Location:</strong> ${generateSelect(predefinedLocations, [candidate.location], 'editCandLocation')}</p>
            <p><strong>Interests:</strong> ${generateSelect(predefinedInterests, candidate.interests, 'editCandInterests', true)}</p>
            <p><strong>Goals:</strong> ${generateSelect(predefinedGoals, candidate.goals, 'editCandGoals', true)}</p>
            <button data-candidate-id="${candidate.id}" class="saveCandBtn">Save</button>
            <button data-candidate-id="${candidate.id}" class="cancelCandBtn">Cancel</button>
          </article>
        `;
      } else {
        const interests = candidate.interests.map((interest) => `<span>${interest}</span>`).join(" ");
        return `
          <article class="profile-card">
            <h3>${candidate.name}, ${candidate.age}</h3>
            <p><strong>Location:</strong> ${candidate.location}</p>
            <p><strong>Interests:</strong></p>
            <div class="badge">${interests}</div>
            <button data-candidate-id="${candidate.id}" class="editCandBtn">Edit</button>
          </article>
        `;
      }
    })
    .join("");
}

function computeScore(user, candidate) {
  const sharedInterests = user.interests.filter((interest) => candidate.interests.includes(interest)).length;
  const sharedGoals = user.goals.filter((goal) => candidate.goals.includes(goal)).length;
  const ageDifference = Math.abs(user.age - candidate.age);
  const sameCity = user.location === candidate.location ? 1 : 0;

  return sharedInterests * 3 + sharedGoals * 2 + sameCity * 5 - ageDifference * 0.5;
}

function findBestMatch() {
  const scoredCandidates = candidates.map((candidate) => ({
    ...candidate,
    score: computeScore(currentUser, candidate),
  }));

  scoredCandidates.sort((a, b) => b.score - a.score);
  return scoredCandidates[0];
}

function showMatchResult() {
  const result = findBestMatch();
  const resultContainer = document.getElementById("matchResult");
  const interests = result.interests.map((interest) => `<span>${interest}</span>`).join(" ");

  resultContainer.innerHTML = `
    <h3>${result.name}, ${result.age}</h3>
    <p><strong>Location:</strong> ${result.location}</p>
    <p><strong>Shared interests:</strong> ${currentUser.interests.filter((interest) => result.interests.includes(interest)).join(", ") || "None"}</p>
    <p><strong>Match score:</strong> ${result.score.toFixed(1)}</p>
    <div class="badge">${interests}</div>
  `;
}

function startSwiping() {
  currentCandidateIndex = 0;
  likedCandidates = [];
  matches = [];
  renderSwipeInterface();
}

function renderSwipeInterface() {
  if (currentCandidateIndex >= candidates.length) {
    showMatches();
    return;
  }
  const candidate = candidates[currentCandidateIndex];
  const interests = candidate.interests.map((interest) => `<span>${interest}</span>`).join(" ");
  document.getElementById("candidateList").innerHTML = `
    <article class="swipe-card">
      <h3>${candidate.name}, ${candidate.age}</h3>
      <p><strong>Location:</strong> ${candidate.location}</p>
      <p><strong>Interests:</strong></p>
      <div class="badge">${interests}</div>
      <div class="buttons">
        <button id="passBtn">Pass</button>
        <button id="likeBtn">Like</button>
      </div>
    </article>
  `;
}

function showMatches() {
  if (matches.length === 0) {
    document.getElementById("matchResult").innerHTML = "No matches found. Try editing your profile or swiping again!";
    document.getElementById("candidateList").innerHTML = "<p>Swipe complete. <button id='backToProfiles'>Back to Profiles</button></p>";
  } else {
    const bestMatch = matches.reduce((best, cand) => {
      return computeScore(currentUser, cand) > computeScore(currentUser, best) ? cand : best;
    });
    const resultContainer = document.getElementById("matchResult");
    const interests = bestMatch.interests.map((interest) => `<span>${interest}</span>`).join(" ");
    resultContainer.innerHTML = `
      <h3>${bestMatch.name}, ${bestMatch.age}</h3>
      <p><strong>Location:</strong> ${bestMatch.location}</p>
      <p><strong>Shared interests:</strong> ${currentUser.interests.filter((interest) => bestMatch.interests.includes(interest)).join(", ") || "None"}</p>
      <p><strong>Match score:</strong> ${computeScore(currentUser, bestMatch).toFixed(1)}</p>
      <div class="badge">${interests}</div>
    `;
    document.getElementById("candidateList").innerHTML = `<p>You have ${matches.length} match(es)! Best match shown above. <button id='backToProfiles'>Back to Profiles</button></p>`;
  }
}

renderProfile("currentUserInfo", currentUser);
renderCandidates();

document.getElementById("findMatchBtn").textContent = "Start Swiping";
document.getElementById("findMatchBtn").addEventListener("click", startSwiping);

document.addEventListener('click', (e) => {
  if (e.target.id === 'editBtn') {
    isEditing = true;
    renderProfile("currentUserInfo", currentUser);
  } else if (e.target.id === 'saveBtn') {
    currentUser.name = document.getElementById('editName').value;
    currentUser.age = parseInt(document.getElementById('editAge').value);
    currentUser.location = document.getElementById('editLocation').value;
    currentUser.interests = Array.from(document.getElementById('editInterests').selectedOptions).map(option => option.value);
    currentUser.goals = Array.from(document.getElementById('editGoals').selectedOptions).map(option => option.value);
    isEditing = false;
    renderProfile("currentUserInfo", currentUser);
    document.getElementById("matchResult").innerHTML = "Press the button to see your match.";
  } else if (e.target.id === 'cancelBtn') {
    isEditing = false;
    renderProfile("currentUserInfo", currentUser);
  } else if (e.target.classList.contains('editCandBtn')) {
    editingCandidateId = parseInt(e.target.dataset.candidateId);
    isEditingCandidate = true;
    renderCandidates();
  } else if (e.target.classList.contains('saveCandBtn')) {
    const id = parseInt(e.target.dataset.candidateId);
    const candidate = candidates.find(c => c.id === id);
    candidate.name = document.getElementById('editCandName').value;
    candidate.age = parseInt(document.getElementById('editCandAge').value);
    candidate.location = document.getElementById('editCandLocation').value;
    candidate.interests = Array.from(document.getElementById('editCandInterests').selectedOptions).map(option => option.value);
    candidate.goals = Array.from(document.getElementById('editCandGoals').selectedOptions).map(option => option.value);
    isEditingCandidate = false;
    editingCandidateId = null;
    renderCandidates();
    document.getElementById("matchResult").innerHTML = "Press the button to see your match.";
  } else if (e.target.id === 'passBtn') {
    currentCandidateIndex++;
    renderSwipeInterface();
  } else if (e.target.id === 'likeBtn') {
    const candidate = candidates[currentCandidateIndex];
    likedCandidates.push(candidate);
    const score = computeScore(currentUser, candidate);
    if (score > 5) { // threshold for mutual like
      matches.push(candidate);
    }
    currentCandidateIndex++;
    renderSwipeInterface();
  } else if (e.target.id === 'backToProfiles') {
    renderCandidates();
    document.getElementById("findMatchBtn").textContent = "Start Swiping";
  }
});
