"use strict";
/**
 * Utility for drawing teams into groups randomly
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawTeamsIntoGroups = drawTeamsIntoGroups;
/**
 * Distributes teams evenly and randomly across groups
 */
function drawTeamsIntoGroups(teamIds, groups) {
    // Shuffle teams using Fisher-Yates algorithm
    const shuffled = [...teamIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Distribute evenly
    const distribution = new Map();
    groups.forEach(g => distribution.set(g.id, []));
    shuffled.forEach((teamId, index) => {
        const groupIndex = index % groups.length;
        const groupId = groups[groupIndex].id;
        distribution.get(groupId).push(teamId);
    });
    return distribution;
}
