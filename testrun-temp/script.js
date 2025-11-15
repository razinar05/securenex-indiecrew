document.addEventListener("DOMContentLoaded", function() {

    // === 1. GET ALL THE ELEMENTS ===
    const loginPage = document.getElementById("login-page");
    const loginButton = document.getElementById("login-button");
    const hubPage = document.getElementById("hub-page");
    const navSentinel = document.getElementById("nav-sentinel");
    const navVanguard = document.getElementById("nav-vanguard");
    const logoutButton = document.getElementById("logout-button");
    const sentinelModule = document.getElementById("sentinel-module");
    const vanguardModule = document.getElementById("vanguard-module");
    const sentinelScanButton = document.getElementById("sentinel-scan-button");
    const sentinelEmailInput = document.getElementById("sentinel-email-input");
    const sentinelLoading = document.getElementById("sentinel-loading");
    const sentinelResults = document.getElementById("sentinel-results");
    const sentinelResultsTitle = document.getElementById("sentinel-results-title");
    const sentinelResultsList = document.getElementById("sentinel-results-list");
    
    // --- Vanguard (NEW UI) ---
    const vanguardVetButton = document.getElementById("vanguard-vet-button");
    const vanguardLoading = document.getElementById("vanguard-loading");
    const vanguardLoadingText = document.getElementById("vanguard-loading-text");
    const vanguardReport = document.getElementById("vanguard-report");
    const vanguardReportTitle = document.getElementById("vanguard-report-title");
    const rawTextInput = document.getElementById("raw-text-input");
    const charCounter = document.getElementById("char-counter");
    
    // NEW: Get the toggle buttons
    const modeReaction = document.getElementById("mode-reaction");
    const modeRisk = document.getElementById("mode-risk");

    // NEW: Get all the report pods
    const podSummary = document.getElementById("pod-summary");
    const podThemes = document.getElementById("pod-themes");
    const podRisks = document.getElementById("pod-risks"); 
    const podActions = document.getElementById("pod-actions");
    const reportSummaryContent = document.getElementById("report-summary-content");
    const reportThemesContent = document.getElementById("report-themes-content");
    const reportRisksContent = document.getElementById("report-risks-content"); 
    const reportActionsContent = document.getElementById("report-actions-content");

    // === 2. DEFINE FUNCTIONS ===
    // (Login, Logout, and Navigation logic is all unchanged)
    loginButton.addEventListener("click", function() {
        loginPage.classList.add("hidden");
        hubPage.classList.remove("hidden");
    });
    logoutButton.addEventListener("click", function() {
        hubPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
        sentinelModule.classList.remove("hidden");
        vanguardModule.classList.add("hidden");
        navSentinel.classList.add("active");
        navVanguard.classList.remove("active");
        sentinelResults.classList.add("hidden");
        vanguardReport.classList.add("hidden");
        vanguardReport.classList.remove("show", "status-clear", "status-danger");
    });
    navSentinel.addEventListener("click", function() {
        sentinelModule.classList.remove("hidden");
        navSentinel.classList.add("active");
        vanguardModule.classList.add("hidden");
        navVanguard.classList.remove("active");
    });
    navVanguard.addEventListener("click", function() {
        vanguardModule.classList.remove("hidden");
        navVanguard.classList.add("active");
        sentinelModule.classList.add("hidden");
        navSentinel.classList.remove("active");
    });

    // === 3. MODULE LOGIC ===

    // --- Sentinel Scan Logic (Unchanged) ---
    sentinelScanButton.addEventListener("click", function() {
        // (This code is unchanged and correct)
        const emailToTest = sentinelEmailInput.value;
        if (!emailToTest) { alert("Please enter an email to scan."); return; }
        sentinelLoading.classList.remove("hidden");
        sentinelResults.classList.add("hidden");
        sentinelResults.classList.remove("show", "status-clear", "status-danger"); 
        sentinelResultsList.innerHTML = ''; 
        fetch('http://localhost:3000/check-breach', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailToTest }) 
        })
        .then(response => response.json()) 
        .then(data => {
            sentinelLoading.classList.add("hidden");
            sentinelResults.classList.remove("hidden");
            sentinelResults.classList.add(data.breached ? "status-danger" : "status-clear");
            setTimeout(() => { sentinelResults.classList.add("show"); }, 10); 
            const li = document.createElement('li');
            if (data.breached === true) {
                sentinelResultsTitle.innerText = `Scan Complete: 1 At-Risk Credential Found`;
                li.innerHTML = `<span class="danger">COMPROMISED:</span> ${data.email} (Found in ${data.breachCount} breaches)`;
            } else {
                sentinelResultsTitle.innerText = `Scan Complete: 0 At-Risk Credentials Found`;
                li.innerHTML = `<span class="success">SAFE:</span> ${data.email} (Not found in any known breaches)`;
            }
            sentinelResultsList.appendChild(li); 
        })
        .catch(error => {
            sentinelLoading.classList.add("hidden");
            sentinelResults.classList.remove("hidden");
            sentinelResults.classList.add("status-danger", "show");
            sentinelResultsTitle.innerText = `Scan Error`;
            sentinelResultsList.innerHTML = `<li><span class="danger">ERROR:</span> Could not connect to backend. Is it running?</li>`;
        });
    });

    // --- Character Counter for Vanguard ---
    rawTextInput.addEventListener("input", () => {
        const length = rawTextInput.value.length;
        charCounter.innerText = `${length} / 50000`;
        if (length > 50000) {
            charCounter.style.color = "var(--danger-red)";
        } else {
            charCounter.style.color = "var(--text-light)";
        }
    });

    // ==========================================================
    // == NEW: FUNCTION TO CLEAR INPUTS ON MODE SWITCH ==
    // ==========================================================
    function clearVanguardInputs() {
        console.log("Mode switched. Clearing inputs and reports.");
        
        // 1. Clear the text box
        rawTextInput.value = "";
        
        // 2. Hide the loading bar and report
        vanguardLoading.classList.add("hidden");
        vanguardReport.classList.add("hidden");
        vanguardReport.classList.remove("show", "status-clear", "status-danger");
        
        // 3. Clear all pod content
        reportSummaryContent.innerHTML = "";
        reportThemesContent.innerHTML = "";
        reportRisksContent.innerHTML = "";
        reportActionsContent.innerHTML = "";
        
        // 4. Reset character counter
        charCounter.innerText = "0 / 50000";
        charCounter.style.color = "var(--text-light)";
    }

    // Add the event listeners to the toggle buttons
    modeReaction.addEventListener("click", clearVanguardInputs);
    modeRisk.addEventListener("click", clearVanguardInputs);

    
    // ==========================================================
    // == "NON-AI" PARSER (v7) ==
    // ==========================================================
    
    function parseAndDisplayReport(aiText) {
        
        // --- Helper Function 1: Find Section Text ---
        const getSection = (text, startHeadings) => {
            try {
                let startIndex = -1;
                for (const heading of startHeadings) {
                    const startRegex = new RegExp(`(## |\\*\\*|# |\\d\\.) ?${heading}(\\*\\*|:)?`, 'i');
                    const match = text.match(startRegex);
                    if (match) {
                        startIndex = match.index + match[0].length;
                        break;
                    }
                }
                
                if (startIndex === -1) {
                    console.warn(`Parser: Could not find any of: ${startHeadings.join(', ')}`);
                    return null; 
                }
                
                const allHeadings = ['Executive Summary', 'Key Themes', 'Threat Analysis', 'Action Items', 'Potential Risks', 'Severity Assessment', 'Mitigation Strategy'];
                const endRegex = new RegExp(`^(## |\\*\\*|# |\\d\\.) ?(${allHeadings.join('|')})(\\*\\*|:)?`, 'im');
                
                const restOfText = text.substring(startIndex);
                const nextMatch = restOfText.match(endRegex);
                
                let sectionText;
                if (nextMatch) {
                    sectionText = restOfText.substring(0, nextMatch.index);
                } else {
                    sectionText = restOfText; 
                }
                
                // FINAL CLEANUP: Remove junk markdown
                return sectionText
                    .replace(/(\*\*|##|#|---)/g, '') // Remove lingering markdown
                    .replace("End of Briefing", "") // Remove AI sign-off
                    .trim();

            } catch (e) {
                console.error("Error parsing section:", e);
                return "Error parsing this section.";
            }
        };

        // --- Helper Function 2: Convert Cleaned Text to HTML ---
        const formatContent = (text) => {
            if (!text) return "<p>No data found for this section.</p>";
            
            let list_open = false;
            let html = '';

            text.split('\n') // Split into lines
                .map(line => line.trim()) // Clean whitespace
                .filter(line => {
                    // Filter out junk lines
                    if (line.length === 0) return false; 
                    if (line.match(/^(\d+\.|\*\*|\*|---)$/)) return false; 
                    if (line.toLowerCase().includes("end of briefing")) return false;
                    return true;
                })
                .forEach(line => {
                    // 1. Clean up junk *inside* the line
                    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
                    line = line.replace(/\*([^*]+)\*/g, '<em>$1</em>'); // Italics
                    line = line.replace(/\((High)\)/gi, '<span class="severity-High">$1</span>');
                    line = line.replace(/\((Medium)\)/gi, '<span class="severity-Medium">$1</span>');
                    line = line.replace(/\((Low)\)/gi, '<span class="severity-Low">$1</span>');

                    // 2. Check for bullet points
                    let isListItem = false;
                    if (line.startsWith('* ') || line.startsWith('- ')) {
                        line = `<li>${line.substring(2)}</li>`;
                        isListItem = true;
                    } else if (line.match(/^\d+\. /)) {
                        line = `<li>${line.substring(line.indexOf(' ') + 1)}</li>`;
                        isListItem = true;
                    }

                    // 3. Handle <ul> tags
                    if (isListItem && !list_open) {
                        html += '<ul>' + line; // Open new list
                        list_open = true;
                    } else if (!isListItem && list_open) {
                        html += '</ul>' + `<p>${line}</p>`; // Close list and start paragraph
                        list_open = false;
                    } else if (isListItem) {
                        html += line; // Add to existing list
                    } else {
                        html += `<p>${line}</p>`; // Add as paragraph
                    }
                });

            if (list_open) {
                html += '</ul>'; // Close any leftover list
            }
            
            return html;
        };

        // 1. Parse each section
        const summary = getSection(aiText, ['Executive Summary']);
        const themes = getSection(aiText, ['Key Themes', 'Potential Risks']); 
        const risks = getSection(aiText, ['Threat Analysis', 'Severity Assessment']);
        const actions = getSection(aiText, ['Action Items', 'Mitigation Strategy']);
        
        // 2. Format and Inject into Pods
        reportSummaryContent.innerHTML = formatContent(summary);
        reportThemesContent.innerHTML = formatContent(themes);
        reportRisksContent.innerHTML = formatContent(risks);
        reportActionsContent.innerHTML = formatContent(actions);
        
        // 3. Add Sentiment Coloring
        podSummary.classList.remove("sentiment-positive", "sentiment-negative");
        if (summary && (summary.toLowerCase().includes("negative") || summary.toLowerCase().includes("high risk"))) {
            podSummary.classList.add("sentiment-negative");
        } else if (summary && (summary.toLowerCase().includes("positive") || summary.toLowerCase().includes("clear"))) {
            podSummary.classList.add("sentiment-positive");
        }
    }

    // --- Vanguard Vetting Logic (Updated) ---
    vanguardVetButton.addEventListener("click", function() {
        console.log("FRONTEND: Vanguard analysis started");

        const rawText = rawTextInput.value;
        const analysisMode = document.querySelector('input[name="analysis-mode"]:checked').value;

        if (!rawText) {
            alert("Please paste some text to analyze.");
            return;
        }

        if (analysisMode === "public_reaction") {
            vanguardLoadingText.innerText = "Analyzing... (Searching the web and calling AI...)";
        } else {
            vanguardLoadingText.innerText = "Forecasting... (Calling Cohere AI...)";
        }

        vanguardLoading.classList.remove("hidden");
        vanguardReport.classList.add("hidden"); 
        vanguardReport.classList.remove("show", "status-clear", "status-danger");
        
        // Clear old content
        reportSummaryContent.innerHTML = "";
        reportThemesContent.innerHTML = "";
        reportRisksContent.innerHTML = "";
        reportActionsContent.innerHTML = "";
        [podSummary, podThemes, podRisks, podActions].forEach(pod => pod.classList.remove("show"));


        console.log(`FRONTEND: Sending text to server in ${analysisMode} mode...`);
        
        fetch('http://localhost:3000/vet-applicant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                rawText: rawText,
                analysisMode: analysisMode 
            })
        })
        .then(response => response.json()) 
        .then(data => {
            console.log("FRONTEND: Received AI report:", data.ai_summary);
            
            vanguardLoading.classList.add("hidden");
            vanguardReport.classList.remove("hidden");
            
            const isClear = data.status === 'Clear';
            
            vanguardReport.classList.add(isClear ? "status-clear" : "status-danger");
            setTimeout(() => { vanguardReport.classList.add("show"); }, 10);

            // Update titles based on mode
            if (analysisMode === "public_reaction") {
                vanguardReportTitle.innerText = `AI Public Reaction Briefing`;
                podThemes.querySelector('h4').innerText = "Key Themes";
                podRisks.querySelector('h4').innerText = "Threat Analysis";
                podActions.querySelector('h4').innerText = "Action Items";
            } else {
                vanguardReportTitle.innerText = `AI Future Risk Analysis`;
                podThemes.querySelector('h4').innerText = "Potential Risks";
                podRisks.querySelector('h4').innerText = "Risk Analysis"; 
                podActions.querySelector('h4').innerText = "Mitigation Strategy";
            }
            
            // NEW: Use the powerful parsing function
            parseAndDisplayReport(data.ai_summary);

            // NEW: Staggered animation for the pods
            setTimeout(() => { podSummary.classList.add("show"); }, 100);
            setTimeout(() => { podThemes.classList.add("show"); }, 200);
            setTimeout(() => { podRisks.classList.add("show"); }, 300);
            setTimeout(() => { podActions.classList.add("show"); }, 400);

        })
        .catch(error => {
            console.error('FRONTEND: Server error:', error);
            vanguardLoading.classList.add("hidden");
            vanguardReport.classList.remove("hidden");
            vanguardReport.classList.add("status-danger", "show");
            vanguardReportTitle.innerText = `Scan Error`;
            reportSummaryContent.innerHTML = `<p>An error occurred. Could not connect to the backend server.</p>`;
            podSummary.classList.add("show");
        });
    });

});