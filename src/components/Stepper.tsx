import React from 'react';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { StepperStep } from '../types';

interface StepperProps {
  steps: StepperStep[];
  isLoading: boolean;
}

export function Stepper({ steps, isLoading }: StepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200">
                {step.status === 'complete' ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : step.status === 'current' ? (
                  isLoading ? (
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  ) : (
                    <Circle className="w-6 h-6 text-blue-500 fill-blue-500" />
                  )
                ) : (
                  <Circle className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${
                  step.status === 'complete' 
                    ? 'text-green-600 dark:text-green-400' 
                    : step.status === 'current'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 transition-colors duration-200 ${
                steps[index + 1].status !== 'pending' 
                  ? 'bg-green-500' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>
      {isLoading && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300 animate-pulse">
            Working...
          </p>
        </div>
      )}
    </div>
  );
}