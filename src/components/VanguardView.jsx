import { useState } from 'react';
import axios from 'axios';

const VanguardView = () => {
  const [activeMode, setActiveMode] = useState('reverse-search'); // 'reverse-search' or 'candidate-vetting'
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Candidate vetting state
  const [candidateData, setCandidateData] = useState({
    name: '',
    country: '',
    icPassport: '',
    phoneNumber: ''
  });
  const [vettingResults, setVettingResults] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    } else {
      setError('Please upload a valid image file (JPG, PNG, etc.)');
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setResults(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadedImage) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);

      console.log('🔍 Starting reverse image search...');

      const response = await axios.post(
        'http://localhost:3001/api/vanguard/reverse-search',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 30000
        }
      );

      console.log('✅ Reverse search complete:', response.data);
      setResults(response.data);
    } catch (err) {
      console.error('❌ Reverse search error:', err);
      setError(err.response?.data?.message || 'Reverse image search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    clearImage();
    setResults(null);
  };

  // Candidate vetting handlers
  const handleCandidateInputChange = (e) => {
    const { name, value } = e.target;
    setCandidateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCandidateVetting = async (e) => {
    e.preventDefault();
    
    if (!candidateData.name || !candidateData.icPassport) {
      setError('Please provide at least Name and IC/Passport');
      return;
    }

    setLoading(true);
    setError('');
    setVettingResults(null);

    try {
      console.log('🔍 Starting candidate vetting...');

      const response = await axios.post(
        'http://localhost:3001/api/vanguard/candidate-vetting',
        candidateData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log('✅ Vetting complete:', response.data);
      setVettingResults(response.data);
    } catch (err) {
      console.error('❌ Vetting error:', err);
      setError(err.response?.data?.message || 'Candidate vetting failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetCandidateVetting = () => {
    setCandidateData({
      name: '',
      country: '',
      icPassport: '',
      phoneNumber: ''
    });
    setVettingResults(null);
    setError('');
  };

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    // Clear all states when switching modes
    clearImage();
    setResults(null);
    resetCandidateVetting();
    setError('');
  };

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-xl p-6 sm:p-8">
      {(results || vettingResults) && (
        <button
          onClick={activeMode === 'reverse-search' ? resetSearch : resetCandidateVetting}
          className="flex items-center gap-2 mb-6 transition-colors group"
          style={{ color: '#94a3b8' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#8b5cf6'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">New {activeMode === 'reverse-search' ? 'Search' : 'Vetting'}</span>
        </button>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 p-3 rounded-full">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            {activeMode === 'reverse-search' ? (
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            )}
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Vanguard: {activeMode === 'reverse-search' ? 'Reverse Image Search' : 'Candidate Vetting'}
        </h2>
      </div>

      {/* Mode Toggle */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => handleModeChange('reverse-search')}
          className={`px-6 py-3 rounded-lg font-semibold transition duration-200 ${
            activeMode === 'reverse-search'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🔍 Reverse Image Search
        </button>
        <button
          onClick={() => handleModeChange('candidate-vetting')}
          className={`px-6 py-3 rounded-lg font-semibold transition duration-200 ${
            activeMode === 'candidate-vetting'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          👤 Candidate Vetting
        </button>
      </div>

      {activeMode === 'reverse-search' ? (
        <>
          <p className="text-gray-600 mb-2 text-sm sm:text-base">
            Advanced reverse image search to verify identity and detect fraudulent photos.
          </p>
          <p className="text-xs text-gray-500 mb-8">
            ✓ Web-wide image matching • Stock photo detection • AI-powered analysis
          </p>

          {!results ? (
            <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 bg-purple-50">
            <h3 className="text-sm font-semibold text-purple-700 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              Upload Image
            </h3>

            {!imagePreview ? (
              <div>
                <label 
                  htmlFor="photoInput" 
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-purple-400 border-dashed rounded-lg cursor-pointer bg-white hover:bg-purple-50 transition"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-16 h-16 mb-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-base text-gray-700 font-semibold">
                      Click to upload image
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, JPEG, GIF or WebP (MAX. 10MB)
                    </p>
                  </div>
                  <input
                    id="photoInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-96 object-contain rounded-lg border-2 border-purple-300 bg-white"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="mt-3 bg-white rounded-lg p-3 border border-purple-200">
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Image ready for reverse search
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">⚠️ {error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !uploadedImage}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching the Web...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
                </svg>
                Start Reverse Image Search
              </>
            )}
          </button>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-xs sm:text-sm text-purple-800">
              <strong>How it works:</strong> Upload a photo and we'll search across billions of web pages, social media profiles, and stock photo databases to verify authenticity and detect potential fraud.
            </p>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Image Analysis Overview */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-xl font-bold text-purple-800">Search Complete</h3>
                <p className="text-sm text-purple-600">
                  Found <strong>{results.totalFound}</strong> matches • {results.processingTime}
                </p>
              </div>
            </div>

            {/* Search Engines Used */}
            <div className="flex gap-2 flex-wrap">
              {results.searchEngines.map((engine, idx) => (
                <span key={idx} className="text-xs bg-white bg-opacity-70 text-purple-700 px-3 py-1 rounded-full font-medium">
                  {engine}
                </span>
              ))}
            </div>
          </div>

          {/* AI Summary - PROMINENT */}
          {results.aiSummary && (
            <div className={`rounded-lg p-6 border-2 ${
              results.totalFound === 0 ? 'bg-green-50 border-green-300' :
              results.totalFound < 10 ? 'bg-yellow-50 border-yellow-300' :
              'bg-red-50 border-red-300'
            }`}>
              <h4 className={`font-bold mb-3 flex items-center gap-2 text-lg ${
                results.totalFound === 0 ? 'text-green-800' :
                results.totalFound < 10 ? 'text-yellow-800' :
                'text-red-800'
              }`}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"/>
                </svg>
                AI Analysis & Recommendation
              </h4>
              <p className={`text-sm leading-relaxed ${
                results.totalFound === 0 ? 'text-green-800' :
                results.totalFound < 10 ? 'text-yellow-800' :
                'text-red-800'
              }`}>
                {results.aiSummary}
              </p>
            </div>
          )}

          {/* Matches List - Show only image-containing pages */}
          {results.matches && results.matches.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                Pages With This Image ({results.matches.length})
              </h4>
              
              <div className="space-y-3">
                {results.matches.map((match, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 hover:shadow-md transition">
                    <div className="flex gap-4 items-center">
                      {/* Thumbnail */}
                      {match.thumbnail && (
                        <div className="flex-shrink-0">
                          <img 
                            src={match.thumbnail} 
                            alt="Similar" 
                            className="w-20 h-20 object-cover rounded border-2 border-purple-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Domain Link with External Icon */}
                        <a
                          href={match.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-2 mb-2 group"
                        >
                          <svg className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                          </svg>
                          <span className="font-semibold text-base">{match.domain}</span>
                        </a>

                        {/* Title */}
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">{match.title}</p>

                        {/* Context Tag */}
                        <div className="flex gap-2 flex-wrap">
                          {match.context && (
                            <span className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded italic">
                              {match.context}
                            </span>
                          )}
                          <span className="inline-block text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-medium">
                            ✓ Image Found
                          </span>
                        </div>
                      </div>

                      {/* Similarity Badge */}
                      {match.similarity && (
                        <div className="flex-shrink-0">
                          <span className="text-sm font-bold px-3 py-2 bg-purple-100 text-purple-700 rounded-lg whitespace-nowrap">
                            {match.similarity}% match
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={resetSearch}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Search Another Image
          </button>
        </div>
      )}
        </>
      ) : (
        /* Candidate Vetting Mode */
        <>
          <p className="text-gray-600 mb-2 text-sm sm:text-base">
            Cross-reference candidate information with government databases.
          </p>
          <p className="text-xs text-gray-500 mb-8">
            ✓ Identity verification • Criminal records check • Background validation
          </p>

          {!vettingResults ? (
            <form onSubmit={handleCandidateVetting} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={candidateData.name}
                    onChange={handleCandidateInputChange}
                    required
                    placeholder="e.g., Kai Cenat"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                    Country/Nationality
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={candidateData.country}
                    onChange={handleCandidateInputChange}
                    placeholder="e.g., USA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="icPassport" className="block text-sm font-semibold text-gray-700 mb-2">
                    IC / Passport Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="icPassport"
                    name="icPassport"
                    value={candidateData.icPassport}
                    onChange={handleCandidateInputChange}
                    required
                    placeholder="e.g., 900101-01-1234"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={candidateData.phoneNumber}
                    onChange={handleCandidateInputChange}
                    placeholder="e.g., +67 6767 6767"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="font-medium">⚠️ {error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-4 rounded-lg font-bold text-white transition duration-200 shadow-lg ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  '🔍 Verify Candidate'
                )}
              </button>
            </form>
          ) : (
            /* Vetting Results */
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-lg border-2" style={{
                background: vettingResults.status === 'cleared' ? 'rgba(5, 150, 105, 0.25)' : 'rgba(245, 158, 11, 0.15)',
                borderColor: vettingResults.status === 'cleared' ? 'rgba(5, 150, 105, 0.6)' : 'rgba(245, 158, 11, 0.4)'
              }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">
                    {vettingResults.status === 'cleared' ? '✅' : '⚠️'}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: vettingResults.status === 'cleared' ? '#059669' : '#f59e0b' }}>
                      {vettingResults.status === 'cleared' ? 'Candidate Cleared' : 'Review Required'}
                    </h3>
                    <p className="text-sm font-bold" style={{ color: 'white' }}>{vettingResults.name}</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="border-2 rounded-lg p-6" style={{ background: 'rgba(30, 27, 75, 0.3)', borderColor: 'rgba(139, 92, 246, 0.4)' }}>
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'white' }}>
                  <span>👤</span> Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                    <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>IC/Passport</p>
                    <p className="font-semibold" style={{ color: 'white' }}>{vettingResults.icPassport}</p>
                  </div>
                  {vettingResults.country && (
                    <div className="p-4 rounded" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                      <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>Country</p>
                      <p className="font-semibold" style={{ color: 'white' }}>{vettingResults.country}</p>
                    </div>
                  )}
                  {vettingResults.phoneNumber && (
                    <div className="p-4 rounded" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                      <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>Phone</p>
                      <p className="font-semibold" style={{ color: 'white' }}>{vettingResults.phoneNumber}</p>
                    </div>
                  )}
                  {vettingResults.dateOfBirth && (
                    <div className="p-4 rounded" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                      <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>Date of Birth</p>
                      <p className="font-semibold" style={{ color: 'white' }}>{vettingResults.dateOfBirth}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Government Records */}
              {vettingResults.records && vettingResults.records.length > 0 && (
                <div className="border-2 rounded-lg p-6" style={{ background: 'rgba(30, 27, 75, 0.3)', borderColor: 'rgba(139, 92, 246, 0.4)' }}>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'white' }}>
                    <span>📋</span> Government Records
                  </h4>
                  <div className="space-y-3">
                    {vettingResults.records.map((record, idx) => (
                      <div key={idx} className="p-4 rounded-lg shadow-sm" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-semibold" style={{ color: 'white' }}>{record.type}</p>
                            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>{record.details}</p>
                            {record.date && (
                              <p className="text-xs mt-2" style={{ color: '#64748b' }}>Date: {record.date}</p>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            record.severity === 'high' ? 'bg-red-100 text-red-700' :
                            record.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {record.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {vettingResults.recommendations && vettingResults.recommendations.length > 0 && (
                <div className="border-2 rounded-lg p-6" style={{ background: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.4)' }}>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'white' }}>
                    <span>💡</span> Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {vettingResults.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-3 rounded shadow-sm" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                        <span className="font-bold mt-1" style={{ color: '#8b5cf6' }}>→</span>
                        <span className="text-sm" style={{ color: '#cbd5e1' }}>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={resetCandidateVetting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Vet Another Candidate
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VanguardView;
