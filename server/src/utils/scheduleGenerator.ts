/**
 * Enhanced Schedule Generator Utility
 * Supports Round-Robin, Elimination, Groups, and Venue Assignment
 */

export interface ScheduleConfig {
    startDate: Date;
    endDate: Date;
    matchesPerDay: number;
    matchDurationMinutes: number;
    restTimeMinutes: number;
    excludedDays?: number[]; // 0=Sunday, 6=Saturday
    venueAssignmentMode: 'RANDOM' | 'MANUAL';
    venues?: { id: number; priority: number }[];
}

export interface ScheduledMatch {
    round_number: number;
    match_number: number;
    team_a_id: number | null;
    team_b_id: number | null;
    scheduled_date?: Date;
    venue_id?: number | null;
    phase_id?: number;
    group_id?: number | null;
}

/**
 * Generate Round Robin Schedule (Berger Table)
 */
export function generateRoundRobin(teams: number[]): ScheduledMatch[] {
    const matches: ScheduledMatch[] = [];
    const n = teams.length;
    const isOdd = n % 2 !== 0;
    const dummyTeam = -1;

    const workingTeams = [...teams];
    if (isOdd) workingTeams.push(dummyTeam);

    const totalRounds = workingTeams.length - 1;
    const matchesPerRound = workingTeams.length / 2;

    for (let round = 0; round < totalRounds; round++) {
        for (let i = 0; i < matchesPerRound; i++) {
            const teamA = workingTeams[i];
            const teamB = workingTeams[workingTeams.length - 1 - i];

            if (teamA !== dummyTeam && teamB !== dummyTeam) {
                matches.push({
                    round_number: round + 1,
                    match_number: matches.length + 1,
                    team_a_id: teamA,
                    team_b_id: teamB
                });
            }
        }

        // Rotate teams (keep first fixed)
        const last = workingTeams.pop();
        if (last) workingTeams.splice(1, 0, last);
    }

    return matches;
}

/**
 * Generate Single Elimination Bracket
 */
export function generateElimination(teams: number[]): ScheduledMatch[] {
    const matches: ScheduledMatch[] = [];
    const n = teams.length;

    // Calculate power of 2 size
    let size = 1;
    while (size < n) size *= 2;

    // Fill with byes if needed
    const bracketTeams = [...teams];
    while (bracketTeams.length < size) bracketTeams.push(-1); // -1 = BYE

    // Round 1 pairings
    let matchCount = 1;
    for (let i = 0; i < size / 2; i++) {
        const teamA = bracketTeams[i];
        const teamB = bracketTeams[size - 1 - i];

        // Only create match if at least one real team
        if (teamA !== -1 || teamB !== -1) {
            matches.push({
                round_number: 1,
                match_number: matchCount++,
                team_a_id: teamA === -1 ? null : teamA,
                team_b_id: teamB === -1 ? null : teamB
            });
        }
    }

    // Generate subsequent rounds (placeholders)
    let remainingMatches = size / 4;
    let round = 2;
    while (remainingMatches >= 1) {
        for (let i = 0; i < remainingMatches; i++) {
            matches.push({
                round_number: round,
                match_number: matchCount++,
                team_a_id: null, // TBD from previous round
                team_b_id: null  // TBD from previous round
            });
        }
        remainingMatches /= 2;
        round++;
    }

    return matches;
}

/**
 * Assign Dates and Venues to Matches
 */
export function assignDatesAndVenues(
    matches: ScheduledMatch[],
    config: ScheduleConfig
): ScheduledMatch[] {
    const { startDate, endDate, matchesPerDay, matchDurationMinutes, restTimeMinutes, excludedDays = [], venueAssignmentMode, venues = [] } = config;

    let currentDate = new Date(startDate);
    let matchesScheduledToday = 0;
    let currentMatchIndex = 0;

    // Sort matches by round to schedule sequentially
    matches.sort((a, b) => a.round_number - b.round_number || a.match_number - b.match_number);

    while (currentMatchIndex < matches.length) {
        // Check if date is valid
        if (currentDate > endDate) {
            console.warn('⚠️ Schedule exceeds end date');
            break;
        }

        const dayOfWeek = currentDate.getDay();
        if (excludedDays.includes(dayOfWeek)) {
            currentDate.setDate(currentDate.getDate() + 1);
            matchesScheduledToday = 0;
            continue;
        }

        // Schedule matches for the day
        while (matchesScheduledToday < matchesPerDay && currentMatchIndex < matches.length) {
            const match = matches[currentMatchIndex];

            // Set Date/Time
            const matchTime = new Date(currentDate);
            matchTime.setHours(14, 0, 0, 0); // Start at 14:00 default
            matchTime.setMinutes(matchTime.getMinutes() + matchesScheduledToday * (matchDurationMinutes + restTimeMinutes));

            match.scheduled_date = matchTime;

            // Assign Venue
            if (venueAssignmentMode === 'RANDOM' && venues.length > 0) {
                // Weighted random based on priority? Or simple random for now.
                // Simple random:
                const randomVenue = venues[Math.floor(Math.random() * venues.length)];
                match.venue_id = randomVenue.id;
            } else {
                match.venue_id = null; // Manual assignment needed
            }

            matchesScheduledToday++;
            currentMatchIndex++;
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
        matchesScheduledToday = 0;
    }

    return matches;
}
