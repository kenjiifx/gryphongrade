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
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-900">Assessment Weightings</CardTitle>
            <CardDescription className="text-gray-600">Edit component names and weights</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              disabled={!hasChanges && JSON.stringify(weightings) === JSON.stringify(defaultWeightings)}
              className="border-gray-300"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={saveToLocal}
              disabled={!hasChanges}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {weightings.map((weighting, index) => (
          <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
            <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <Input
              value={weighting.name}
              onChange={(e) => updateWeighting(index, 'name', e.target.value)}
              className="flex-1 bg-white border-gray-300"
              placeholder="Component name"
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={weighting.weight}
                onChange={(e) => updateWeighting(index, 'weight', parseFloat(e.target.value) || 0)}
                className="w-20 bg-white border-gray-300"
                min="0"
                max="100"
                step="1"
              />
              <span className="text-sm text-gray-600 w-8">%</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeComponent(index)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-100 active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={addComponent}
          className="w-full transition-all duration-100 active:scale-95 border-gray-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Component
        </Button>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Weight:</span>
            <span className={`font-semibold ${totalWeight === 100 ? 'text-green-600' : totalWeight > 100 ? 'text-red-600' : 'text-orange-600'}`}>
              {totalWeight}%
            </span>
          </div>
          {totalWeight !== 100 && (
            <div className="mt-2 text-xs text-gray-500">
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

