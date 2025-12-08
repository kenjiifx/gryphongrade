'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WeightEditor } from '@/components/WeightEditor';
import { GradeCalculator } from '@/components/GradeCalculator';
import { Course, AssessmentComponent } from '@/lib/types';

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const code = decodeURIComponent(params.code as string);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [weightings, setWeightings] = useState<AssessmentComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const response = await fetch(`/api/courses/${encodeURIComponent(code)}`);
        if (!response.ok) {
          throw new Error('Course not found');
        }
        const data = await response.json();
        setCourse(data);
        setWeightings(data.weightings || []);
        
        // Save to recent courses
        try {
          const recent = localStorage.getItem('recent_courses');
          const codes = recent ? JSON.parse(recent) as string[] : [];
          const updated = [code, ...codes.filter(c => c !== code)].slice(0, 10);
          localStorage.setItem('recent_courses', JSON.stringify(updated));
        } catch (e) {
          // Ignore localStorage errors
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load course');
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading course...</div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md bg-white border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">Course Not Found</CardTitle>
            <CardDescription className="text-gray-600">{error || 'The requested course could not be found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} variant="outline" className="transition-all duration-100 active:scale-95 border-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="transition-all duration-100 active:scale-95 text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </div>

        {/* Course Header */}
        <Card className="mb-6 bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2 text-gray-900">{course.code}</CardTitle>
                <CardDescription className="text-lg text-gray-600">{course.title}</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Credits</div>
                <div className="text-2xl font-semibold text-gray-900">{course.credits}</div>
              </div>
            </div>
          </CardHeader>
          {course.description && (
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Weight Editor */}
        <div className="mb-6">
          <WeightEditor
            courseCode={course.code}
            defaultWeightings={weightings}
            onWeightingsChange={setWeightings}
          />
        </div>

        {/* Grade Calculator */}
        <GradeCalculator courseCode={course.code} weightings={weightings} />
      </div>
    </div>
  );
}

