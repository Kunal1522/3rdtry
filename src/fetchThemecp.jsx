import { useState } from "react";

export default function CodeforcesProblemFetcher({ handle, onFormSubmit }) {
  const [level, setLevel] = useState("");
  const [solvedCount, setSolvedCount] = useState(1);
  const [problems, setProblems] = useState([]);
  const [formUpdated, setFormUpdated] = useState(false);

  const handleSubmit = () => {
    if (!level || problems.some(p => !p.contestId || !p.problemIndex)) return;
    
    setFormUpdated(true);

    // Pass the data to the parent component
    onFormSubmit({
      handle,
      level,
      solvedCount,
      problems
    });
  };

  const handleSolvedChange = (value) => {
    setSolvedCount(value);
    setProblems(Array(4 - value).fill({ contestId: "", problemIndex: "" }));
  };

  const handleProblemChange = (index, field, value) => {
    setProblems(prev => {
      const newProblems = [...prev];
      newProblems[index] = { ...newProblems[index], [field]: value };
      return newProblems;
    });
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-4 bg-gray-800 text-white rounded-lg shadow-lg max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">Did You Just Do Theme CP?</h1>
      <input
        type="text"
        placeholder="Which level? "
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="w-full p-2 border border-gray-600 rounded bg-gray-700">
        <p className="mb-2">How many problems solved?</p>
        <div className="flex space-x-4">
          {[1, 2, 3, 4].map((value) => (
            <label key={value} className="flex items-center space-x-2">
              <input
                type="radio"
                value={value}
                checked={solvedCount === value}
                onChange={() => handleSolvedChange(value)}
                className="form-radio text-blue-500"
              />
              <span>{value}</span>
            </label>
          ))}
        </div>
      </div>
      {problems.map((problem, index) => (
        <div key={index} className="w-full">
          <input
            type="text"
            placeholder="Contest ID"
            value={problem.contestId}
            onChange={(e) => handleProblemChange(index, "contestId", e.target.value)}
            className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />
          <input
            type="text"
            placeholder="Problem Index (e.g., A, B, C)"
            value={problem.problemIndex}
            onChange={(e) => handleProblemChange(index, "problemIndex", e.target.value)}
            className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
      <button 
        onClick={handleSubmit} 
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        OK
      </button>
      {formUpdated && <p className="text-green-400 font-bold">Form Updated</p>}
    </div>
  );
}
