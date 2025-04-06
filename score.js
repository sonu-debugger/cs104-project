// score.js - Main logic for the cricket scoring application

// Match data storage structure
let matchData = {
    team1: '',
    team2: '',
    tossWinner: '',
    tossDecision: '',
    maxOvers: 2,
    currentInnings: 1,
    innings1: {
        battingTeam: '',
        bowlingTeam: '',
        totalRuns: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        extras: 0,
        batters: [],
        bowlers: [],
        currentStriker: null,
        currentNonStriker: null,
        currentBowler: null,
        isCompleted: false
    },
    innings2: {
        battingTeam: '',
        bowlingTeam: '',
        totalRuns: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        extras: 0,
        batters: [],
        bowlers: [],
        currentStriker: null,
        currentNonStriker: null,
        currentBowler: null,
        isCompleted: false
    },
    isMatchCompleted: false
};

// Check if we have saved match data in localStorage
function loadMatchData() {
    const savedData = localStorage.getItem('cricketMatchData');
    if (savedData) {
        matchData = JSON.parse(savedData);
    }
}

// Save match data to localStorage
function saveMatchData() {
    localStorage.setItem('cricketMatchData', JSON.stringify(matchData));
}

// Helper function to get current innings data
function getCurrentInningsData() {
    return matchData.currentInnings === 1 ? matchData.innings1 : matchData.innings2;
}

// SETUP PAGE LOGIC
if (window.location.pathname.includes('setup.html')) {
    // Clear existing match data
    localStorage.removeItem('cricketMatchData');
    
    // Handle form submission
    document.getElementById('startMatchBtn').addEventListener('click', function() {
        // Get form values
        const team1 = document.getElementById('team1').value.trim();
        const team2 = document.getElementById('team2').value.trim();
        const tossWinner = document.getElementById('tossWinner').value;
        const tossDecision = document.getElementById('tossDecision').value;
        
        // Validate inputs
        if (!team1 || !team2 || !tossWinner || !tossDecision) {
            alert('Please fill in all fields');
            return;
        }
        
        // Set up match data
        matchData.team1 = team1;
        matchData.team2 = team2;
        matchData.tossWinner = tossWinner;
        matchData.tossDecision = tossDecision;
        
        // Determine batting and bowling teams for first innings
        if (
            (tossWinner === 'team1' && tossDecision === 'bat') || 
            (tossWinner === 'team2' && tossDecision === 'bowl')
        ) {
            matchData.innings1.battingTeam = team1;
            matchData.innings1.bowlingTeam = team2;
            matchData.innings2.battingTeam = team2;
            matchData.innings2.bowlingTeam = team1;
        } else {
            matchData.innings1.battingTeam = team2;
            matchData.innings1.bowlingTeam = team1;
            matchData.innings2.battingTeam = team1;
            matchData.innings2.bowlingTeam = team2;
        }
        
        // Save match data
        saveMatchData();
        
        // Redirect to live match page
        window.location.href = 'live.html';
    });
}

