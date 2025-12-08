'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AssessmentComponent, GradeEntry } from '@/lib/types';

interface GradeCalculatorProps {
  courseCode: string;
  weightings: AssessmentComponent[];
}

export function GradeCalculator({ courseCode, weightings }: GradeCalculatorProps) {
  const [grades, setGrades] = useState<Record<string, GradeEntry>>({});
  const [targetGrade, setTargetGrade] = useState<number>(80);

  useEffect(() => {
    // Initialize grades from localStorage (per course)
    const saved = localStorage.getItem(`grades_${courseCode}`);
    const validGrades: Record<string, GradeEntry> = {};
    
    // Always sync with current weightings
    weightings.forEach(weighting => {
      if (saved) {
        try {
          const savedGrades = JSON.parse(saved);
          if (savedGrades[weighting.name]) {
            validGrades[weighting.name] = {
              ...savedGrades[weighting.name],
              weight: weighting.weight, // Update weight from current weightings
            };
          } else {
            // New component - initialize empty
            validGrades[weighting.name] = {
              componentName: weighting.name,
              earnedScore: 0,
              maxScore: 0,
              weight: weighting.weight,
            };
          }
        } catch (e) {
          // If parsing fails, initialize empty
          validGrades[weighting.name] = {
            componentName: weighting.name,
            earnedScore: 0,
            maxScore: 0,
            weight: weighting.weight,
          };
        }
      } else {
        // No saved grades - initialize empty
        validGrades[weighting.name] = {
          componentName: weighting.name,
          earnedScore: 0,
          maxScore: 0,
          weight: weighting.weight,
        };
      }
    });
    
    setGrades(validGrades);
    
    // Update localStorage with cleaned grades
    if (saved) {
      try {
        const savedGrades = JSON.parse(saved);
        const cleanedGrades: Record<string, GradeEntry> = {};
        weightings.forEach(weighting => {
          if (savedGrades[weighting.name]) {
            cleanedGrades[weighting.name] = {
              ...savedGrades[weighting.name],
              weight: weighting.weight,
            };
          }
        });
        localStorage.setItem(`grades_${courseCode}`, JSON.stringify(cleanedGrades));
      } catch (e) {
        // Ignore errors
      }
    }
  }, [courseCode, weightings]);

  const updateGrade = (componentName: string, field: 'earnedScore' | 'maxScore', value: number) => {
    const updated = { ...grades };
    if (!updated[componentName]) {
      updated[componentName] = {
        componentName,
        earnedScore: 0,
        maxScore: 0,
        weight: weightings.find(w => w.name === componentName)?.weight || 0,
      };
    }
    updated[componentName][field] = value;
    setGrades(updated);
    localStorage.setItem(`grades_${courseCode}`, JSON.stringify(updated));
  };

  const getComponentWeight = (componentName: string) => {
    return weightings.find(w => w.name === componentName)?.weight || 0;
  };

  const calculateCurrentGrade = () => {
    let totalWeighted = 0;
    let completedWeight = 0;

    weightings.forEach(weighting => {
      const grade = grades[weighting.name];
      if (grade && grade.maxScore > 0) {
        const percent = (grade.earnedScore / grade.maxScore) * 100;
        const weighted = (percent * weighting.weight) / 100;
        totalWeighted += weighted;
        completedWeight += weighting.weight;
      }
    });

    if (completedWeight === 0) return { current: 0, completed: 0, remaining: 100 };

    const current = (totalWeighted / completedWeight) * 100;
    return {
      current: isNaN(current) ? 0 : current,
      completed: completedWeight,
      remaining: 100 - completedWeight,
    };
  };

  const calculateRequiredFinal = () => {
    const { current, completed, remaining } = calculateCurrentGrade();
    const finalComponent = weightings.find(w => 
      w.name.toLowerCase().includes('final') || 
      w.name.toLowerCase().includes('exam')
    );

    if (!finalComponent || remaining === 0) return null;

    const finalWeight = finalComponent.weight;
    // Calculate current weighted points out of 100 total
    let totalWeightedPoints = 0;
    weightings.forEach(weighting => {
      const grade = grades[weighting.name];
      if (grade && grade.maxScore > 0) {
        const percent = (grade.earnedScore / grade.maxScore) * 100;
        const weighted = (percent * weighting.weight) / 100;
        totalWeightedPoints += weighted;
      }
    });
    
    // Calculate needed points and required final exam percentage
    const neededPoints = targetGrade - totalWeightedPoints;
    const requiredFinal = (neededPoints / finalWeight) * 100;

    return {
      required: isNaN(requiredFinal) ? 0 : requiredFinal,
      weight: finalWeight,
    };
  };

  const { current, completed, remaining } = calculateCurrentGrade();
  const finalCalc = calculateRequiredFinal();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Grade Inputs */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Enter Your Grades</CardTitle>
          <CardDescription className="text-gray-600">Input your scores for each assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {weightings.map((weighting, index) => {
            const grade = grades[weighting.name] || {
              componentName: weighting.name,
              earnedScore: 0,
              maxScore: 0,
              weight: weighting.weight,
            };
            const percent = grade.maxScore > 0 ? (grade.earnedScore / grade.maxScore) * 100 : 0;
            const contribution = (percent * weighting.weight) / 100;

            return (
              <div 
                key={`${weighting.name}-${index}`} 
                className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-200 space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <Label className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{weighting.name}</Label>
                  <span className="text-sm text-gray-600 font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{weighting.weight}%</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600 font-medium">Earned</Label>
                    <Input
                      type="number"
                      value={grade.earnedScore || ''}
                      onChange={(e) => updateGrade(weighting.name, 'earnedScore', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      step="0.01"
                      className="bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 font-medium">Out of</Label>
                    <Input
                      type="number"
                      value={grade.maxScore || ''}
                      onChange={(e) => updateGrade(weighting.name, 'maxScore', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      step="0.01"
                      className="bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
                {grade.maxScore > 0 && (
                  <div className="text-sm text-gray-700 pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Grade: <span className="text-indigo-600 font-semibold">{percent.toFixed(1)}%</span></span>
                      <span className="font-medium">Contribution: <span className="text-purple-600 font-semibold">{contribution.toFixed(2)}%</span></span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Right Panel - Summary & Calculator */}
      <div className="space-y-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Current Grade</CardTitle>
            <CardDescription className="text-gray-600">Based on completed assessments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2 transition-all duration-300 transform hover:scale-105">
                {current.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {completed.toFixed(1)}% of course completed
              </div>
              {current >= 80 && (
                <div className="mt-2 text-sm text-green-600 font-semibold animate-in fade-in bg-green-50 px-4 py-2 rounded-lg inline-block">
                  🎉 Great job!
                </div>
              )}
              {current >= 70 && current < 80 && (
                <div className="mt-2 text-sm text-blue-600 font-semibold animate-in fade-in bg-blue-50 px-4 py-2 rounded-lg inline-block">
                  👍 Keep it up!
                </div>
              )}
              {current > 0 && current < 70 && (
                <div className="mt-2 text-sm text-orange-600 font-semibold animate-in fade-in bg-orange-50 px-4 py-2 rounded-lg inline-block">
                  💪 You've got this!
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-700">
                <span>Completed</span>
                <span>{completed.toFixed(1)}%</span>
              </div>
              <Progress value={completed} className="h-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Remaining</span>
                <span>{remaining.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Final Exam Calculator</CardTitle>
            <CardDescription className="text-gray-600">What do you need on your final?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-900">Target Grade (%)</Label>
              <Input
                type="number"
                value={targetGrade}
                onChange={(e) => setTargetGrade(parseFloat(e.target.value) || 80)}
                min="0"
                max="100"
                step="0.1"
                className="mt-2 bg-white border-gray-300"
              />
            </div>
            {finalCalc ? (
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="text-sm text-gray-700 mb-3 font-medium">To achieve {targetGrade}% overall:</div>
                <div className="text-4xl font-bold text-blue-700 mb-2 transform hover:scale-105 transition-transform">
                  {finalCalc.required.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  on your final exam ({finalCalc.weight}% of grade)
                </div>
                {finalCalc.required > 100 && (
                  <div className="mt-3 text-sm text-red-600 font-semibold bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                    ⚠️ This target may not be achievable
                  </div>
                )}
                {finalCalc.required < 0 && (
                  <div className="mt-3 text-sm text-green-600 font-semibold bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                    ✓ You&apos;ve already exceeded this target!
                  </div>
                )}
                {finalCalc.required >= 0 && finalCalc.required <= 100 && (
                  <div className="mt-3 text-sm text-indigo-600 font-semibold bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200">
                    ✨ This is achievable! Keep working hard!
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 text-center border border-gray-200">
                No final exam component found in weightings
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

