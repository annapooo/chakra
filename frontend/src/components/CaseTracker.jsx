import React, { useState, useEffect } from 'react';

const CaseTracker = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      // Demo user id per spec
      const response = await fetch(`${API_URL}/cases/demo-user-001`);
      if (response.ok) {
        const data = await response.json();
        setCases(data);
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Your Disputes</h3>
        <button 
          onClick={fetchCases}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Refresh List"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {loading && cases.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Loading cases...</div>
        ) : cases.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            No active disputes found.
          </div>
        ) : (
          cases.map((caseItem) => (
            <div key={caseItem._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition hover:shadow-md">
              <div>
                <span className="text-xs text-gray-400 font-mono block mb-1">ID: {caseItem.reference_id}</span>
                <span className="font-semibold text-gray-800">Parivahan Dispute</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${caseItem.status === 'submitted' ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></span>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {caseItem.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CaseTracker;
