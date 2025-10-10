import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { updateUserIndustry } from '../utils/auth';
import { industryHierarchy } from '../utils/industryHierarchy';

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(1); // 1: Industry, 2: Branch, 3: Specialization
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    const navigate = useNavigate();

    const industries = Object.values(industryHierarchy);

    const handleIndustrySelect = (industryId) => {
        setSelectedIndustry(industryId);
        setSelectedBranch('');
        setSelectedSpecialization('');
    };

    const handleBranchSelect = (branchId) => {
        setSelectedBranch(branchId);
        setSelectedSpecialization('');
    };

    const handleSpecializationSelect = (specializationId) => {
        setSelectedSpecialization(specializationId);
    };

    const handleNext = () => {
        if (currentStep === 1 && selectedIndustry) {
            setCurrentStep(2);
        } else if (currentStep === 2 && selectedBranch) {
            setCurrentStep(3);
        }
    };

    const handleBack = () => {
        if (currentStep === 2) {
            setCurrentStep(1);
        } else if (currentStep === 3) {
            setCurrentStep(2);
        }
    };

    const handleFinish = () => {
        if (selectedIndustry && selectedBranch && selectedSpecialization) {
            // Store the complete path in user profile
            const userPath = {
                industry: selectedIndustry,
                branch: selectedBranch,
                specialization: selectedSpecialization
            };
            updateUserIndustry(userPath);
            navigate('/dashboard');
        }
    };

    const getCurrentStepData = () => {
        if (currentStep === 1) {
            return {
                title: "Choose Your Industry",
                subtitle: "Select the main industry you're interested in",
                items: industries,
                selectedItem: selectedIndustry,
                onSelect: handleIndustrySelect
            };
        } else if (currentStep === 2) {
            const industry = industryHierarchy[selectedIndustry];
            return {
                title: `${industry.name} Specialization`,
                subtitle: "Choose your area of focus",
                items: Object.values(industry.branches),
                selectedItem: selectedBranch,
                onSelect: handleBranchSelect
            };
        } else if (currentStep === 3) {
            const industry = industryHierarchy[selectedIndustry];
            const branch = industry.branches[selectedBranch];
            return {
                title: `${branch.name} Expertise`,
                subtitle: "Select your specific specialization",
                items: branch.specializations,
                selectedItem: selectedSpecialization,
                onSelect: handleSpecializationSelect
            };
        }
    };

    const stepData = getCurrentStepData();

    return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  ${currentStep >= step 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {step}
                </div>
                {step < 3 && (
                  <ChevronRight className={`w-5 h-5 mx-2 ${
                    currentStep > step ? 'text-slate-800' : 'text-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Breadcrumb */}
        {currentStep > 1 && (
          <div className="mb-6 text-sm text-gray-600 text-center">
            {selectedIndustry && (
              <span className="capitalize">
                {industryHierarchy[selectedIndustry]?.name}
                {selectedBranch && (
                  <>
                    {' > '}
                    {industryHierarchy[selectedIndustry]?.branches[selectedBranch]?.name}
                  </>
                )}
              </span>
            )}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white bg-slate-800 mb-4 py-4 px-6 rounded-lg">
            {stepData.title}
          </h1>
          <p className="text-xl font-bold text-white bg-slate-700 py-3 px-6 rounded-lg">
            {stepData.subtitle}
          </p>
        </div>
        
        {/* Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {stepData.items.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => stepData.onSelect(item.id)}
                className={`
                  cursor-pointer border-2 rounded-lg p-6 text-center transition-all duration-200
                  hover:shadow-lg hover:scale-105
                  ${stepData.selectedItem === item.id 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <div className={`${item.bgColor} text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent size={28} />
                </div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
              </div>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`
              flex items-center space-x-2 py-3 px-6 rounded-lg font-semibold transition-all duration-200
              ${currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-700 cursor-pointer'
              }
            `}
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !selectedIndustry) ||
                (currentStep === 2 && !selectedBranch)
              }
              className={`
                flex items-center space-x-2 py-3 px-6 rounded-lg font-semibold transition-all duration-200
                ${(currentStep === 1 && selectedIndustry) || (currentStep === 2 && selectedBranch)
                  ? 'bg-slate-600 hover:bg-slate-700 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <span>Next</span>
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!selectedSpecialization}
              className={`
                flex items-center space-x-2 py-3 px-6 rounded-lg font-semibold transition-all duration-200
                ${selectedSpecialization
                  ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <span>Complete Setup</span>
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
