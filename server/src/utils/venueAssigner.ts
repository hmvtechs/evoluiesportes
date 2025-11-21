/**
 * Venue Assigner Utility
 * Assigns venues to matches randomly or with balanced distribution
 */

export interface VenueWithPriority {
    id: number;
    name: string;
    priority: number;
    capacity?: number;
}

export interface MatchToAssign {
    id: number;
    scheduled_date: Date | null;
}

export interface VenueAssignment {
    match_id: number;
    venue_id: number;
}

/**
 * Random venue assignment based on priority
 * Higher priority venues are selected more frequently
 */
export function randomAssignment(
    matches: MatchToAssign[],
    venues: VenueWithPriority[]
): VenueAssignment[] {

    console.log(`\n=== RANDOM VENUE ASSIGNMENT ===`);
    console.log(`Matches: ${matches.length}`);
    console.log(`Venues: ${venues.length}`);

    if (venues.length === 0) {
        throw new Error('No venues available for assignment');
    }

    const assignments: VenueAssignment[] = [];

    // Create weighted array based on priority
    const weightedVenues: number[] = [];
    venues.forEach(venue => {
        const weight = Math.max(1, venue.priority); // Minimum weight of 1
        for (let i = 0; i < weight; i++) {
            weightedVenues.push(venue.id);
        }
    });

    matches.forEach(match => {
        const randomIndex = Math.floor(Math.random() * weightedVenues.length);
        const selectedVenueId = weightedVenues[randomIndex];

        assignments.push({
            match_id: match.id,
            venue_id: selectedVenueId
        });
    });

    console.log(`✅ ${assignments.length} matches assigned to venues`);

    return assignments;
}

/**
 * Balanced venue assignment
 * Distributes matches evenly across venuesbalances the number of matches per venue
 */
export function balancedAssignment(
    matches: MatchToAssign[],
    venues: VenueWith

Priority[]
): VenueAssignment[] {

    console.log(`\n=== BALANCED VENUE ASSIGNMENT ===`);
    console.log(`Matches: ${matches.length}`);
    console.log(`Venues: ${venues.length}`);

    if (venues.length === 0) {
        throw new Error('No venues available for assignment');
    }

    const assignments: VenueAssignment[] = [];
    const venueUsageCount = new Map<number, number>();

    // Initialize counters
    venues.forEach(venue => venueUsageCount.set(venue.id, 0));

    matches.forEach(match => {
        // Find venue with least usage
        let selectedVenueId = venues[0].id;
        let minUsage = Infinity;

        venues.forEach(venue => {
            const usage = venueUsageCount.get(venue.id) || 0;
            if (usage < minUsage) {
                minUsage = usage;
                selectedVenueId = venue.id;
            }
        });

        assignments.push({
            match_id: match.id,
            venue_id: selectedVenueId
        });

        venueUsageCount.set(selectedVenueId, (venueUsageCount.get(selectedVenueId) || 0) + 1);
    });

    // Log distribution
    console.log('Distribution:');
    venueUsageCount.forEach((count, venueId) => {
        const venue = venues.find(v => v.id === venueId);
        console.log(`  ${venue?.name}: ${count} matches`);
    });

    return assignments;
}

/**
 * Check if venue is available at specific date/time
 */
export function checkVenueAvailability(
    venueId: number,
    date: Date,
    existingAssignments: Array<{ venue_id: number; scheduled_date: Date }>
): boolean {

    // Check if venue has another match at the same time
    return !existingAssignments.some(assignment => {
        if (assignment.venue_id !== venueId) return false;

        const assignedDate = new Date(assignment.scheduled_date);
        const timeDiff = Math.abs(assignedDate.getTime() - date.getTime());

        // Consider conflict if within 2 hours
        return timeDiff < 2 * 60 * 60 * 1000;
    });
}