// LIVE MATCH PAGE LOGIC
if (window.location.pathname.includes('live.html')) {
    // Load match data
    loadMatchData();
    
    // Check if match data exists, otherwise redirect to setup
    if (!matchData.team1 || !matchData.team2) {
        window.location.href = 'setup.html';
    }
    
    // Initialize the page if this is the first load
    window.onload = function() {
        initializeInnings();
        updateLiveDisplay();
    };
    
    // Function to initialize an innings
    function initializeInnings() {
        const inningsData = getCurrentInningsData();
        
        // If the current innings hasn't been initialized yet
        if (!inningsData.currentStriker) {
            // Prompt for batter names
            const striker = prompt(`Enter name for the first batter of ${inningsData.battingTeam}:`);
            const nonStriker = prompt(`Enter name for the second batter of ${inningsData.battingTeam}:`);
            const bowler = prompt(`Enter name for the first bowler of ${inningsData.bowlingTeam}:`);
            
            if (!striker || !nonStriker || !bowler) {
                alert('All names are required. Please refresh the page to start again.');
                return;
            }
            
            // Create batter objects
            inningsData.batters.push({
                name: striker,
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
                isOut: false,
                status: 'Not Out'
            });
            
            inningsData.batters.push({
                name: nonStriker,
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
                isOut: false,
                status: 'Not Out'
            });
            
            // Create bowler object
            inningsData.bowlers.push({
                name: bowler,
                overs: 0,
                balls: 0,
                maidenInProgress: true,
                maidens: 0,
                runs: 0,
                wickets: 0
            });
            
            // Set current players
            inningsData.currentStriker = 0; // Index of striker in batters array
            inningsData.currentNonStriker = 1; // Index of non-striker in batters array
            inningsData.currentBowler = 0; // Index of current bowler in bowlers array
            
            // Save updated match data
            saveMatchData();
        }
    }
    
    // Update the live display with current match data
    function updateLiveDisplay() {
        const inningsData = getCurrentInningsData();
        
        // Update match status
        updateMatchStatus();
        
        // Update batter info
        if (inningsData.currentStriker !== null) {
            const striker = inningsData.batters[inningsData.currentStriker];
            document.getElementById('strikerName').textContent = striker.name + ' *';
            document.getElementById('strikerRuns').textContent = striker.runs;
            document.getElementById('strikerBalls').textContent = striker.balls;
            document.getElementById('striker4s').textContent = striker.fours;
            document.getElementById('striker6s').textContent = striker.sixes;
            document.getElementById('strikerSR').textContent = striker.balls > 0 ? 
                ((striker.runs / striker.balls) * 100).toFixed(2) : '0.00';
        }
        
        if (inningsData.currentNonStriker !== null) {
            const nonStriker = inningsData.batters[inningsData.currentNonStriker];
            document.getElementById('nonStrikerName').textContent = nonStriker.name;
            document.getElementById('nonStrikerRuns').textContent = nonStriker.runs;
            document.getElementById('nonStrikerBalls').textContent = nonStriker.balls;
            document.getElementById('nonStriker4s').textContent = nonStriker.fours;
            document.getElementById('nonStriker6s').textContent = nonStriker.sixes;
            document.getElementById('nonStrikerSR').textContent = nonStriker.balls > 0 ? 
                ((nonStriker.runs / nonStriker.balls) * 100).toFixed(2) : '0.00';
        }
        
        // Update bowler info
        if (inningsData.currentBowler !== null) {
            const bowler = inningsData.bowlers[inningsData.currentBowler];
            document.getElementById('bowlerName').textContent = bowler.name;
            document.getElementById('bowlerOvers').textContent = `${bowler.overs}.${bowler.balls}`;
            document.getElementById('bowlerMaidens').textContent = bowler.maidens;
            document.getElementById('bowlerRuns').textContent = bowler.runs;
            document.getElementById('bowlerWickets').textContent = bowler.wickets;
            document.getElementById('bowlerEconomy').textContent = calculateEconomy(bowler);
        }
        
        // Update run rates
        updateRunRates();
    }
    
    // Update the match status display
    function updateMatchStatus() {
        const statusElement = document.getElementById('matchStatus');
        const infoElement = document.getElementById('inningsInfo');
        const inningsData = getCurrentInningsData();
        
        // Format current score
        const currentScore = `${inningsData.totalRuns}/${inningsData.wickets}`;
        const currentOvers = `(${inningsData.overs}.${inningsData.balls})`;
        
        // First innings display
        if (matchData.currentInnings === 1) {
            statusElement.textContent = `${inningsData.battingTeam} ${currentScore} ${currentOvers} vs ${inningsData.bowlingTeam}`;
            infoElement.textContent = `1st Innings in progress`;
        } 
        // Second innings display
        else {
            const firstInningsScore = `${matchData.innings1.totalRuns}/${matchData.innings1.wickets} (${matchData.innings1.overs}.${matchData.innings1.balls})`;
            statusElement.textContent = `${inningsData.battingTeam} ${currentScore} ${currentOvers} vs ${inningsData.bowlingTeam} ${firstInningsScore}`;
            infoElement.textContent = `2nd Innings in progress • Target: ${matchData.innings1.totalRuns + 1} runs`;
        }
    }
    
    // Update run rates display
    function updateRunRates() {
        const runRatesElement = document.getElementById('runRates');
        const inningsData = getCurrentInningsData();
        
        // Calculate current run rate
        const totalOvers = inningsData.overs + (inningsData.balls / 6);
        const crr = totalOvers > 0 ? (inningsData.totalRuns / totalOvers).toFixed(2) : '0.00';
        
        // Only show required run rate in second innings
        if (matchData.currentInnings === 2) {
            const remainingRuns = matchData.innings1.totalRuns + 1 - inningsData.totalRuns;
            const remainingOvers = matchData.maxOvers - inningsData.overs - (inningsData.balls / 6);
            const rrr = remainingOvers > 0 ? (remainingRuns / remainingOvers).toFixed(2) : 'N/A';
            
            runRatesElement.innerHTML = `
                <div>CRR: ${crr}</div>
                <div>RRR: ${rrr}</div>
            `;
        } else {
            runRatesElement.innerHTML = `<div>CRR: ${crr}</div>`;
        }
    }
    
    // Calculate bowler's economy rate
    function calculateEconomy(bowler) {
        const totalOvers = bowler.overs + (bowler.balls / 6);
        return totalOvers > 0 ? (bowler.runs / totalOvers).toFixed(2) : '0.00';
    }
    
    // Handle run scoring
    const runButtons = document.querySelectorAll('.run-btn');
    runButtons.forEach(button => {
        button.addEventListener('click', function() {
            const runs = parseInt(this.getAttribute('data-runs'));
            addRuns(runs);
        });
    });
    
    // Handle wicket
    document.getElementById('wicketBtn').addEventListener('click', function() {
        processWicket();
    });
    
    // Handle navigation to scorecard
    document.getElementById('viewScorecardBtn').addEventListener('click', function() {
        window.location.href = 'scorecard.html';
    });
    
    // Add runs to the score
    function addRuns(runs) {
        const inningsData = getCurrentInningsData();
        
        // Update batter's stats
        const striker = inningsData.batters[inningsData.currentStriker];
        striker.runs += runs;
        striker.balls += 1;
        
        // Update fours and sixes
        if (runs === 4) striker.fours += 1;
        if (runs === 6) striker.sixes += 1;
        
        // Update bowler's stats
        const bowler = inningsData.bowlers[inningsData.currentBowler];
        bowler.runs += runs;
        bowler.balls += 1;
        
        // Check if maiden is still possible
        if (runs > 0) {
            bowler.maidenInProgress = false;
        }
        
        // Update innings total
        inningsData.totalRuns += runs;
        inningsData.balls += 1;
        
        // Check if it's the end of the over
        if (inningsData.balls === 6) {
            endOver();
        } else {
            // Rotate strike for odd runs
            if (runs % 2 === 1) {
                rotateStrike();
            }
            
            // Save and update display
            saveMatchData();
            updateLiveDisplay();
            
            // Check if innings/match is over
            checkInningsCompletion();
        }
    }
    
    // Process a wicket
    function processWicket() {
        const inningsData = getCurrentInningsData();
        
        // Update batter's status
        const outBatter = inningsData.batters[inningsData.currentStriker];
        outBatter.isOut = true;
        outBatter.status = 'Out';
        outBatter.balls += 1;
        
        // Update bowler's stats
        const bowler = inningsData.bowlers[inningsData.currentBowler];
        bowler.wickets += 1;
        bowler.balls += 1;
        
        // Update innings stats
        inningsData.wickets += 1;
        inningsData.balls += 1;
        
        // Check if all wickets are down or innings is over
        if (inningsData.wickets >= 10 || (inningsData.overs >= matchData.maxOvers && inningsData.balls >= 6)) {
            endInnings();
            return;
        }
        
        // Get new batter
        const newBatterName = prompt(`Enter name for the new batter of ${inningsData.battingTeam}:`);
        if (!newBatterName) {
            alert('Batter name is required. Using "Batter " + number');
            const newBatterName = `Batter ${inningsData.batters.length + 1}`;
        }
        
        // Add new batter
        inningsData.batters.push({
            name: newBatterName,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            isOut: false,
            status: 'Not Out'
        });
        
        // Set new batter as striker
        inningsData.currentStriker = inningsData.batters.length - 1;
        
        // Check if it's the end of the over
        if (inningsData.balls === 6) {
            endOver();
        } else {
            saveMatchData();
            updateLiveDisplay();
            
            // Check if innings/match is over
            checkInningsCompletion();
        }
    }
    
    // Rotate the strike (switch striker and non-striker)
    function rotateStrike() {
        const inningsData = getCurrentInningsData();
        const temp = inningsData.currentStriker;
        inningsData.currentStriker = inningsData.currentNonStriker;
        inningsData.currentNonStriker = temp;
    }
    
    // End the current over
    function endOver() {
        const inningsData = getCurrentInningsData();
        
        // Update overs
        inningsData.overs += 1;
        inningsData.balls = 0;
        
        // Check for maiden over
        const bowler = inningsData.bowlers[inningsData.currentBowler];
        if (bowler.balls === 6 && bowler.maidenInProgress) {
            bowler.maidens += 1;
        }
        bowler.overs += 1;
        bowler.balls = 0;
        bowler.maidenInProgress = true;
        
        // Rotate strike
        rotateStrike();
        
        // Get new bowler
        const newBowlerName = prompt(`Enter name for the next bowler of ${inningsData.bowlingTeam}:`);
        if (!newBowlerName) {
            alert('Bowler name is required. Using previous bowler');
            updateLiveDisplay();
            return;
        }
        
        // Check if bowler already exists
        let bowlerIndex = inningsData.bowlers.findIndex(b => b.name === newBowlerName);
        
        // If new bowler, add to the list
        if (bowlerIndex === -1) {
            inningsData.bowlers.push({
                name: newBowlerName,
                overs: 0,
                balls: 0,
                maidenInProgress: true,
                maidens: 0,
                runs: 0,
                wickets: 0
            });
            bowlerIndex = inningsData.bowlers.length - 1;
        }
        
        // Set current bowler
        inningsData.currentBowler = bowlerIndex;
        
        // Save and update display
        saveMatchData();
        updateLiveDisplay();
        
        // Check if innings/match is over
        checkInningsCompletion();
    }
    
    // Check if the current innings is complete
    function checkInningsCompletion() {
        const inningsData = getCurrentInningsData();
        
        // Check if all overs are bowled or all wickets are down
        if (inningsData.overs >= matchData.maxOvers || inningsData.wickets >= 10) {
            endInnings();
            return;
        }
        
        // In second innings, check if target is achieved
        if (matchData.currentInnings === 2) {
            if (inningsData.totalRuns > matchData.innings1.totalRuns) {
                endInnings();
                return;
            }
        }
    }
    
    // End the current innings
    function endInnings() {
        const inningsData = getCurrentInningsData();
        inningsData.isCompleted = true;
        
        // If first innings is complete, start second innings
        if (matchData.currentInnings === 1) {
            matchData.currentInnings = 2;
            saveMatchData();
            alert(`${inningsData.battingTeam} innings complete. Score: ${inningsData.totalRuns}/${inningsData.wickets} (${inningsData.overs}.${inningsData.balls})\n\nStarting second innings...`);
            initializeInnings();
            updateLiveDisplay();
        } 
        // If second innings is complete, match is over
        else {
            matchData.isMatchCompleted = true;
            saveMatchData();
            alert('Match complete! View the summary.');
            window.location.href = 'summary.html';
        }
    }
}

