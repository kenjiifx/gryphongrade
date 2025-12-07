'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, RotateCcw, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AssessmentComponent } from '@/lib/types';

interface WeightEditorProps {
  courseCode: string;
  defaultWeightings: AssessmentComponent[];
  onWeightingsChange: (weightings: AssessmentComponent[]) => void;
}

export function WeightEditor({ courseCode, defaultWeightings, onWeightingsChange }: WeightEditorProps) {
  const [weightings, setWeightings] = useState<AssessmentComponent[]>(defaultWeightings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem(`weights_${courseCode}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWeightings(parsed);
        onWeightingsChange(parsed);
      } catch (e) {
        console.error('Error loading saved weightings:', e);
      }
    } else {
      setWeightings(defaultWeightings);
      onWeightingsChange(defaultWeightings);
    }
  }, [courseCode, defaultWeightings, onWeightingsChange]);

  const updateWeighting = (index: number, field: 'name' | 'weight', value: string | number) => {
    const updated = [...weightings];
    if (field === 'name') {
      updated[index].name = value as string;
    } else {
      updated[index].weight = Math.max(0, Math.min(100, value as number));
    }
    setWeightings(updated);
    setHasChanges(true);
    onWeightingsChange(updated);
  };

  const addComponent = () => {
    const newComponent: AssessmentComponent = { name: 'New Component', weight: 0 };
    const updated = [...weightings, newComponent];
    setWeightings(updated);
    setHasChanges(true);
    onWeightingsChange(updated);
  };

  const removeComponent = (index: number) => {
    const updated = weightings.filter((_, i) => i !== index);
    setWeightings(updated);
    setHasChanges(true);
    onWeightingsChange(updated);
  };

  const resetToDefault = () => {
    setWeightings(defaultWeightings);
    setHasChanges(false);
    onWeightingsChange(defaultWeightings);
    localStorage.removeItem(`weights_${courseCode}`);
  };

  const saveToLocal = () => {
    localStorage.setItem(`weights_${courseCode}`, JSON.stringify(weightings));
    setHasChanges(false);
  };

  const totalWeight = weightings.reduce((sum, w) => sum + w.weight, 0);
  const weightDifference = 100 - totalWeight;

  return (
    <Card className="dark:border-gray-700 dark:bg-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="dark:text-white">Assessment Weightings</CardTitle>
            <CardDescription className="dark:text-gray-400">Edit component names and weights</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              disabled={!hasChanges && JSON.stringify(weightings) === JSON.stringify(defaultWeightings)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={saveToLocal}
              disabled={!hasChanges}
            >
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {weightings.map((weighting, index) => (
          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
            <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <Input
              value={weighting.name}
              onChange={(e) => updateWeighting(index, 'name', e.target.value)}
              className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Component name"
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={weighting.weight}
                onChange={(e) => updateWeighting(index, 'weight', parseFloat(e.target.value) || 0)}
                className="w-20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                min="0"
                max="100"
                step="1"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300 w-8">%</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeComponent(index)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-all duration-100 active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={addComponent}
          className="w-full transition-all duration-100 active:scale-95 dark:border-gray-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Component
        </Button>

        <div className="pt-4 border-t dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">Total Weight:</span>
            <span className={`font-semibold ${totalWeight === 100 ? 'text-green-600 dark:text-green-400' : totalWeight > 100 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
              {totalWeight}%
            </span>
          </div>
          {totalWeight !== 100 && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {weightDifference > 0
                ? `Add ${weightDifference}% to reach 100%`
                : `Remove ${Math.abs(weightDifference)}% to reach 100%`}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

