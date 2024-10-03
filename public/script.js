document.addEventListener('DOMContentLoaded', () => {
  const loading = document.getElementById('loading');
  const form = document.getElementById("loginForm");
  const botStateInput = document.getElementById('botState');
  const prefixInput = document.getElementById('prefix');
  const guideButton = document.getElementById('toggleGuide');
  const guideSection = document.getElementById('guideSection');
  const commandList = document.getElementById('commands');
  const commandModal = document.getElementById('commandModal');
  const openModalButton = document.getElementById('openModal');
  const closeModalButton = document.querySelector('.close');
  const submitButton = form.querySelector('button[type="submit"]');

  const prevPageButton = document.getElementById('prevPage');
  const nextPageButton = document.getElementById('nextPage');

  let currentPage = 1;
  const commandsPerPage = 5;
  let commandsData = [];
  let isCooldown = false;
  let countdownInterval;

  guideButton.addEventListener('click', () => {
    if (guideSection.style.display === 'none' || guideSection.style.display === '') {
      guideSection.style.display = 'block';
      guideButton.textContent = 'Hide Guide';
    } else {
      guideSection.style.display = 'none';
      guideButton.textContent = 'Show Guide';
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isCooldown) {
      return;
    }

    // Disable the submit button immediately
    submitButton.disabled = true;
    isCooldown = true;

    const botState = botStateInput.value.trim();
    const prefix = prefixInput.value.trim();

    if (!botState || !prefix) {
      alert('Bot state and prefix are required.');
      return;
    }

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          botState,
          prefix,
        }),
      });

      if (response.ok) {
        document.cookie = "loggedIn=true; path=/; max-age=3600";
        alert("Logged in successfully!");
        botStateInput.value = "";
        prefixInput.value = "";
        startCooldown(15);
      } else {
        document.cookie = "loggedIn=; path=/; max-age=0";
        alert("Failed to login.");
      }
    } catch (error) {
      console.error("Error:", error);
      document.cookie = "loggedIn=; path=/; max-age=0";
    }
  });

  function startCooldown(seconds) {
    let timeLeft = seconds;
    const countdownDisplay = document.getElementById("countdownDisplay");
    countdownDisplay.style.display = 'block';
    countdownDisplay.textContent = `Please wait ${timeLeft} seconds...`;

    countdownInterval = setInterval(() => {
      timeLeft--;
      countdownDisplay.textContent = `Please wait ${timeLeft} seconds...`;
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        submitButton.disabled = false;
        countdownDisplay.style.display = 'none';
        isCooldown = false;
      }
    }, 1000);
  }

  async function fetchCommands() {
    try {
      const response = await fetch('/commands');
      if (!response.ok) {
        throw new Error('Failed to fetch commands');
      }
      const commands = await response.json();
      commandsData = Object.keys(commands).map((name) => ({
        name,
        description: commands[name].description,
      }));
      displayCommands();
    } catch (error) {
      console.error('Error fetching commands:', error);
      alert('Failed to fetch commands. Please try again.');
    }
  }

  function displayCommands() {
    commandList.innerHTML = '';

    const startIndex = (currentPage - 1) * commandsPerPage;
    const endIndex = startIndex + commandsPerPage;
    const currentCommands = commandsData.slice(startIndex, endIndex);

    currentCommands.forEach((command) => {
      const li = document.createElement('li');
      li.className = 'command-item';
      li.innerHTML = `
        <div class="command-name">${command.name}</div>
        <div class="command-description">${command.description}</div>
      `;
      commandList.appendChild(li);
    });

    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = endIndex >= commandsData.length;
  }

  prevPageButton.addEventListener('click', () => {
    currentPage--;
    displayCommands();
  });

  nextPageButton.addEventListener('click', () => {
    currentPage++;
    displayCommands();
  });

  openModalButton.addEventListener('click', () => {
    commandModal.style.display = 'block';
  });

  closeModalButton.addEventListener('click', () => {
    commandModal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target === commandModal) {
      commandModal.style.display = 'none';
    }
  });

  fetchCommands();
  setTimeout(() => {
    loading.style.display = 'none';
  }, 4000);
});