// SCORECARD PAGE LOGIC
if (window.location.pathname.includes('scorecard.html')) {
    // Load match data
    loadMatchData();
    
    // Check if match data exists, otherwise redirect to setup
    if (!matchData.team1 || !matchData.team2) {
        window.location.href = 'setup.html';
    }
    
    window.onload = function() {
        displayScorecard();
    };
    
    // Handle back button
    document.getElementById('backToLiveBtn').addEventListener('click', function() {
        window.location.href = 'live.html';
    });
    
    // Display the complete scorecard
    function displayScorecard() {
        // Update match info
        const matchInfo = document.getElementById('matchInfo');
        let infoText = '';
        
        if (matchData.currentInnings === 1) {
            infoText = `${matchData.innings1.battingTeam} vs ${matchData.innings1.bowlingTeam} | 1st Innings in progress`;
        } else {
            infoText = `${matchData.innings1.battingTeam} ${matchData.innings1.totalRuns}/${matchData.innings1.wickets} (${matchData.innings1.overs}.${matchData.innings1.balls}) vs ${matchData.innings2.battingTeam} ${matchData.innings2.totalRuns}/${matchData.innings2.wickets} (${matchData.innings2.overs}.${matchData.innings2.balls})`;
        }
        
        matchInfo.textContent = infoText;
        
        // Display first innings scorecard
        displayInningsScorecard(1);
        
        // Display second innings scorecard if applicable
        if (matchData.currentInnings === 2) {
            document.getElementById('innings2Container').style.display = 'block';
            displayInningsScorecard(2);
        } else {
            document.getElementById('innings2Container').style.display = 'none';
        }
    }
    
    // Display scorecard for a specific innings
    function displayInningsScorecard(inningsNumber) {
        const inningsData = inningsNumber === 1 ? matchData.innings1 : matchData.innings2;
        const teamPrefix = inningsNumber === 1 ? 'team1' : 'team2';
        
        // Update team names
        document.getElementById(`${teamPrefix}Name`).textContent = `${inningsData.battingTeam} Innings`;
        
        // Display batting scorecard
        const battingBody = document.getElementById(`${teamPrefix}BattingBody`);
        const battingFooter = document.getElementById(`${teamPrefix}BattingFooter`);
        
        // Clear existing rows
        battingBody.innerHTML = '';
        battingFooter.innerHTML = '';
        
        // Add rows for each batter
        inningsData.batters.forEach(batter => {
            const row = document.createElement('tr');
            const status = batter.isOut ? 'out' : 'not-out';
            
            row.innerHTML = `
                <td>${batter.name}</td>
                <td class="${status}">${batter.status}</td>
                <td>${batter.runs}</td>
                <td>${batter.balls}</td>
                <td>${batter.fours}</td>
                <td>${batter.sixes}</td>
                <td>${batter.balls > 0 ? ((batter.runs / batter.balls) * 100).toFixed(2) : '0.00'}</td>
            `;
            
            battingBody.appendChild(row);
        });
        
        // Add footer row with total
        const footerRow = document.createElement('tr');
        footerRow.innerHTML = `
            <td colspan="2">Total</td>
            <td>${inningsData.totalRuns}/${inningsData.wickets}</td>
            <td colspan="2">(${inningsData.overs}.${inningsData.balls} Overs)</td>
            <td colspan="2">CRR: ${calculateRunRate(inningsData)}</td>
        `;
        battingFooter.appendChild(footerRow);
        
        // Display bowling scorecard
        const bowlingBody = document.getElementById(`${teamPrefix}BowlingBody`);
        
        // Clear existing rows
        bowlingBody.innerHTML = '';
        
        // Add rows for each bowler
        inningsData.bowlers.forEach(bowler => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${bowler.name}</td>
                <td>${bowler.overs}.${bowler.balls}</td>
                <td>${bowler.maidens}</td>
                <td>${bowler.runs}</td>
                <td>${bowler.wickets}</td>
                <td>${calculateEconomy(bowler)}</td>
            `;
            
            bowlingBody.appendChild(row);
        });
    }
    
    // Calculate run rate
    function calculateRunRate(inningsData) {
        const totalOvers = inningsData.overs + (inningsData.balls / 6);
        return totalOvers > 0 ? (inningsData.totalRuns / totalOvers).toFixed(2) : '0.00';
    }
}

// MATCH SUMMARY PAGE LOGIC
if (window.location.pathname.includes('summary.html')) {
    // Load match data
    loadMatchData();
    
    // Check if match data exists, otherwise redirect to setup
    if (!matchData.team1 || !matchData.team2) {
        window.location.href = 'setup.html';
    }
    
    // Check if match is completed, otherwise redirect to live
    if (!matchData.isMatchCompleted) {
        window.location.href = 'live.html';
    }
    
    window.onload = function() {
        displayMatchSummary();
    };
    
    // Handle new match button
    document.getElementById('newMatchBtn').addEventListener('click', function() {
        localStorage.removeItem('cricketMatchData');
        window.location.href = 'setup.html';
    });
    
    // Display match summary
    function displayMatchSummary() {
        // Display match details
        const matchDetails = document.getElementById('matchDetails');
        matchDetails.innerHTML = `
            <p>${matchData.team1} vs ${matchData.team2}</p>
            <p>${getTossInfo()}</p>
        `;
        
        // Determine match result
        const resultElement = document.getElementById('matchResult');
        
        // Team batting first won
        if (matchData.innings1.totalRuns > matchData.innings2.totalRuns) {
            const winningTeam = matchData.innings1.battingTeam;
            const margin = matchData.innings1.totalRuns - matchData.innings2.totalRuns;
            resultElement.textContent = `${winningTeam} wins by ${margin} runs!`;
        } 
        // Team batting second won
        else if (matchData.innings2.totalRuns > matchData.innings1.totalRuns) {
            const winningTeam = matchData.innings2.battingTeam;
            const wicketsLeft = 10 - matchData.innings2.wickets;
            const ballsLeft = ((matchData.maxOvers * 6) - ((matchData.innings2.overs * 6) + matchData.innings2.balls));
            resultElement.textContent = `${winningTeam} wins by ${wicketsLeft} wickets (${ballsLeft} balls left)!`;
        } 
        // Match tied
        else {
            resultElement.textContent = 'Match tied!';
        }
        
        // Display innings summary
        const inningsSummary = document.getElementById('inningsSummary');
        inningsSummary.innerHTML = `
            <div class="innings">
                <h4>${matchData.innings1.battingTeam} Innings</h4>
                <div class="innings-detail">
                    <span>Score:</span>
                    <span>${matchData.innings1.totalRuns}/${matchData.innings1.wickets}</span>
                </div>
                <div class="innings-detail">
                    <span>Overs:</span>
                    <span>${matchData.innings1.overs}.${matchData.innings1.balls}</span>
                </div>
                <div class="innings-detail">
                    <span>Run Rate:</span>
                    <span>${calculateRunRate(matchData.innings1)}</span>
                </div>
                <div class="innings-detail">
                    <span>Highest Scorer:</span>
                    <span>${getHighestScorer(matchData.innings1.batters)}</span>
                </div>
                <div class="innings-detail">
                    <span>Best Bowler:</span>
                    <span>${getBestBowler(matchData.innings2.bowlers)}</span>
                </div>
            </div>
            
            <div class="innings">
                <h4>${matchData.innings2.battingTeam} Innings</h4>
                <div class="innings-detail">
                    <span>Score:</span>
                    <span>${matchData.innings2.totalRuns}/${matchData.innings2.wickets}</span>
                </div>
                <div class="innings-detail">
                    <span>Overs:</span>
                    <span>${matchData.innings2.overs}.${matchData.innings2.balls}</span>
                </div>
                <div class="innings-detail">
                    <span>Run Rate:</span>
                    <span>${calculateRunRate(matchData.innings2)}</span>
                </div>
                <div class="innings-detail">
                    <span>Highest Scorer:</span>
                    <span>${getHighestScorer(matchData.innings2.batters)}</span>
                </div>
                <div class="innings-detail">
                    <span>Best Bowler:</span>
                    <span>${getBestBowler(matchData.innings1.bowlers)}</span>
                </div>
            </div>
        `;
    }
    
    // Get toss information text
    function getTossInfo() {
        const tossWinnerName = matchData.tossWinner === 'team1' ? matchData.team1 : matchData.team2;
        const tossDecision = matchData.tossDecision;
        return `${tossWinnerName} won the toss and elected to ${tossDecision} first`;
    }
    
    // Get highest scorer
    function getHighestScorer(batters) {
        if (!batters || batters.length === 0) return 'N/A';
        
        const highestScorer = batters.reduce((prev, current) => 
            (prev.runs > current.runs) ? prev : current
        );
        
        return `${highestScorer.name} (${highestScorer.runs} runs)`;
    }
    
    // Get best bowler
    function getBestBowler(bowlers) {
        if (!bowlers || bowlers.length === 0) return 'N/A';
        
        const bestBowler = bowlers.reduce((prev, current) => 
            (prev.wickets > current.wickets || (prev.wickets === current.wickets && prev.runs < current.runs)) ? prev : current
        );
        
        return `${bestBowler.name} (${bestBowler.wickets}/${bestBowler.runs})`;
    }
}

// Function to calculate economy rate (shared by multiple pages)
function calculateEconomy(bowler) {
    const totalOvers = bowler.overs + (bowler.balls / 6);
    return totalOvers > 0 ? (bowler.runs / totalOvers).toFixed(2) : '0.00';
}

// Function to calculate run rate (shared by multiple pages)
function calculateRunRate(inningsData) {
    const totalOvers = inningsData.overs + (inningsData.balls / 6);
    return totalOvers > 0 ? (inningsData.totalRuns / totalOvers).toFixed(2) : '0.00';
}
