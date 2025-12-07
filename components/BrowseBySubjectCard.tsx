'use client';

import { useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Course } from '@/lib/types';

interface BrowseBySubjectCardProps {
  courses: Course[];
  onSubjectClick: (subject: string) => void;
}

export function BrowseBySubjectCard({ courses, onSubjectClick }: BrowseBySubjectCardProps) {
  const [showAll, setShowAll] = useState(false);
  
  const allSubjects = Array.from(new Set(courses.map(c => c.subject)))
    .sort()
    .map(subject => ({
      subject,
      count: courses.filter(c => c.subject === subject).length,
    }));

  const topSubjects = allSubjects.slice(0, 18);

  return (
    <>
      <Card className="border-2 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 transition-all duration-150">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
            Browse by Subject
          </CardTitle>
          <CardDescription className="dark:text-gray-400">Explore courses by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 min-h-[240px]">
            {topSubjects.map(({ subject, count }) => (
              <button
                key={subject}
                onClick={() => onSubjectClick(subject)}
                className="text-left p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-100 border border-transparent hover:border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 group active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{subject}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">({count})</span>
                </div>
              </button>
            ))}
          </div>
          {allSubjects.length > 18 && (
            <div className="mt-4 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => setShowAll(true)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium w-full text-center transition-colors"
              >
                View all {allSubjects.length} subjects →
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">All Subjects ({allSubjects.length})</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {allSubjects.map(({ subject, count }) => (
              <button
                key={subject}
                onClick={() => {
                  onSubjectClick(subject);
                  setShowAll(false);
                }}
                className="text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-100 border border-transparent hover:border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 group active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <span className="group-hover:text-blue-600 transition-colors">{subject}</span>
                  <span className="text-xs text-gray-400 ml-1">({count})</span>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

