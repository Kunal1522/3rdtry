import axios from "axios";
import API_BASE_URL from "../src/config.js";

const xpMap = {
    "Div. 1D": 50,
    "Div. 2C": 20,
    "Div. 2D": 15,
    "Div. 3E": 12,
    "Div. 3F": 20,
    "Div. 4G": 25,
};

// Function to get the contest division using your API
export async function getContestDivision(contestId) {
    try {
        const response = await axios.get(`${API_BASE_URL}/proxy/codeforces/getStandings?contestId=${contestId}`);
        const contestName = response.data?.result?.contest?.name;

        if (!contestName) return null;

        // Extract division from contest name
        if (contestName.includes("Div. 1")) return "Div. 1";
        if (contestName.includes("Div. 2")) return "Div. 2";
        if (contestName.includes("Div. 3")) return "Div. 3";
        if (contestName.includes("Div. 4")) return "Div. 4";

        return null;
    } catch (error) {
        console.error("Error fetching contest division:", error);
        return null;
    }
}

// Main function to find experience points
export async function experienceFinder(problem) {
    if (!problem || !problem.contestId || !problem.index) return 0;

    const division = await getContestDivision(problem.contestId);
    if (!division) return 0;

    const problemKey = `${division}${problem.index}`;
    return xpMap[problemKey] || 0;
}
