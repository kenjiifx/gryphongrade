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
    if (saved) {
      try {
        const savedGrades = JSON.parse(saved);
        // Filter out grades for components that no longer exist
        const validGrades: Record<string, GradeEntry> = {};
        weightings.forEach(weighting => {
          if (savedGrades[weighting.name]) {
            validGrades[weighting.name] = savedGrades[weighting.name];
          }
        });
        setGrades(validGrades);
        if (Object.keys(validGrades).length !== Object.keys(savedGrades).length) {
          // Some components were removed, update localStorage
          localStorage.setItem(`grades_${courseCode}`, JSON.stringify(validGrades));
        }
      } catch (e) {
        console.error('Error loading saved grades:', e);
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
      <Card className="dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Enter Your Grades</CardTitle>
          <CardDescription>Input your scores for each assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {weightings.map((weighting) => {
            const grade = grades[weighting.name] || {
              componentName: weighting.name,
              earnedScore: 0,
              maxScore: 0,
              weight: weighting.weight,
            };
            const percent = grade.maxScore > 0 ? (grade.earnedScore / grade.maxScore) * 100 : 0;
            const contribution = (percent * weighting.weight) / 100;

            return (
              <div key={weighting.name} className="p-4 border rounded-lg dark:border-gray-700 dark:bg-gray-700/30 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">{weighting.name}</Label>
                  <span className="text-sm text-gray-500">{weighting.weight}%</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">Earned</Label>
                    <Input
                      type="number"
                      value={grade.earnedScore || ''}
                      onChange={(e) => updateGrade(weighting.name, 'earnedScore', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      step="0.01"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">Out of</Label>
                    <Input
                      type="number"
                      value={grade.maxScore || ''}
                      onChange={(e) => updateGrade(weighting.name, 'maxScore', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      step="0.01"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                {grade.maxScore > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span>Grade: {percent.toFixed(1)}%</span>
                      <span>Contribution: {contribution.toFixed(2)}%</span>
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
        <Card className="dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Current Grade</CardTitle>
            <CardDescription>Based on completed assessments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2 transition-all duration-300">
                {current.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {completed.toFixed(1)}% of course completed
              </div>
              {current >= 80 && (
                <div className="mt-2 text-xs text-green-600 font-semibold animate-in fade-in">
                  🎉 Great job!
                </div>
              )}
              {current >= 70 && current < 80 && (
                <div className="mt-2 text-xs text-blue-600 font-semibold animate-in fade-in">
                  👍 Keep it up!
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm dark:text-gray-300">
                <span>Completed</span>
                <span>{completed.toFixed(1)}%</span>
              </div>
              <Progress value={completed} className="h-2" />
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Remaining</span>
                <span>{remaining.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Final Exam Calculator</CardTitle>
            <CardDescription>What do you need on your final?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Target Grade (%)</Label>
              <Input
                type="number"
                value={targetGrade}
                onChange={(e) => setTargetGrade(parseFloat(e.target.value) || 80)}
                min="0"
                max="100"
                step="0.1"
                className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            {finalCalc ? (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">To achieve {targetGrade}% overall:</div>
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-1">
                  {finalCalc.required.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  on your final exam ({finalCalc.weight}% of grade)
                </div>
                {finalCalc.required > 100 && (
                  <div className="mt-2 text-sm text-red-600 dark:text-red-400 font-semibold">
                    ⚠️ This target may not be achievable
                  </div>
                )}
                {finalCalc.required < 0 && (
                  <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-semibold">
                    ✓ You&apos;ve already exceeded this target!
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-500 dark:text-gray-400 text-center">
                No final exam component found in weightings
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

