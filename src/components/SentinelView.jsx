import { useState } from 'react';
import IndividualCheck from './IndividualCheck';
import GroupAnalysis from './GroupAnalysis';

const SentinelView = () => {
  const [activeMode, setActiveMode] = useState('individual'); // 'individual' or 'group'

  return (
    <div className="w-full">
      {/* Mode Toggle Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setActiveMode('individual')}
          className={`px-6 sm:px-8 py-3 rounded-lg font-semibold transition duration-200 flex items-center gap-2 ${
            activeMode === 'individual'
              ? 'text-white shadow-lg'
              : 'text-gray-300 hover:bg-gray-600 shadow'
          }`}
          style={activeMode === 'individual' ? { background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' } : { background: 'rgba(30, 27, 75, 0.4)' }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          Individual Check
        </button>
        <button
          onClick={() => setActiveMode('group')}
          className={`px-6 sm:px-8 py-3 rounded-lg font-semibold transition duration-200 flex items-center gap-2 ${
            activeMode === 'group'
              ? 'text-white shadow-lg'
              : 'text-gray-300 hover:bg-gray-600 shadow'
          }`}
          style={activeMode === 'group' ? { background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' } : { background: 'rgba(30, 27, 75, 0.4)' }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          Group Analysis
        </button>
      </div>

      {/* Render Active Component */}
      {activeMode === 'individual' ? <IndividualCheck /> : <GroupAnalysis />}
    </div>
  );
};

export default SentinelView;
