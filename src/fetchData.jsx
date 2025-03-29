import { useState, useEffect } from "react";
import axios from "axios";
import CodeforcesProblemFetcher from "./fetchThemecp";
import { toast } from "react-hot-toast";
const FetchCodeforces = ({ handle }) => {
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [themeCpProblems, setThemeCpProblems] = useState([]);
  const [themeIndex, setThemeIndex] = useState(0);
  const [normalProblems, setNormalProblems] = useState([]);
  const [normalIndex, setNormalIndex] = useState(0);

  const divProblemMap = {
    2: ["C", "C1", "D"],
    3: ["D", "E"],
    4: ["E", "F"],
  };
  function divChecker(div, name) {
    return name.includes(`Div. ${div}`);
  }

  const fetchProblemsRecursive = async (contests, handle, index = 0) => {
    if (index >= contests.length) {
      console.log("✅ No more contests to check.");
      setLoading(false);
      return;
    }
  
    const contest = contests[index];
    const div = [2, 3, 4].find((d) => divChecker(d, contest.name));
  
    if (!div) {
      console.log(`⚠️ Skipping contest ${contest.id}, no valid division found.`);
      return fetchProblemsRecursive(contests, handle, index + 1);
    }
  
    console.log(`📌 Fetching contest ${contest.id} (Div ${div})`);
  
    try {
      const contestId = contest.id;
  
      // Fetch problems
      const problemsRes = await axios.get(
        `http://localhost:5000/proxy/codeforces/getStandings?contestId=${contestId}`
      );
  
      const allProblems = problemsRes.data.result.problems;
      const problemIndices = divProblemMap[div];
  
      const filteredProblems = allProblems.filter((p) =>
        problemIndices.includes(p.index)
      );
  
      console.log(`✅ Found ${filteredProblems.length} relevant problems in contest ${contestId}`);
  
      // Fetch user submissions
      const submissionsRes = await axios.get(
        `http://localhost:5000/proxy/codeforces/getSubmissions?handle=${handle}`
      );
  
      const submissions = submissionsRes.data.result;
      const solvedSet = new Set(
        submissions
          .filter((s) => s.verdict === "OK")
          .map((s) => `${s.contestId}-${s.problem.index}`)
      );
  
      console.log(`🔍 User has solved ${solvedSet.size} problems.`);
  
      // Find the first unsolved problem
      const firstUnsolved = filteredProblems.find(
        (p) => !solvedSet.has(`${p.contestId}-${p.index}`)
      );
  
      if (firstUnsolved) {
        console.log(`🎯 First unsolved problem found: ${firstUnsolved.name}`);
        setNormalProblems([firstUnsolved]);
        setProblem(firstUnsolved); // Set the first problem immediately
        setLoading(false);
        return; // Stop recursion since we found an unsolved problem
      }
  
      // No unsolved problems in this contest, continue checking next contests
      return fetchProblemsRecursive(contests, handle, index + 1);
    } catch (error) {
      console.error("❌ Error fetching Codeforces data:", error);
      setLoading(false);
    }
  };
  

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const contestRes = await axios.get("http://localhost:5000/proxy/codeforces/getcontests");
        const finishedContests = contestRes.data.result.filter((contest) => contest.phase === "FINISHED");
        await fetchProblemsRecursive(finishedContests, handle);
      } catch (error) {
        console.error("❌ Error fetching contests:", error);
        setLoading(false);
      }
    };
    fetchContests();
  }, [handle]);

  const handleFormSubmit = (data) => {
    console.log("📌 Received Theme CP Problems:", data);
    setThemeCpProblems(data.problems);
    setThemeIndex(0);
    setProblem(data.problems[0] || null);
  };

  const markProblemAsSolved = async () => {
    if (!problem) {
      toast.success("No problem to check.");
      return;
    }
  
    try {
      // Fetch latest submissions
      const submissionsRes = await axios.get(
        `http://localhost:5000/proxy/codeforces/getSubmissions?handle=${handle}`
      );
  
      const submissions = submissionsRes.data.result;
      const solvedSet = new Set(
        submissions
          .filter((s) => s.verdict === "OK")
          .map((s) => `${s.contestId}-${s.problem.index}`)
      );
  
      const problemKey = `${problem.contestId}-${problem.index}`;
  
      // Check if the problem is actually solved
      if (solvedSet.has(problemKey)) {
        toast.success("✅ Problem verified as solved! Moving to the next problem...");
      
        let nextProblem = null;
        let updatedThemeIndex = themeIndex;
        let updatedNormalIndex = normalIndex;
        // Move to the next Theme CP problem
        if (themeCpProblems.length > 0 && themeIndex < themeCpProblems.length - 1) {
          updatedThemeIndex += 1;
          nextProblem = themeCpProblems[updatedThemeIndex];
          setThemeIndex(updatedThemeIndex);
        } 
        // Theme CP problems are finished, switch to normal problems
        else if (themeCpProblems.length > 0) {
          setThemeCpProblems([]);
          setThemeIndex(0);
          updatedNormalIndex = 0;
          nextProblem = normalProblems.length > 0 ? normalProblems[0] : null;
          setNormalIndex(updatedNormalIndex);
        } 
        // Move to the next normal problem
        else if (normalIndex < normalProblems.length - 1) {
          updatedNormalIndex += 1;
          nextProblem = normalProblems[updatedNormalIndex];
          setNormalIndex(updatedNormalIndex);
        } 
        // No more problems left, fetch new ones
        else {
          nextProblem = null;
          toast.success("🎉 No more unsolved problems found! Fetching a new one...");
          // Fetch new problems from contests
          const contestRes = await axios.get("http://localhost:5000/proxy/codeforces/getcontests");
          const finishedContests = contestRes.data.result.filter((contest) => contest.phase === "FINISHED");
          await fetchProblemsRecursive(finishedContests, handle);
        }
        setProblem(nextProblem);
      } else {
        toast.error("❌ You haven't solved this problem yet. Go solve it!");
      }
    } catch (error) {
      console.error("❌ Error checking problem status:", error);
      toast.error("⚠️ Error fetching submissions. Please try again.");
    }
  };
  // ✅ Fix: Ensure React updates the problem correctly
  useEffect(() => {
    if (!problem && normalProblems.length > 0) {
      setProblem(normalProblems[0]);
      setNormalIndex(0);
    }
  }, [normalProblems]);
  return (
    <div className="flex flex-col items-center p-6 space-y-4">
     
        {console.log(loading,problem)}
      <h2>Next Problem to Solve</h2>
      {loading ? (
        <p>Loading...</p>
      ) : problem ? (
        <div className="flex flex-col items-center">
          <a
            href={`https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-500 text-lg font-semibold"
          >
            {problem.index}: {problem.name} (Contest {problem.contestId})
          </a>
          <button
            onClick={markProblemAsSolved}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Mark as Solved
          </button>
        </div>
      ) : (
        <p>No unsolved problems found.</p>
     
      )
      }
      <CodeforcesProblemFetcher handle={handle} onFormSubmit={handleFormSubmit} />
    </div>
  );
};

export default FetchCodeforces;