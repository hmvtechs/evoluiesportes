"use strict";
/**
 * Venue Assigner Utility
 * Assigns venues to matches randomly or with balanced distribution
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomAssignment = randomAssignment;
exports.balancedAssignment = balancedAssignment;
exports.checkVenueAvailability = checkVenueAvailability;
/**
 * Random venue assignment based on priority
 * Higher priority venues are selected more frequently
 */
function randomAssignment(matches, venues) {
    console.log(`\n=== RANDOM VENUE ASSIGNMENT ===`);
    console.log(`Matches: ${matches.length}`);
    console.log(`Venues: ${venues.length}`);
    if (venues.length === 0) {
        throw new Error('No venues available for assignment');
    }
    const assignments = [];
    // Create weighted array based on priority
    const weightedVenues = [];
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
 * Distributes matches evenly across venues
 */
function balancedAssignment(matches, venues) {
    console.log(`\n=== BALANCED VENUE ASSIGNMENT ===`);
    console.log(`Matches: ${matches.length}`);
    console.log(`Venues: ${venues.length}`);
    if (venues.length === 0) {
        throw new Error('No venues available for assignment');
    }
    const assignments = [];
    const venueUsageCount = new Map();
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
function checkVenueAvailability(venueId, date, existingAssignments) {
    // Check if venue has another match at the same time
    return !existingAssignments.some(assignment => {
        if (assignment.venue_id !== venueId)
            return false;
        const assignedDate = new Date(assignment.scheduled_date);
        const timeDiff = Math.abs(assignedDate.getTime() - date.getTime());
        // Consider conflict if within 2 hours
        return timeDiff < 2 * 60 * 60 * 1000;
    });
}
