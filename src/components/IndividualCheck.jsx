import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/effects.css';

const IndividualCheck = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [showFlash, setShowFlash] = useState(false);
  const [flashType, setFlashType] = useState('');
  const [showAllBreaches, setShowAllBreaches] = useState(false);

  // Trigger flash effect when results change
  useEffect(() => {
    if (results !== null) {
      const type = results.length === 0 ? 'green' : 'red';
      setFlashType(type);
      setShowFlash(true);

      const timer = setTimeout(() => {
        setShowFlash(false);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [results]);

  const checkEmail = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    setShowAllBreaches(false);

    try {
      const response = await axios.get(
        `http://localhost:3001/api/breach/${encodeURIComponent(email)}`,
        { timeout: 15000 }
      );
      setResults(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setResults([]);
        setError('');
      } else if (err.response && err.response.status === 429) {
        setError('Rate limit reached. Please try again in a minute.');
      } else if (err.response && err.response.status === 403) {
        setError('API access forbidden. Please try again later.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else {
        setError(err.response?.data?.message || 'Error checking email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setEmail('');
    setResults(null);
    setError('');
    setShowFlash(false);
    setShowAllBreaches(false);
  };

  // Calculate total breach count by counting commas in the breach names
  const getTotalBreachCount = () => {
    if (!results || results.length === 0) return 0;
    
    let totalCount = 0;
    results.forEach(breach => {
      const breachName = breach.Name || '';
      const commaCount = (breachName.match(/,/g) || []).length;
      // If there's at least one comma, count is commas + 1, otherwise it's just 1 breach
      totalCount += commaCount > 0 ? commaCount + 1 : 1;
    });
    
    return totalCount;
  };

  // Split all breach names by comma and create individual breach items
  const getAllIndividualBreaches = () => {
    if (!results || results.length === 0) return [];
    
    const allBreaches = [];
    results.forEach(breach => {
      const breachName = breach.Name || '';
      // Split by comma and trim whitespace
      const individualNames = breachName.split(',').map(name => name.trim()).filter(name => name);
      individualNames.forEach(name => {
        allBreaches.push({
          ...breach,
          Name: name
        });
      });
    });
    
    return allBreaches;
  };

  const individualBreaches = getAllIndividualBreaches();
  const displayedBreaches = showAllBreaches ? individualBreaches : individualBreaches?.slice(0, 5);
  const hasMoreBreaches = individualBreaches && individualBreaches.length > 5;

  return (
    <>
      {/* Full-screen flash overlay */}
      {showFlash && (
        <div className={flashType === 'green' ? 'flash-overlay-green' : 'flash-overlay-red'} />
      )}

      <div className="w-full max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-xl p-6 sm:p-8 relative">
        {results !== null && (
          <button
            onClick={resetSearch}
            className="flex items-center gap-2 mb-6 transition-colors group"
            style={{ color: '#94a3b8' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#8b5cf6'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <svg 
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Search</span>
          </button>
        )}

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Individual Email Breach Check</h2>
        </div>
        
        <p className="text-gray-600 mb-8 text-sm sm:text-base">
          Check if a single email address has been compromised in known data breaches.
        </p>

        <div className="space-y-4">
          {results === null && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkEmail()}
                  placeholder="Enter email address to check"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={loading}
                />
              </div>

              <button 
                onClick={checkEmail}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </>
                ) : (
                  'Check for Breaches'
                )}
              </button>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">⚠️ {error}</p>
            </div>
          )}

          {/* GREEN - No Breaches Found */}
          {results !== null && results.length === 0 && !error && (
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 effect-positive">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-xl font-bold text-green-800">All Clear!</h3>
                </div>
                <p className="text-green-700 mb-2">
                  <strong>{email}</strong> has not been found in any known data breaches.
                </p>
                <p className="text-sm text-green-600 mt-2">
                  ✓ Your email appears to be secure
                </p>
              </div>

              <button 
                onClick={resetSearch}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
              >
                Check Another Email
              </button>
            </div>
          )}

          {/* RED - Breaches Found */}
          {results !== null && results.length > 0 && (
            <div className="space-y-4">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 effect-negative">
                <h3 className="text-lg font-bold text-red-800 mb-1">
                  ⚠️ {getTotalBreachCount()} Breach{getTotalBreachCount() !== 1 ? 'es' : ''} Found
                </h3>
                <p className="text-sm text-red-700 mb-2">
                  <strong>{email}</strong> was found in the following data breaches:
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h4 className="text-md font-bold mb-4" style={{ color: '#dc2626' }}>Affected Services:</h4>
                <div className="space-y-2">
                  {individualBreaches.map((breach, index) => (
                    <div key={index} className="flex items-start gap-3 bg-red-50 p-3 rounded-lg hover:bg-red-100 transition border border-red-100">
                      <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium break-words" style={{ color: '#1e293b' }}>{breach.Name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-md font-bold text-gray-800">Breach Details:</h4>
                {displayedBreaches.map((breach, index) => (
                  <div key={index} className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex-shrink-0 w-7 h-7 bg-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h4 className="text-lg font-bold text-gray-800 break-words">{breach.Name}</h4>
                      </div>
                      {breach.BreachDate && breach.BreachDate !== 'Date Unknown' && (
                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                          {breach.BreachDate}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      This email was found in the {breach.Name} data breach.
                    </p>
                    
                    <div className="border-t pt-3 mt-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Compromised Data:</p>
                      <div className="flex flex-wrap gap-2">
                        {breach.DataClasses.map((dataClass, idx) => (
                          <span key={idx} className="bg-red-50 text-red-800 text-xs px-2 py-1 rounded border border-red-200">
                            {dataClass}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {hasMoreBreaches && (
                  <button
                    onClick={() => setShowAllBreaches(!showAllBreaches)}
                    className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 text-center transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-semibold text-gray-700">
                      {showAllBreaches ? (
                        <>▲ Show Less</>
                      ) : (
                        <>+ {results.length - 5} more breach{results.length - 5 > 1 ? 'es' : ''} found — Click to expand</>
                      )}
                    </p>
                  </button>
                )}
              </div>

              <button 
                onClick={resetSearch}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
              >
                Check Another Email
              </button>
            </div>
          )}

          {results === null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>Powered by XposedOrNot API</strong> - Real-time data breach intelligence service.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default IndividualCheck;
