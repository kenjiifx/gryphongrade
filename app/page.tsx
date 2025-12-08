'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { Search, BookOpen, TrendingUp, Award, Calculator, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrowseBySubjectCard, BrowseBySubjectCardRef } from '@/components/BrowseBySubjectCard';
import { StatSkeleton } from '@/components/Skeleton';
import { Navbar } from '@/components/Navbar';
import { Course } from '@/lib/types';

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedRef = useRef(false);
  const browseSubjectsRef = useRef<BrowseBySubjectCardRef>(null);

  // Optimized: Fetch courses only once on mount with better caching
  useEffect(() => {
    if (hasLoadedRef.current) return;
    
    async function fetchCourses() {
      try {
        const response = await fetch(`/api/courses`, {
          cache: 'force-cache',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data);
        hasLoadedRef.current = true;
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // Optimized debounce - reduced to 100ms for better responsiveness
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setSelectedIndex(-1);
    }, 100);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Memoize Fuse instance - only recreate when courses change
  const fuse = useMemo(() => {
    if (courses.length === 0) return null;
    return new Fuse(courses, {
      keys: ['code', 'title', 'subject'],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 1,
      ignoreLocation: true,
    });
  }, [courses]);

  // Optimized search results
  const searchResults = useMemo(() => {
    if (!debouncedSearchQuery.trim() || !fuse) return [];
    
    const results = fuse.search(debouncedSearchQuery, { limit: 50 }).map(result => result.item);
    
    return results.sort((a, b) => {
      const getCourseNumber = (code: string) => {
        const match = code.match(/\*(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return getCourseNumber(a.code) - getCourseNumber(b.code);
    });
  }, [debouncedSearchQuery, fuse]);

  const handleSelectCourse = (course: Course) => {
    router.push(`/course/${encodeURIComponent(course.code)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && searchResults[selectedIndex]) {
      handleSelectCourse(searchResults[selectedIndex]);
    }
  };

  // Optimized: Calculate stats from courses data
  const stats = useMemo(() => {
    if (courses.length === 0) {
      return { totalCourses: 0, subjects: 0, mostPopularSubject: '', mostPopularCount: 0 };
    }
    
    const subjects = new Set(courses.map(c => c.subject)).size;
    
    const subjectCounts = new Map<string, number>();
    courses.forEach(c => {
      const count = subjectCounts.get(c.subject) || 0;
      subjectCounts.set(c.subject, count + 1);
    });
    
    let mostPopularSubject = '';
    let mostPopularCount = 0;
    subjectCounts.forEach((count, subject) => {
      if (count > mostPopularCount) {
        mostPopularCount = count;
        mostPopularSubject = subject;
      }
    });
    
    return {
      totalCourses: courses.length,
      subjects,
      mostPopularSubject,
      mostPopularCount,
    };
  }, [courses]);

  // Get popular courses
  const popularCourses = useMemo(() => {
    if (courses.length === 0) return [];
    const subjectCounts = new Map<string, Course[]>();
    courses.forEach(course => {
      const subject = course.subject;
      if (!subjectCounts.has(subject)) {
        subjectCounts.set(subject, []);
      }
      subjectCounts.get(subject)!.push(course);
    });
    
    const sortedSubjects = Array.from(subjectCounts.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 6);
    
    return sortedSubjects.flatMap(([_, courses]) => courses.slice(0, 1));
  }, [courses]);

  const handleBrowseCourses = () => {
    browseSubjectsRef.current?.showAllSubjects();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Navbar */}
      <Navbar />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Calculate your grades{' '}
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                with confidence
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Track your progress, customize assessment weightings, and find out exactly what you need on your final exam
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => {
                  document.getElementById('search-input')?.focus();
                }}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={handleBrowseCourses}
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-6 text-lg font-semibold rounded-xl"
              >
                Browse Courses
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                {loading ? (
                  <StatSkeleton />
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.totalCourses.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Courses</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                {loading ? (
                  <StatSkeleton />
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.subjects}
                      </div>
                      <div className="text-sm text-gray-600">Subjects</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                {loading ? (
                  <StatSkeleton />
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-pink-50 border border-pink-100">
                      <Award className="h-6 w-6 text-pink-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.mostPopularSubject || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Most Popular ({stats.mostPopularCount} courses)
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Search Card */}
          <Card className="bg-white border border-gray-200 shadow-lg mb-8 md:mb-12">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl md:text-3xl text-gray-900">
                <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100">
                  <Search className="h-6 w-6 text-indigo-600" />
                </div>
                Search Courses
              </CardTitle>
              <CardDescription className="text-base text-gray-600 pt-2">
                Enter a course code (e.g., CIS*1300) or course name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Input
                  id="search-input"
                  type="text"
                  placeholder="Try 'CIS*1300' or 'Programming'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full text-lg py-6 pl-14 pr-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl transition-all"
                />
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setDebouncedSearchQuery('');
                      setSelectedIndex(-1);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                  >
                    ✕
                  </button>
                )}
              </div>

              {loading && (
                <div className="mt-6 text-center text-gray-500 py-8">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading courses...</span>
                  </div>
                </div>
              )}

              {!loading && debouncedSearchQuery && searchResults.length > 0 && (
                <div className="mt-6 border border-gray-200 rounded-xl bg-white shadow-xl max-h-[600px] overflow-y-auto">
                  {searchResults.map((course, index) => (
                    <button
                      key={course.id}
                      onClick={() => handleSelectCourse(course)}
                      className={`w-full text-left px-5 py-4 hover:bg-blue-50 transition-all duration-150 border-b last:border-b-0 border-gray-200 ${
                        index === selectedIndex 
                          ? 'bg-indigo-50 border-l-4 border-l-indigo-500' 
                          : 'hover:border-l-4 hover:border-l-indigo-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-gray-100 flex-shrink-0">
                          <BookOpen className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                            {course.code}
                            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {course.subject}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 truncate mt-1">
                            {course.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            {course.credits} credits
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!loading && courses.length === 0 && (
                <div className="mt-6 text-center text-gray-500 py-8">
                  <div className="mb-2">⏳ No courses loaded yet.</div>
                  <div className="text-sm">
                    The course scraper is still running. This takes 10-30 minutes.
                  </div>
                </div>
              )}
              
              {!loading && courses.length > 0 && debouncedSearchQuery && searchResults.length === 0 && (
                <div className="mt-6 text-center text-gray-500 py-8">
                  No courses found. Try a different search term.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular & Browse Sections */}
          {!loading && courses.length > 0 && !debouncedSearchQuery && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
              {/* Popular Courses */}
              {popularCourses.length > 0 && (
                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-gray-900">
                      <div className="p-2 rounded-lg bg-purple-50 border border-purple-100">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      Popular Courses
                    </CardTitle>
                    <CardDescription className="text-gray-600">Most common subjects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {popularCourses.slice(0, 6).map((course) => (
                        <button
                          key={course.id}
                          onClick={() => handleSelectCourse(course)}
                          className="w-full text-left p-4 rounded-lg hover:bg-gray-50 transition-all duration-150 border border-transparent hover:border-indigo-200 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {course.code}
                              </div>
                              <div className="text-sm text-gray-600 truncate mt-1">
                                {course.title}
                              </div>
                            </div>
                            <BookOpen className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors ml-2 flex-shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Browse by Subject */}
              <BrowseBySubjectCard 
                ref={browseSubjectsRef}
                courses={courses} 
                onSubjectClick={setSearchQuery} 
              />
            </div>
          )}

          {/* Quick Tips */}
          {!loading && courses.length > 0 && !debouncedSearchQuery && (
            <div className="mt-8 md:mt-12 text-center">
              <div className="inline-flex items-center gap-3 text-sm text-gray-600 bg-white border border-gray-200 px-6 py-3 rounded-full shadow-sm">
                <Calculator className="h-5 w-5 text-indigo-600" />
                <span>Tip: Search by course code or name, then customize weightings and calculate your grades!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
