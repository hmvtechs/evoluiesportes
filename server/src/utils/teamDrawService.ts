/**
 * Utility for drawing teams into groups randomly
 */

interface Group {
    id: number;
    name: string;
}

/**
 * Distributes teams evenly and randomly across groups
 */
export function drawTeamsIntoGroups(teamIds: number[], groups: Group[]): Map<number, number[]> {
    // Shuffle teams using Fisher-Yates algorithm
    const shuffled = [...teamIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Distribute evenly
    const distribution = new Map<number, number[]>();
    groups.forEach(g => distribution.set(g.id, []));

    shuffled.forEach((teamId, index) => {
        const groupIndex = index % groups.length;
        const groupId = groups[groupIndex].id;
        distribution.get(groupId)!.push(teamId);
    });

    return distribution;
}
