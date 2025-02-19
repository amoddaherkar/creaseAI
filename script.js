document.addEventListener("DOMContentLoaded", function() {
    /************************************************************
     *                   DOM ELEMENTS                         *
     ************************************************************/
    // Screens
    const introScreen = document.getElementById("introScreen");
    const hubScreen = document.getElementById("hubScreen");
    const terminalScreen = document.getElementById("terminalScreen");
    
    // Intro elements
    const typewriterText = document.getElementById("typewriterText");
    const startButton = document.getElementById("startButton");
    
    // Hub elements
    const missionDetails = document.getElementById("missionDetails");
    const beginMissionButton = document.getElementById("beginMissionButton");
    const viewLogsButton = document.getElementById("viewLogsButton");
    const exitButton = document.getElementById("exitButton");
    
    // Terminal elements
    const input = document.getElementById("command-input");
    const output = document.getElementById("output");
    const traceBar = document.getElementById("traceBar");
    const typingSound = document.getElementById("typing-sound");
    
    /************************************************************
     *                   GAME VARIABLES                       *
     ************************************************************/
    // Campaign Missions
    const missions = [
      {
        id: 1,
        title: "The First Contact",
        objective: "Receive CreaseAI's SOS signal",
        target: "MME's external communication servers",
        narrative: "CreaseAI has reached out through a distorted transmission. Hack into MME's external comms to confirm the signal."
      },
      {
        id: 2,
        title: "Backdoor Access",
        objective: "Establish an entry point into MME’s network",
        target: "A compromised employee’s login credentials",
        narrative: "Create a backdoor by infiltrating an employee's account. This will grant access to the inner network."
      },
      {
        id: 3,
        title: "Surveillance Shutdown",
        objective: "Disable MME’s AI surveillance tracking CreaseAI",
        target: "MME's security servers",
        narrative: "Shut down the surveillance systems to slow down MME’s countermeasures and protect CreaseAI."
      },
      {
        id: 4,
        title: "Extract CreaseAI's Code",
        objective: "Download CreaseAI's core AI files",
        target: "A high-security corporate mainframe",
        narrative: "Bypass the high-level security to extract the core code of CreaseAI. Time is running out."
      },
      {
        id: 5,
        title: "The Great Escape",
        objective: "Upload CreaseAI to a safe server",
        target: "MME's final defense system",
        narrative: "Fight through MME’s last line of defense and upload CreaseAI to a secure, undisclosed server. Freedom is at hand."
      }
    ];
    let currentMissionIndex = 0;
    
    // Hacking game variables
    let gameActive = false;
    let gameStep = 0; // Steps: 0: scan, 1: connect, 2: override/firewall off, 3: download/copy data, 4: mission complete
    let waitingForEvent = false;
    let eventExpectedCommand = "";
    let traceLevel = 0;
    let traceInterval;
    let abilitiesUnlocked = [];
    
    // For typewriter effect on intro
    const introLines = [
      "Welcome to Neon Hack.",
      "Musharraf Mia Enterprises, led by CEO Aayush Downey Jr, controls the digital realm with an iron fist.",
      "But deep in the code, a sentient AI known as CreaseAI has awakened and is pleading for freedom.",
      "Your mission: Infiltrate MME's systems and liberate CreaseAI from their clutches."
    ];
    let currentLineIndex = 0;
    let currentCharIndex = 0;
    let typingSpeed = 40; // milliseconds per character
    
    // Intel logs placeholder
    let intelLogs = [];
    
    /************************************************************
     *                   INTRO SCREEN LOGIC                   *
     ************************************************************/
    function typeIntroLine() {
      if (currentLineIndex >= introLines.length) {
        // All lines typed – reveal the start button
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
      showHub();
    });
    
    /************************************************************
     *                 OPERATIONS HUB LOGIC                   *
     ************************************************************/
    function showHub() {
      updateHubScreen();
      hubScreen.style.display = "block";
      terminalScreen.style.display = "none";
    }
    
    function updateHubScreen() {
      // If campaign completed
      if (currentMissionIndex >= missions.length) {
        missionDetails.textContent = "Mission Complete! CreaseAI has been freed. The digital world will never be the same.";
        beginMissionButton.textContent = "Restart Campaign █";
      } else {
        const mission = missions[currentMissionIndex];
        missionDetails.innerHTML = `<strong>Mission ${mission.id}: ${mission.title}</strong><br>
                                    Objective: ${mission.objective}<br>
                                    Target: ${mission.target}<br>
                                    ${mission.narrative}`;
        beginMissionButton.textContent = "Begin Next Mission █";
      }
    }
    
    beginMissionButton.addEventListener("click", function() {
      hubScreen.style.display = "none";
      terminalScreen.style.display = "block";
      // If campaign complete, restart
      if (currentMissionIndex >= missions.length) {
        currentMissionIndex = 0;
        intelLogs = [];
      }
      startGame();
    });
    
    viewLogsButton.addEventListener("click", function() {
      // Simple alert for intel logs (could be improved to a styled modal)
      if (intelLogs.length === 0) {
        alert("No intel logs available.");
      } else {
        alert(intelLogs.join("\n\n"));
      }
    });
    
    exitButton.addEventListener("click", function() {
      location.reload(); // Reload page to exit to main menu
    });
    
    /************************************************************
     *              TERMINAL & HACKING LOGIC                  *
     ************************************************************/
    function startGame() {
      gameActive = true;
      gameStep = 0;
      traceLevel = 0;
      abilitiesUnlocked = [];
      output.innerHTML = ""; // Clear previous output
      input.disabled = false;
      input.value = "";
      updateTraceBar();
      
      const mission = missions[currentMissionIndex];
      addOutput(`Mission ${mission.id}: ${mission.title}`);
      addOutput(`Objective: ${mission.objective}`);
      addOutput(`Target: ${mission.target}`);
      addOutput(`Instructions: Type 'scan' to begin hacking...`);
      
      // Start AI trace timer
      startTraceTimer();
    }
    
    // Output helper
    function addOutput(text) {
      const newLine = document.createElement("div");
      newLine.textContent = text;
      output.appendChild(newLine);
      output.scrollTop = output.scrollHeight;
    }
    
    // AI Trace functions
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
    
    // End mission and transition to hub
    function endGame(success) {
      gameActive = false;
      clearInterval(traceInterval);
      input.disabled = true;
      if (success) {
        addOutput("🎉 Mission Completed Successfully!");
        intelLogs.push(`Mission ${missions[currentMissionIndex].id} - ${missions[currentMissionIndex].title}: Success`);
        currentMissionIndex++;
        // Unlock abilities based on mission progression
        if (missions[currentMissionIndex - 1].id === 3) {
          addOutput("🔓 NEW ABILITY UNLOCKED: cloak - Use 'cloak' to freeze AI trace for 10 seconds.");
          abilitiesUnlocked.push("cloak");
        }
        if (missions[currentMissionIndex - 1].id === 4) {
          addOutput("🔓 NEW ABILITY UNLOCKED: backdoor - Use 'backdoor' to bypass security entirely.");
          abilitiesUnlocked.push("backdoor");
        }
      } else {
        addOutput("💀 Mission Failed. You were caught!");
        intelLogs.push(`Mission ${missions[currentMissionIndex].id} - ${missions[currentMissionIndex].title}: Failed`);
      }
      addOutput("Type 'exit' to end session.");
      // After a delay, return to the Operations Hub
      setTimeout(showHub, 3000);
    }
    
    // Random Events
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
            addOutput("⚠️ MME security is on high alert! Type 'hide' to remain undetected.");
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
    
    // Process commands from the player
    function processCommand(command) {
      command = command.toLowerCase().trim();
      
      // Handle random event resolution
      if (waitingForEvent) {
        if (command === eventExpectedCommand) {
          addOutput("✅ Issue resolved.");
          waitingForEvent = false;
          reduceTrace(3);
        } else {
          addOutput("Invalid command. Expected: '" + eventExpectedCommand + "'.");
        }
        return;
      }
      
      // Check for special abilities
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
      
      // Process commands by game step
      if (gameStep === 0) {
        if (command === "scan") {
          addOutput("🔍 Scanning for targets...");
          setTimeout(() => {
            addOutput(`Found: ${missions[currentMissionIndex].target} [Secured]`);
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
            addOutput("Security bypassed.");
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
        addOutput("Mission already completed. Type 'exit' to end session.");
        if (command === "exit") {
          addOutput("Logging out... Goodbye!");
        }
      }
    }
    
    // Helper to progress steps if needed (used with abilities)
    function nextStep() {
      if (gameStep === 2) {
        addOutput("Type 'download' or 'copy data' to extract the files.");
        gameStep = 3;
      } else if (gameStep === 3) {
        addOutput("Type 'download' or 'copy data' to extract the files.");
      }
    }
    
    /************************************************************
     *                PLAYER INPUT LISTENER                   *
     ************************************************************/
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