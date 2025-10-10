import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SimpleOnboardingPage() {
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const navigate = useNavigate();

  const industries = [
    { id: 'technology', name: 'Technology' },
    { id: 'business', name: 'Business' },
    { id: 'healthcare', name: 'Healthcare' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">
          Choose Your Industry
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {industries.map((industry) => (
            <div
              key={industry.id}
              onClick={() => setSelectedIndustry(industry.id)}
              className={`
                cursor-pointer border-2 rounded-lg p-6 text-center transition-all duration-200
                hover:shadow-lg hover:scale-105
                ${selectedIndustry === industry.id 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <h3 className="text-lg font-semibold">{industry.name}</h3>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          disabled={!selectedIndustry}
          className={`
            w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200
            ${selectedIndustry
              ? 'bg-slate-600 hover:bg-slate-700 text-white cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
