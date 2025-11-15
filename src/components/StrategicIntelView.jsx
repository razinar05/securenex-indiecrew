import { useState } from 'react';
import axios from 'axios';

const StrategicIntelView = () => {
  const [analysisMode, setAnalysisMode] = useState('public_reaction');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const charLimit = 50000;
  const charCount = rawText.length;

  const handleModeChange = (mode) => {
    setAnalysisMode(mode);
    setRawText('');
    setReport(null);
    setError('');
  };

  // Donut chart component
  const DonutChart = ({ high, medium, low, score }) => {
    const total = high + medium + low;
    const highPercent = total > 0 ? (high / total) * 100 : 0;
    const mediumPercent = total > 0 ? (medium / total) * 100 : 0;
    const lowPercent = total > 0 ? (low / total) * 100 : 0;
    
    // Calculate stroke dash array for donut segments
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const highDash = (highPercent / 100) * circumference;
    const mediumDash = (mediumPercent / 100) * circumference;
    const lowDash = (lowPercent / 100) * circumference;
    
    return (
      <div className="flex items-center justify-center gap-8">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            {/* Low Risk (Green) */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#10b981"
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${lowDash} ${circumference}`}
              strokeDashoffset="0"
            />
            {/* Medium Risk (Yellow) */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#f59e0b"
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${mediumDash} ${circumference}`}
              strokeDashoffset={-lowDash}
            />
            {/* High Risk (Red) */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#ef4444"
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${highDash} ${circumference}`}
              strokeDashoffset={-(lowDash + mediumDash)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{score}</div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm font-semibold">High: {highPercent.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm font-semibold">Medium: {mediumPercent.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm font-semibold">Low: {lowPercent.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    );
  };

  // Score meter component
  const ScoreMeter = ({ score, label }) => {
    const getColor = () => {
      if (score >= 70) return 'bg-green-500';
      if (score >= 40) return 'bg-yellow-500';
      return 'bg-red-500';
    };

    const getTextColor = () => {
      if (score >= 70) return 'text-green-600';
      if (score >= 40) return 'text-yellow-600';
      return 'text-red-600';
    };

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          <span className={`text-2xl font-bold ${getTextColor()}`}>{score}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className={`h-4 ${getColor()} transition-all duration-1000 ease-out rounded-full`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const parseAndDisplayReport = (aiText) => {
    const getSection = (text, startHeadings) => {
      try {
        let startIndex = -1;
        for (const heading of startHeadings) {
          const regex = new RegExp(`## ${heading}[:\\s]*([\\s\\S]*?)(?=##|$)`, 'i');
          const match = text.match(regex);
          if (match) return match[1].trim();
        }
        return null;
      } catch (e) {
        return null;
      }
    };

    // Extract score and distribution
    const extractScore = (text, label) => {
      const match = text.match(new RegExp(`${label}[:\\s]*(\\d+)`, 'i'));
      return match ? parseInt(match[1]) : 50;
    };

    const extractDistribution = (text) => {
      const highMatch = text.match(/High[:\s]*(\d+)%/i);
      const mediumMatch = text.match(/Medium[:\s]*(\d+)%/i);
      const lowMatch = text.match(/Low[:\s]*(\d+)%/i);
      
      return {
        high: highMatch ? parseInt(highMatch[1]) : 33,
        medium: mediumMatch ? parseInt(mediumMatch[1]) : 33,
        low: lowMatch ? parseInt(lowMatch[1]) : 34
      };
    };

    const formatList = (text) => {
      if (!text) return [];
      return text.split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-') || line.match(/^\d+\./))
        .map(line => {
          line = line.replace(/^[-\d.]\s*/, '');
          const severity = line.match(/(High|Medium|Low)/i);
          const severityLevel = severity ? severity[1] : null;
          const cleanLine = line.replace(/:\s*(High|Medium|Low)/i, '').trim();
          return { text: cleanLine, severity: severityLevel };
        });
    };

    const summary = getSection(aiText, ['Executive Summary']);
    const themes = formatList(getSection(aiText, ['Key Themes', 'Top Risks']));
    const threats = formatList(getSection(aiText, ['Threat Level', 'Critical Areas']));
    const actions = formatList(getSection(aiText, ['Actions', 'Mitigation']));
    const score = extractScore(aiText, analysisMode === 'public_reaction' ? 'Sentiment Score' : 'Risk Score');
    const distribution = extractDistribution(aiText);

    return {
      summary,
      themes,
      threats,
      actions,
      score,
      distribution,
      isNegative: score < 50
    };
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    if (!rawText.trim()) {
      setError('Please paste some text to analyze');
      return;
    }

    if (rawText.length > charLimit) {
      setError(`Text exceeds character limit of ${charLimit}`);
      return;
    }

    setLoading(true);
    setError('');
    setReport(null);

    try {
      console.log(`🤖 Starting ${analysisMode} analysis...`);

      const response = await axios.post(
        'http://localhost:3001/api/strategic-intel/analyze',
        {
          rawText: rawText,
          analysisMode: analysisMode
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      console.log('✅ Analysis complete:', response.data);
      
      const parsedReport = parseAndDisplayReport(response.data.ai_summary);
      setReport(parsedReport);
    } catch (err) {
      console.error('❌ Analysis error:', err);
      setError(err.response?.data?.message || 'Analysis failed. Please check if the backend is running and the API key is configured.');
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setRawText('');
    setReport(null);
    setError('');
  };

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-xl p-6 sm:p-8">
      {report && (
        <button
          onClick={resetAnalysis}
          className="flex items-center gap-2 mb-6 transition-colors group"
          style={{ color: '#94a3b8' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#8b5cf6'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">New Analysis</span>
        </button>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 p-3 rounded-full">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Risk Assessment: AI Analysis</h2>
      </div>

      {!report && (
        <div className="space-y-6">
          <div className="border-l-4 p-4 rounded" style={{ background: 'rgba(30, 27, 75, 0.4)', borderColor: '#8b5cf6' }}>
            <p className="text-sm" style={{ color: '#cbd5e1' }}>
              {analysisMode === 'public_reaction' 
                ? '🌐 Analyze public reactions to past company announcements using OSINT (Open Source Intelligence)'
                : '🔮 Forecast potential risks for future plans using AI-powered risk analysis'
              }
            </p>
          </div>

          {/* Analysis Mode Toggle */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Select Analysis Mode</label>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleModeChange('public_reaction')}
                className={`flex-1 min-w-[200px] px-6 py-3 rounded-lg font-semibold transition duration-200 ${
                  analysisMode === 'public_reaction'
                    ? 'text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
                style={analysisMode === 'public_reaction' ? { background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' } : { background: 'rgba(30, 27, 75, 0.4)' }}
              >
                🌐 Public Reaction (OSINT)
              </button>
              <button
                onClick={() => handleModeChange('future_risk')}
                className={`flex-1 min-w-[200px] px-6 py-3 rounded-lg font-semibold transition duration-200 ${
                  analysisMode === 'future_risk'
                    ? 'text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
                style={analysisMode === 'future_risk' ? { background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' } : { background: 'rgba(30, 27, 75, 0.4)' }}
              >
                🔮 Future Risk (Forecasting)
              </button>
            </div>
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="raw-text-input" className="block text-sm font-semibold text-gray-700">
                {analysisMode === 'public_reaction' 
                  ? 'Paste Company Announcement or Press Release'
                  : 'Paste Future Plan or Strategy Document'
                }
              </label>
              <span className={`text-sm ${charCount > charLimit ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                {charCount.toLocaleString()} / {charLimit.toLocaleString()}
              </span>
            </div>
            <textarea
              id="raw-text-input"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-mono text-sm"
              placeholder={analysisMode === 'public_reaction'
                ? "Paste the official press release or company announcement here..."
                : "Paste the hypothetical future plan or strategy document here..."
              }
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">⚠️ {error}</p>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !rawText.trim()}
            className={`w-full px-6 py-4 rounded-lg font-bold text-white transition duration-200 transform hover:scale-105 ${
              loading || !rawText.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {analysisMode === 'public_reaction' ? 'Analyzing Public Reaction...' : 'Forecasting Risks...'}
              </span>
            ) : (
              '🤖 Analyze with AI'
            )}
          </button>
        </div>
      )}

      {/* Results Display */}
      {report && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header with Score */}
          <div className="border-l-4 p-6 rounded-lg" style={{ 
            background: report.isNegative ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            borderColor: report.isNegative ? '#f59e0b' : '#10b981'
          }}>
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'white' }}>
                  {analysisMode === 'public_reaction' ? '🌐 Public Reaction' : '🔮 Risk Forecast'}
                </h3>
                <p className="text-sm" style={{ color: '#cbd5e1' }}>{report.summary}</p>
              </div>
              <div className="text-right">
                <ScoreMeter 
                  score={report.score} 
                  label={analysisMode === 'public_reaction' ? 'Sentiment' : 'Risk Level'} 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution Chart */}
            <div className="p-6 rounded-lg border-2 shadow-lg" style={{ background: 'rgba(30, 27, 75, 0.4)', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: 'white' }}>
                <span>📊</span> Risk Distribution
              </h3>
              <DonutChart 
                high={report.distribution.high}
                medium={report.distribution.medium}
                low={report.distribution.low}
                score={report.score}
              />
            </div>

            {/* Key Findings */}
            <div className="p-6 rounded-lg border-2" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'white' }}>
                <span>🔑</span> {analysisMode === 'public_reaction' ? 'Key Themes' : 'Top Risks'}
              </h4>
              <div className="space-y-2">
                {report.themes.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded shadow-sm" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                    <span className="font-bold" style={{ color: '#f59e0b' }}>•</span>
                    <span className="text-sm font-medium flex-1" style={{ color: '#cbd5e1' }}>{item.text}</span>
                    {item.severity && (
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${
                        item.severity === 'High' ? 'bg-red-100 text-red-700' :
                        item.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.severity}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Threats/Critical Areas */}
            <div className="p-6 rounded-lg border-2" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'white' }}>
                <span>⚠️</span> {analysisMode === 'public_reaction' ? 'Threats' : 'Critical Areas'}
              </h4>
              <div className="space-y-2">
                {report.threats.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded shadow-sm" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                    <span className="font-bold" style={{ color: '#f59e0b' }}>⚠</span>
                    <span className="text-sm font-medium flex-1" style={{ color: '#cbd5e1' }}>{item.text}</span>
                    {item.severity && (
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${
                        item.severity === 'High' ? 'bg-red-100 text-red-700' :
                        item.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.severity}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 rounded-lg border-2" style={{ background: 'rgba(139, 92, 246, 0.15)', borderColor: 'rgba(139, 92, 246, 0.4)' }}>
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'white' }}>
                <span>✅</span> {analysisMode === 'public_reaction' ? 'Actions' : 'Mitigation'}
              </h4>
              <div className="space-y-2">
                {report.actions.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded shadow-sm" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                    <span className="font-bold" style={{ color: '#10b981' }}>→</span>
                    <span className="text-sm font-medium flex-1" style={{ color: '#cbd5e1' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategicIntelView;
