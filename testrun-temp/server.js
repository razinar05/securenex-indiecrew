const express = require('express');
const { CohereClient } = require('cohere-ai');
const app = express();
const port = 3000;

// === PASTE YOUR 1 WORKING API KEY HERE ===
const YOUR_COHERE_API_KEY = "u0Qlc9GG470xnuQOETb2oWkSzpHEpZkTeYh9bVUw";
// ===================================

// Setup Cohere AI
const cohere = new CohereClient({
    token: YOUR_COHERE_API_KEY,
});

// Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.use(express.json({ limit: '2mb' })); 

// ===============================================
// == SENTINEL MOCK ENDPOINT ==
// ===============================================
app.post('/check-breach', (req, res) => {
    // (This code is unchanged and correct)
    const email = req.body.email;
    setTimeout(() => {
        let mockResponse;
        if (Math.random() > 0.3) {
            mockResponse = { breached: true, email: email, breachCount: Math.floor(Math.random() * 18) + 1 };
        } else {
            mockResponse = { breached: false, email: email };
        }
        res.json(mockResponse);
    }, 3000); 
});

// ===============================================
// == VANGUARD "STRATEGIC INTEL" ENDPOINT ==
// ===============================================
app.post('/vet-applicant', async (req, res) => {
    
    // Get the data from the frontend
    const { rawText, analysisMode } = req.body;

    console.log(`SERVER: Intel request received. Mode: ${analysisMode}`);
    
    if (!rawText) {
        return res.status(400).json({ status: 'RedFlag', ai_summary: 'No text was provided for analysis.' });
    }

    let chatOptions = {
        model: "command-a-03-2025", // The correct, working model
        message: "",
        // The "connectors" parameter is now removed
    };

    // --- THIS IS THE NEW LOGIC ---
    if (analysisMode === "public_reaction") {
        // --- PART 1: PUBLIC OSINT ---
        console.log("SERVER: Running PUBLIC REACTION (OSINT) analysis...");
        
        chatOptions.message = `You are a professional Intelligence Analyst for PETRONAS.
        I have provided an official company announcement.
        Please **search the public internet** for real-time news, social media, and public sentiment reacting to this announcement.

        Then, provide a concise "Intelligence Briefing" using ONLY the 4 headings below.
        For bullet points, use ONLY 3-5 word keywords or very short phrases. Do NOT add extra paragraphs.
        Do NOT use any markdown like '*' or '##'.

        Executive Summary:
        (Write a 1-2 sentence overview of public sentiment)

        Key Themes:
        - (Keyword 1)
        - (Keyword 2)
        - (Keyword 3)

        Threat Analysis:
        - (Keyword 1)
        - (Keyword 2)

        Action Items:
        - (Keyword 1)
        - (Keyword 2)

        Here is the company's announcement:
        ---
        ${rawText}
        ---
        `;
        
        // The "connectors" line that caused the error is now GONE.
        // The AI will search the web automatically because of the prompt.

    } else {
        // --- PART 2: FUTURE RISK ---
        console.log("SERVER: Running FUTURE RISK (Forecasting) analysis...");
        
        chatOptions.message = `You are a professional Risk Analyst and Futurist for PETRONAS.
        I have provided a *hypothetical future plan* for the company.
        Please **do not search the web**, as this plan is not public.

        Provide a "Future Risk Analysis" using ONLY the 4 headings below.
        For bullet points, use ONLY 3-5 word keywords or very short phrases. Do NOT add extra paragraphs.
        Do NOT use any markdown like '*' or '##'.

        Executive Summary:
        (Write a 1-2 sentence overview of the primary risks)

        Potential Risks:
        - (Risk keyword 1) (High/Medium/Low)
        - (Risk keyword 2) (High/Medium/Low)
        - (Risk keyword 3) (High/Medium/Low)

        Severity Assessment:
        - (Risk keyword 1)
        - (Risk keyword 2)

        Mitigation Strategy:
        - (Strategy keyword 1)
        - (Strategy keyword 2)
        
        Here is the hypothetical plan:
        ---
        ${rawText}
        ---
        `;
    }
    // --- END OF NEW LOGIC ---


    // --- REAL: Cohere AI Summary ---
    console.log("SERVER: Calling REAL Cohere AI...");
    try {
        const result = await cohere.chat(chatOptions);
        const ai_summary = result.text; // The AI's full report

        // --- Send Final Report ---
        res.json({
            name: "AI Analysis",
            status: ai_summary.includes("Negative") || ai_summary.includes("High") ? 'RedFlag' : 'Clear', 
            ai_summary: ai_summary,
        });

    } catch (e) {
        console.error("Cohere AI Error:", e.message);
        res.json({
            name: "AI Analysis",
            status: 'RedFlag',
            ai_summary: 'The AI summarizer failed. Check your Cohere API Key.',
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
    console.log('This is your "server kitchen." Leave it running!');
});