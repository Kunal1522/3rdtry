import { useEffect, useState } from "react";
import axios from "axios";

const FetchLeetCode = ({ handle }) => {
  const [lastUnsolved, setLastUnsolved] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchLeetCodeData = async () => {
      try {
        // Step 1: Fetch user submissions
        const submissionsQuery = {
          query: `
            query recentSubmissions($username: String!) {
              recentSubmissionList(username: $username) {
                title
                titleSlug
                statusDisplay
              }
            }
          `,
          variables: { username: handle },
        }
        const submissionsRes = await axios.post(
          "https://leetcode.com/graphql",
          submissionsQuery
        );
        const submissions = submissionsRes.data.data.recentSubmissionList;  
        // Step 2: Find the first unsolved problem (status not "Accepted")
        const unsolvedProblem = submissions.find(
          (sub) => sub.statusDisplay !== "Accepted"
        );

        if (!unsolvedProblem) {
          console.log("No unsolved problems found.");
          setLoading(false);
          return;
        }

        setLastUnsolved(unsolvedProblem);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching LeetCode data:", error);
        setLoading(false);
      }
    };

    fetchLeetCodeData();
  }, [handle]);

  return (
    <div>
      <h2>Last Unsolved LeetCode Problem</h2>
      {loading ? (
        <p>Loading...</p>
      ) : lastUnsolved ? (
        <p>
          <a
            href={`https://leetcode.com/problems/${lastUnsolved.titleSlug}/`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {lastUnsolved.title} ❌ (Unsolved)
          </a>
        </p>
      ) : (
        <p>All recent problems are solved! 🎉</p>
      )}
    </div>
  );
};

export default FetchLeetCode;
