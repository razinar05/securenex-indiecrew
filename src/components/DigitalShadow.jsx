import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/effects.css';

const DigitalShadow = ({ employeeData }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    if (employeeData && employeeData.length > 0) {
      setEmployees(employeeData);
    } else {
      fetchEmployees();
    }
  }, [employeeData]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/digital-shadow/employees');
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employee data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    if (riskLevel === 'safe') return 'bg-green-500';
    if (riskLevel === 'medium') return 'bg-yellow-500';
    if (riskLevel === 'high') return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getRiskBorderColor = (riskLevel) => {
    if (riskLevel === 'safe') return 'border-green-300';
    if (riskLevel === 'medium') return 'border-yellow-300';
    if (riskLevel === 'high') return 'border-red-300';
    return 'border-gray-300';
  };

  const getRiskBgColor = (riskLevel) => {
    if (riskLevel === 'safe') return 'bg-green-50';
    if (riskLevel === 'medium') return 'bg-yellow-50';
    if (riskLevel === 'high') return 'bg-red-50';
    return 'bg-gray-50';
  };

  const getRiskTextColor = (riskLevel) => {
    if (riskLevel === 'safe') return 'text-green-800';
    if (riskLevel === 'medium') return 'text-yellow-800';
    if (riskLevel === 'high') return 'text-red-800';
    return 'text-gray-800';
  };

  const getRiskLabel = (riskLevel) => {
    if (riskLevel === 'safe') return '✓ Safe';
    if (riskLevel === 'medium') return '⚠ Medium Risk';
    if (riskLevel === 'high') return '⚠️ High Risk';
    return 'Unknown';
  };

  const stats = {
    safe: employees.filter(e => e.riskLevel === 'safe').length,
    medium: employees.filter(e => e.riskLevel === 'medium').length,
    high: employees.filter(e => e.riskLevel === 'high').length,
    total: employees.length
  };

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 p-3 rounded-full">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Digital Shadow Dashboard</h2>
          <p className="text-sm text-gray-600">Real-time employee exposure monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border rounded-lg p-4" style={{ background: 'rgba(30, 27, 75, 0.4)', borderColor: 'rgba(148, 163, 184, 0.3)' }}>
          <p className="text-sm mb-1" style={{ color: '#94a3b8' }}>Total Employees</p>
          <p className="text-3xl font-bold" style={{ color: 'white' }}>{stats.total}</p>
        </div>
        <div className="border rounded-lg p-4" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
          <p className="text-sm mb-1" style={{ color: '#10b981' }}>✓ Safe</p>
          <p className="text-3xl font-bold" style={{ color: '#10b981' }}>{stats.safe}</p>
        </div>
        <div className="border rounded-lg p-4" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
          <p className="text-sm mb-1" style={{ color: '#f59e0b' }}>⚠ Medium Risk</p>
          <p className="text-3xl font-bold" style={{ color: '#f59e0b' }}>{stats.medium}</p>
        </div>
        <div className="border rounded-lg p-4" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
          <p className="text-sm mb-1" style={{ color: '#ef4444' }}>⚠️ High Risk</p>
          <p className="text-3xl font-bold" style={{ color: '#ef4444' }}>{stats.high}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee) => (
            <div
              key={employee.id}
              onClick={() => setSelectedEmployee(employee)}
              className="border-2 rounded-lg p-5 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
              style={{
                background: employee.riskLevel === 'safe' ? 'rgba(16, 185, 129, 0.15)' : 
                           employee.riskLevel === 'medium' ? 'rgba(245, 158, 11, 0.15)' : 
                           'rgba(239, 68, 68, 0.15)',
                borderColor: employee.riskLevel === 'safe' ? 'rgba(16, 185, 129, 0.4)' : 
                            employee.riskLevel === 'medium' ? 'rgba(245, 158, 11, 0.4)' : 
                            'rgba(239, 68, 68, 0.4)'
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${getRiskColor(employee.riskLevel)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {employee.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: 'white' }}>{employee.name}</h3>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>{employee.department}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRiskTextColor(employee.riskLevel)} ${getRiskBgColor(employee.riskLevel)} border ${getRiskBorderColor(employee.riskLevel)}`}>
                  {getRiskLabel(employee.riskLevel)}
                </div>
                
                <div className="text-sm space-y-1" style={{ color: '#cbd5e1' }}>
                  <p>📧 Breaches: <strong>{employee.breachCount}</strong></p>
                  <p>🔒 Leaked Credentials: <strong>{employee.leakedCredentials}</strong></p>
                  <p>📱 Exposure Score: <strong>{employee.exposureScore}%</strong></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEmployee(null)}>
          <div className={`${getRiskBgColor(selectedEmployee.riskLevel)} border-2 ${getRiskBorderColor(selectedEmployee.riskLevel)} rounded-lg p-6 max-w-lg w-full shadow-2xl`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-16 h-16 ${getRiskColor(selectedEmployee.riskLevel)} rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{selectedEmployee.name}</h3>
                  <p className="text-sm text-gray-600">{selectedEmployee.department}</p>
                  <p className="text-xs text-gray-500">{selectedEmployee.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>

            <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getRiskTextColor(selectedEmployee.riskLevel)} ${getRiskBgColor(selectedEmployee.riskLevel)} border-2 ${getRiskBorderColor(selectedEmployee.riskLevel)} mb-4`}>
              {getRiskLabel(selectedEmployee.riskLevel)}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Exposure Details</h4>
                <div className="bg-white rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Data Breaches:</span>
                    <span className="font-bold text-gray-900">{selectedEmployee.breachCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Leaked Credentials:</span>
                    <span className="font-bold text-gray-900">{selectedEmployee.leakedCredentials}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Public Social Info:</span>
                    <span className="font-bold text-gray-900">{selectedEmployee.publicSocialInfo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Exposure Score:</span>
                    <span className="font-bold text-gray-900">{selectedEmployee.exposureScore}%</span>
                  </div>
                </div>
              </div>

              {selectedEmployee.risks && selectedEmployee.risks.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Security Risks</h4>
                  <div className="space-y-2">
                    {selectedEmployee.risks.map((risk, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 text-sm text-gray-700">
                        ⚠️ {risk}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedEmployee(null)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalShadow;
