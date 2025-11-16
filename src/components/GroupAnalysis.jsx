import { useState } from 'react';
import DigitalShadow from './DigitalShadow';

const GroupAnalysis = () => {
  const [file, setFile] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['text/plain', 'text/csv', 'application/vnd.ms-excel'];
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(txt|csv)$/)) {
        setError('Please upload a .txt or .csv file');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim());
          
          console.log('Raw lines:', lines);
          
          const employees = [];
          
          for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) continue;
            
            line = line.replace(/^\d+\.\s*/, '');
            
            if (i === 0 && (line.toLowerCase().includes('name') || line.toLowerCase().includes('email'))) {
              continue;
            }
            
            const parts = line.split(',').map(p => p.trim());
            
            if (parts.length >= 2) {
              employees.push({
                name: parts[0],
                email: parts[1],
                location: parts[2] || 'Unknown'
              });
            }
          }

          console.log('Parsed employees:', employees);

          if (employees.length === 0) {
            setError('No valid employee data found in file. Expected format: name,email,location');
            setLoading(false);
            return;
          }

          console.log('Sending to backend...');
          const response = await fetch('http://localhost:3001/api/digital-shadow/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employees })
          });

          console.log('Response status:', response.status);

          if (!response.ok) {
            throw new Error('Failed to process employee data');
          }

          const data = await response.json();
          console.log('Response data:', data);
          setUploadedData(data);
          setLoading(false);
        } catch (err) {
          console.error('Error in reader.onload:', err);
          setError(err.message || 'Error processing file');
          setLoading(false);
        }
      };

      reader.onerror = () => {
        console.error('FileReader error');
        setError('Error reading file');
        setLoading(false);
      };

      reader.readAsText(file);
    } catch (err) {
      console.error('Error in handleFileUpload:', err);
      setError(err.message || 'Error processing file');
      setLoading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadedData(null);
    setError('');
  };

  if (uploadedData) {
    return (
      <div className="w-full max-h-[85vh] overflow-y-auto">
        <button
          onClick={() => {
            resetUpload();
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
          }}
          className="flex items-center gap-2 mb-6 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl group sticky top-0 z-20"
          style={{ 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            color: 'white'
          }}
        >
          <svg 
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Upload New File</span>
        </button>
        <DigitalShadow employeeData={uploadedData} />
      </div>
    );
  }

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-xl p-6 sm:p-8 relative z-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 p-3 rounded-full">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Group Analysis</h2>
          <p className="text-sm text-gray-600">Upload employee data for Digital Shadow analysis</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">📄 File Format Instructions</h3>
        <p className="text-sm text-blue-800 mb-2">Upload a .txt or .csv file with employee data in the following format:</p>
        <div className="bg-white rounded p-3 font-mono text-sm text-gray-700 border border-blue-200">
          <div>name,email,location</div>
          <div>John Doe,john@company.com,New York</div>
          <div>Jane Smith,jane@company.com,London</div>
        </div>
        <p className="text-xs text-blue-700 mt-2">
          * First line can be a header (optional)<br/>
          * Location is optional (defaults to "Unknown")
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Employee Data File
          </label>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">TXT or CSV files only</p>
                {file && (
                  <p className="mt-2 text-sm text-purple-600 font-semibold">
                    Selected: {file.name}
                  </p>
                )}
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".txt,.csv"
                onChange={handleFileChange}
                disabled={loading}
              />
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">⚠️ {error}</p>
          </div>
        )}

        <button 
          onClick={handleFileUpload}
          disabled={!file || loading}
          className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${
            loading 
              ? 'bg-purple-600 cursor-wait shadow-[0_0_20px_rgba(139,92,246,0.5)] animate-pulse' 
              : !file 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] hover:scale-[1.02]'
          } text-white`}
        >
          {loading && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-shimmer"></div>
          )}
          <div className="relative z-10 flex items-center gap-2">
            {loading ? (
              <>
                <div className="relative w-5 h-5">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <div className="absolute inset-0 rounded-full border-2 border-purple-300 animate-ping"></div>
                </div>
                <span className="animate-pulse">Analyzing Data...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Upload & Analyze
              </>
            )}
          </div>
        </button>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-xs text-yellow-800">
            <strong>Privacy Notice:</strong> Your data is processed locally and will be analyzed for security exposure. 
            No data is permanently stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupAnalysis;
