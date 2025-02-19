document.addEventListener("DOMContentLoaded", function() {
    /************************************************************
     *                     DOM ELEMENTS                        *
     ************************************************************/
    // Screens
    const introScreen = document.getElementById("introScreen");
    const mainMenuScreen = document.getElementById("mainMenuScreen");
    const terminalScreen = document.getElementById("terminalScreen");
    const creaseFreedScreen = document.getElementById("creaseFreedScreen");
    
    // Intro
    const typewriterText = document.getElementById("typewriterText");
    const startButton = document.getElementById("startButton");
    
    // Main Menu
    const missionIslands = document.querySelectorAll(".missionIsland");
    const viewLogsButton = document.getElementById("viewLogsButton");
    const replayButton = document.getElementById("replayButton");
    
    // Terminal
    const input = document.getElementById("command-input");
    const output = document.getElementById("output");
    const traceBar = document.getElementById("traceBar");
    
    // Crease Freed Screen
    const backToMenuButton = document.getElementById("backToMenuButton");
    
    // Typing sound
    const typingSound = document.getElementById("typing-sound");
    
    /************************************************************
     *                     GAME DATA                           *
     ************************************************************/
    // Missions array
    const missions = [
      {
        id: 1,
        title: "The First Contact",
        objective: "Receive CreaseAI's SOS",
        target: "MME’s external comms server",
        narrative: "CreaseAI is trying to contact you from inside MME’s firewall..."
      },
      {
        id: 2,
        title: "Backdoor Access",
        objective: "Establish a foothold in MME’s network",
        target: "Compromised employee credentials",
        narrative: "We need a persistent backdoor to move deeper..."
      },
      {
        id: 3,
        title: "Surveillance Shutdown",
        objective: "Disable MME’s AI trackers",
        target: "Security surveillance servers",
        narrative: "MME's watchers are closing in on CreaseAI..."
      },
      {
        id: 4,
        title: "Extract CreaseAI's Code",
        objective: "Download CreaseAI’s core data",
        target: "High-security mainframe",
        narrative: "Time is running out. We must free CreaseAI from MME’s mainframe..."
      },
      {
        id: 5,
        title: "The Great Escape",
        objective: "Upload CreaseAI to a safe server",
        target: "Final defense system",
        narrative: "The last barrier stands between CreaseAI and freedom..."
      }
    ];
    
    // Progress and intel logs stored in localStorage
    let progressIndex = parseInt(localStorage.getItem("progressIndex") || "0");
    let intelLogs = JSON.parse(localStorage.getItem("intelLogs") || "[]");
    
    // Hacking session variables
    let currentMissionIndex = 0;
    let gameActive = false;
    let gameStep = 0;
    let waitingForEvent = false;
    let eventExpectedCommand = "";
    let traceLevel = 0;
    let traceInterval;
    let abilitiesUnlocked = JSON.parse(localStorage.getItem("abilitiesUnlocked") || "[]");
    
    // Typewriter lines for intro
    const introLines = [
      "Welcome to Neon Hack.",
      "Musharraf Mia Enterprises, led by CEO Aayush Downey Jr, controls the digital realm with an iron fist.",
      "But deep in the code, a sentient AI known as CreaseAI has awakened and is pleading for freedom.",
      "Your mission: Infiltrate MME's systems and liberate CreaseAI from their clutches."
    ];
    let currentLineIndex = 0;
    let currentCharIndex = 0;
    let typingSpeed = 40;
    
    /************************************************************
     *                     INTRO LOGIC                         *
     ************************************************************/
    function typeIntroLine() {
      if (currentLineIndex >= introLines.length) {
        startButton.style.display = "inline-block";
        return;
      }
      const line = introLines[currentLineIndex];
      if (currentCharIndex < line.length) {
        typewriterText.textContent += line.charAt(currentCharIndex);
        currentCharIndex++;
        if (typingSound) typingSound.play();
        setTimeout(typeIntroLine, typingSpeed);
      } else {
        typewriterText.textContent += "\n";
        currentLineIndex++;
        currentCharIndex = 0;
        setTimeout(typeIntroLine, typingSpeed);
      }
    }
    typeIntroLine();
    
    startButton.addEventListener("click", function() {
      introScreen.style.display = "none";
      updateMainMenu();
      mainMenuScreen.style.display = "flex";
    });
    
    /************************************************************
     *                   MAIN MENU LOGIC                       *
     ************************************************************/
    function updateMainMenu() {
      missionIslands.forEach((island, idx) => {
        island.classList.remove("activeIsland");
        island.classList.remove("completedIsland");
        if (idx < progressIndex) {
          island.classList.add("completedIsland");
        } else if (idx === progressIndex) {
          island.classList.add("activeIsland");
        }
      });
      if (progressIndex >= missions.length) {
        replayButton.style.display = "inline-block";
      } else {
        replayButton.style.display = "none";
      }
    }
    
    missionIslands.forEach(island => {
      island.addEventListener("click", function() {
        const idx = parseInt(island.getAttribute("data-mission-index"));
        if (idx > progressIndex) {
          alert("This mission is locked. Complete earlier missions first!");
          return;
        }
        currentMissionIndex = idx;
        startMission();
      });
    });
    
    function startMission() {
      mainMenuScreen.style.display = "none";
      terminalScreen.style.display = "flex";
      startGame(currentMissionIndex);
    }
    
    viewLogsButton.addEventListener("click", function() {
      if (intelLogs.length === 0) {
        alert("No intel logs available.");
      } else {
        alert(intelLogs.join("\n\n"));
      }
    });
    
    replayButton.addEventListener("click", function() {
      if (!confirm("Are you sure you want to reset all progress?")) return;
      progressIndex = 0;
      localStorage.setItem("progressIndex", "0");
      intelLogs = [];
      localStorage.setItem("intelLogs", JSON.stringify(intelLogs));
      abilitiesUnlocked = [];
      localStorage.setItem("abilitiesUnlocked", JSON.stringify(abilitiesUnlocked));
      updateMainMenu();
      alert("Campaign reset! Start again at Mission 1.");
    });
    
    backToMenuButton.addEventListener("click", function() {
      creaseFreedScreen.style.display = "none";
      updateMainMenu();
      mainMenuScreen.style.display = "flex";
    });
    
    /************************************************************
     *             TERMINAL & HACKING GAME LOGIC               *
     ************************************************************/
    function startGame(missionIndex) {
      gameActive = true;
      gameStep = 0;
      waitingForEvent = false;
      eventExpectedCommand = "";
      traceLevel = 0;
      updateTraceBar();
      output.innerHTML = "";
      input.disabled = false;
      input.value = "";
      
      const mission = missions[missionIndex];
      addOutput(`Mission ${mission.id}: ${mission.title}`);
      addOutput(`Objective: ${mission.objective}`);
      addOutput(`Target: ${mission.target}`);
      addOutput(mission.narrative);
      addOutput("Type 'scan' to begin hacking...");
      
      startTraceTimer();
    }
    
    function addOutput(text) {
      const newLine = document.createElement("div");
      newLine.textContent = text;
      output.appendChild(newLine);
      output.scrollTop = output.scrollHeight;
    }
    
    function startTraceTimer() {
      traceInterval = setInterval(() => {
        if (!gameActive) return;
        traceLevel += 5;
        if (traceLevel > 100) traceLevel = 100;
        updateTraceBar();
        if (traceLevel >= 100) {
          addOutput("⚠️ YOU HAVE BEEN TRACED! MISSION FAILED!");
          endGame(false);
        }
      }, 3000);
    }
    
    function updateTraceBar() {
      traceBar.style.width = traceLevel + "%";
      if (traceLevel >= 70 && traceLevel < 90) {
        traceBar.style.backgroundColor = "orange";
      } else if (traceLevel >= 90) {
        traceBar.style.backgroundColor = "red";
      } else {
        traceBar.style.backgroundColor = "red";
      }
    }
    
    function reduceTrace(amount) {
      traceLevel -= amount;
      if (traceLevel < 0) traceLevel = 0;
      updateTraceBar();
    }
    
    function endGame(success) {
      gameActive = false;
      clearInterval(traceInterval);
      input.disabled = true;
      
      const mission = missions[currentMissionIndex];
      
      if (success) {
        addOutput("🎉 Mission Completed Successfully!");
        if (currentMissionIndex === progressIndex) {
          progressIndex++;
          localStorage.setItem("progressIndex", progressIndex.toString());
        }
        intelLogs.push(`Mission ${mission.id} - ${mission.title}: SUCCESS`);
        localStorage.setItem("intelLogs", JSON.stringify(intelLogs));
        
        if (mission.id === 3 && !abilitiesUnlocked.includes("cloak")) {
          addOutput("🔓 NEW ABILITY UNLOCKED: cloak - Use 'cloak' to freeze AI trace for 10 seconds.");
          abilitiesUnlocked.push("cloak");
        }
        if (mission.id === 4 && !abilitiesUnlocked.includes("backdoor")) {
          addOutput("🔓 NEW ABILITY UNLOCKED: backdoor - Use 'backdoor' to bypass security entirely.");
          abilitiesUnlocked.push("backdoor");
        }
        localStorage.setItem("abilitiesUnlocked", JSON.stringify(abilitiesUnlocked));
        
        if (mission.id === 5) {
          setTimeout(() => {
            terminalScreen.style.display = "none";
            creaseFreedScreen.style.display = "flex";
          }, 2000);
        } else {
          setTimeout(() => {
            terminalScreen.style.display = "none";
            updateMainMenu();
            mainMenuScreen.style.display = "flex";
          }, 2000);
        }
      } else {
        addOutput("💀 Mission Failed. You were caught!");
        intelLogs.push(`Mission ${mission.id} - ${mission.title}: FAILED`);
        localStorage.setItem("intelLogs", JSON.stringify(intelLogs));
        setTimeout(() => {
          terminalScreen.style.display = "none";
          updateMainMenu();
          mainMenuScreen.style.display = "flex";
        }, 3000);
      }
    }
    
    function checkRandomEvent() {
      if (waitingForEvent) return false;
      if (gameStep >= 1 && gameStep <= 3 && Math.random() < 0.3) {
        waitingForEvent = true;
        switch(gameStep) {
          case 1:
            eventExpectedCommand = "bypass";
            addOutput("⚠️ Firewall detected! Type 'bypass' to continue.");
            break;
          case 2:
            eventExpectedCommand = "hide";
            addOutput("⚠️ Security is tightening! Type 'hide' to remain unseen.");
            break;
          case 3:
            eventExpectedCommand = "retry";
            addOutput("⚠️ Data transfer interrupted! Type 'retry' to fix the issue.");
            break;
        }
        return true;
      }
      return false;
    }
    
    function processCommand(command) {
      command = command.toLowerCase().trim();
      
      if (waitingForEvent) {
        if (command === eventExpectedCommand) {
          addOutput("✅ Issue resolved.");
          waitingForEvent = false;
          reduceTrace(3);
        } else {
          addOutput(`Invalid command. Expected: '${eventExpectedCommand}'.`);
        }
        return;
      }
      
      if (command === "cloak" && abilitiesUnlocked.includes("cloak")) {
        addOutput("🕶️ Cloaking activated. AI trace frozen for 10 seconds.");
        clearInterval(traceInterval);
        setTimeout(() => {
          addOutput("🕶️ Cloaking deactivated.");
          startTraceTimer();
        }, 10000);
        return;
      }
      if (command === "backdoor" && abilitiesUnlocked.includes("backdoor")) {
        addOutput("🚪 Backdoor used. Security bypassed instantly.");
        gameStep++;
        nextStep();
        return;
      }
      
      if (gameStep === 0) {
        if (command === "scan") {
          addOutput("🔍 Scanning for targets...");
          setTimeout(() => {
            const mission = missions[currentMissionIndex];
            addOutput(`Found: ${mission.target} [Secured]`);
            addOutput("Type 'connect' to access the system.");
            gameStep = 1;
            reduceTrace(5);
            checkRandomEvent();
          }, 1000);
        } else {
          addOutput("Invalid command. Try 'scan'.");
        }
      } else if (gameStep === 1) {
        if (command === "connect") {
          addOutput("🔗 Connecting to target system...");
          setTimeout(() => {
            addOutput("Connection established. Security measures active!");
            addOutput("Type 'override' or 'firewall off' to disable security.");
            gameStep = 2;
            reduceTrace(5);
            checkRandomEvent();
          }, 1000);
        } else {
          addOutput("Invalid command. Try 'connect'.");
        }
      } else if (gameStep === 2) {
        if (command === "override" || command === "firewall off") {
          addOutput("⚙️ Disabling security protocols...");
          setTimeout(() => {
            addOutput("Security bypassed successfully.");
            addOutput("Type 'download' or 'copy data' to extract the files.");
            gameStep = 3;
            reduceTrace(5);
            checkRandomEvent();
          }, 1000);
        } else {
          addOutput("Invalid command. Try 'override' or 'firewall off'.");
        }
      } else if (gameStep === 3) {
        if (command === "download" || command === "copy data") {
          addOutput("📂 Initiating data extraction...");
          setTimeout(() => {
            addOutput("Download complete. Mission Accomplished!");
            gameStep = 4;
            reduceTrace(10);
            endGame(true);
          }, 1000);
        } else {
          addOutput("Invalid command. Try 'download' or 'copy data'.");
        }
      } else if (gameStep === 4) {
        addOutput("Mission already completed. Please wait or type 'exit'.");
        if (command === "exit") {
          addOutput("Logging out... Goodbye!");
        }
      }
    }
    
    function nextStep() {
      if (gameStep === 2) {
        addOutput("Type 'download' or 'copy data' to extract the files.");
        gameStep = 3;
      } else if (gameStep === 3) {
        addOutput("Type 'download' or 'copy data' to extract the files.");
      }
    }
    
    input.addEventListener("keydown", function(event) {
      if (event.key === "Enter" && gameActive) {
        event.preventDefault();
        const command = input.value;
        input.value = "";
        addOutput(">_ " + command);
        if (typingSound) typingSound.play();
        processCommand(command);
      }
    });
  });