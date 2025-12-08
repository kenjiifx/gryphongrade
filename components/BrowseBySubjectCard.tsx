'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import { BookOpen, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Course } from '@/lib/types';

interface BrowseBySubjectCardProps {
  courses: Course[];
  onSubjectClick: (subject: string) => void;
}

export interface BrowseBySubjectCardRef {
  showAllSubjects: () => void;
}

export const BrowseBySubjectCard = forwardRef<BrowseBySubjectCardRef, BrowseBySubjectCardProps>(
  ({ courses, onSubjectClick }, ref) => {
  const [showAll, setShowAll] = useState(false);

  useImperativeHandle(ref, () => ({
    showAllSubjects: () => setShowAll(true),
  }));
  
  const allSubjects = Array.from(new Set(courses.map(c => c.subject)))
    .sort()
    .map(subject => ({
      subject,
      count: courses.filter(c => c.subject === subject).length,
    }));

  const topSubjects = allSubjects.slice(0, 21); // 7 rows x 3 columns = 21 subjects

  return (
    <>
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-gray-900">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            Browse by Subject
          </CardTitle>
          <CardDescription className="text-gray-600">Explore courses by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {topSubjects.map(({ subject, count }) => (
              <button
                key={subject}
                onClick={() => onSubjectClick(subject)}
                className="text-left p-3 rounded-lg hover:bg-blue-50 transition-all duration-150 border border-gray-200 hover:border-blue-300 text-sm font-medium text-gray-700 hover:text-blue-600 group bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold group-hover:text-blue-600 transition-colors truncate">{subject}</span>
                  <span className="text-xs text-gray-500 ml-2 font-medium flex-shrink-0">({count})</span>
                </div>
              </button>
            ))}
          </div>
          {allSubjects.length > 21 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowAll(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-center transition-colors py-2"
              >
                View all {allSubjects.length} subjects →
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">All Subjects ({allSubjects.length})</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
            {allSubjects.map(({ subject, count }) => (
              <button
                key={subject}
                onClick={() => {
                  onSubjectClick(subject);
                  setShowAll(false);
                }}
                className="text-left p-2 rounded-lg hover:bg-blue-50 transition-all duration-150 border border-transparent hover:border-blue-300 text-sm font-medium text-gray-700 hover:text-blue-600 group"
              >
                <div className="flex items-center justify-between">
                  <span className="group-hover:text-blue-600 transition-colors truncate">{subject}</span>
                  <span className="text-xs text-gray-500 ml-1 flex-shrink-0">({count})</span>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

BrowseBySubjectCard.displayName = 'BrowseBySubjectCard';

