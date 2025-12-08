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

  const topSubjects = allSubjects.slice(0, 21); // 7 rows x 3 columns = 21 subjects

  return (
    <>
      <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-green-500/50 transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <BookOpen className="h-5 w-5 text-green-400" />
            </div>
            Browse by Subject
          </CardTitle>
          <CardDescription className="text-gray-400">Explore courses by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {topSubjects.map(({ subject, count }) => (
              <button
                key={subject}
                onClick={() => onSubjectClick(subject)}
                className="text-left p-3 rounded-lg hover:bg-slate-800/50 transition-all duration-150 border border-slate-700/50 hover:border-green-500/50 text-sm font-medium text-gray-300 hover:text-green-400 group bg-slate-800/30"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold group-hover:text-green-400 transition-colors truncate">{subject}</span>
                  <span className="text-xs text-gray-500 ml-2 font-medium flex-shrink-0">({count})</span>
                </div>
              </button>
            ))}
          </div>
          {allSubjects.length > 21 && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <button
                onClick={() => setShowAll(true)}
                className="text-sm text-green-400 hover:text-green-300 font-medium w-full text-center transition-colors py-2"
              >
                View all {allSubjects.length} subjects →
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">All Subjects ({allSubjects.length})</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
            {allSubjects.map(({ subject, count }) => (
              <button
                key={subject}
                onClick={() => {
                  onSubjectClick(subject);
                  setShowAll(false);
                }}
                className="text-left p-2 rounded-lg hover:bg-slate-800/50 transition-all duration-150 border border-transparent hover:border-green-500/50 text-sm font-medium text-gray-300 hover:text-green-400 group"
              >
                <div className="flex items-center justify-between">
                  <span className="group-hover:text-green-400 transition-colors truncate">{subject}</span>
                  <span className="text-xs text-gray-500 ml-1 flex-shrink-0">({count})</span>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

