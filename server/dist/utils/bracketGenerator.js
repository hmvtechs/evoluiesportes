"use strict";
/**
 * Bracket Generator Utility
 * Generates tournament brackets based on competition type
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoundRobin = generateRoundRobin;
exports.generateSingleElimination = generateSingleElimination;
exports.generateGroupsKnockout = generateGroupsKnockout;
exports.generateBracket = generateBracket;
/**
 * Generate Round Robin bracket (all vs all)
 */
function generateRoundRobin(teams) {
    const matches = [];
    let matchNumber = 1;
    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            matches.push({
                round: 1, // All matches in same round for round robin
                match_number: matchNumber++,
                team_a_id: teams[i].id,
                team_b_id: teams[j].id
            });
        }
    }
    return matches;
}
/**
 * Generate Single Elimination bracket
 */
function generateSingleElimination(teams) {
    const matches = [];
    const teamsCopy = [...teams];
    // Fill up to next power of 2 with nulls (byes)
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(teams.length)));
    while (teamsCopy.length < nextPowerOf2) {
        teamsCopy.push({ id: null, name: 'BYE' });
    }
    let round = 1;
    let currentRoundTeams = teamsCopy;
    while (currentRoundTeams.length > 1) {
        const roundMatches = [];
        for (let i = 0; i < currentRoundTeams.length; i += 2) {
            roundMatches.push({
                round,
                match_number: i / 2 + 1,
                team_a_id: currentRoundTeams[i]?.id || null,
                team_b_id: currentRoundTeams[i + 1]?.id || null
            });
        }
        matches.push(...roundMatches);
        // Setup next round (winners TBD)
        currentRoundTeams = roundMatches.map(() => ({ id: null, name: 'TBD' }));
        round++;
    }
    return matches;
}
/**
 * Generate Groups + Knockout bracket
 */
function generateGroupsKnockout(teams, numberOfGroups) {
    // Distribute teams into groups
    const groups = new Map();
    for (let i = 0; i < numberOfGroups; i++) {
        groups.set(i + 1, []);
    }
    teams.forEach((team, index) => {
        const groupId = (index % numberOfGroups) + 1;
        groups.get(groupId).push(team);
    });
    // Generate round robin for each group
    const groupMatches = new Map();
    groups.forEach((groupTeams, groupId) => {
        groupMatches.set(groupId, generateRoundRobin(groupTeams));
    });
    // Generate knockout phase (TBD teams - will be filled after group stage)
    const qualifiedTeamsPerGroup = 2; // Top 2 from each group
    const totalQualified = numberOfGroups * qualifiedTeamsPerGroup;
    const knockoutTeams = Array(totalQualified).fill(null).map((_, i) => ({
        id: null,
        name: `To be determined`
    }));
    const knockoutMatches = generateSingleElimination(knockoutTeams);
    return { groupMatches, knockoutMatches };
}
/**
 * Main bracket generator function
 */
function generateBracket(type, teams, options) {
    console.log(`\n=== GENERATING BRACKET ===`);
    console.log(`Type: ${type}`);
    console.log(`Teams: ${teams.length}`);
    switch (type) {
        case 'ROUND_ROBIN':
            return { matches: generateRoundRobin(teams) };
        case 'SINGLE_ELIMINATION':
            return { matches: generateSingleElimination(teams) };
        case 'GROUPS_KNOCKOUT':
            return generateGroupsKnockout(teams, options?.numberOfGroups || 2);
        default:
            throw new Error(`Unsupported bracket type: ${type}`);
    }
}
