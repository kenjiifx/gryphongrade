'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { Search, BookOpen, TrendingUp, Award, Calculator } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrowseBySubjectCard } from '@/components/BrowseBySubjectCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Course } from '@/lib/types';

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();

  useEffect(() => {
    async function fetchCourses() {
      try {
        // Use cache-busting to ensure fresh data
        const timestamp = Date.now();
        const response = await fetch(`/api/courses?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        const totalCount = response.headers.get('X-Total-Count');
        console.log(`[Homepage] Fetched ${data.length} courses (API says ${totalCount} total)`);
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
    // Refresh courses every 10 seconds for faster updates
    const interval = setInterval(fetchCourses, 10000);
    return () => clearInterval(interval);
  }, []);

  const fuse = useMemo(() => {
    if (courses.length === 0) return null;
    return new Fuse(courses, {
      keys: ['code', 'title', 'subject', 'description'],
      threshold: 0.3,
      includeScore: true,
    });
  }, [courses]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !fuse) return [];
    const results = fuse.search(searchQuery).map(result => result.item);
    
    // Sort by course number (extract numeric part from code like "CIS*1300" -> 1300)
    return results.sort((a, b) => {
      const getCourseNumber = (code: string) => {
        const match = code.match(/\*(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return getCourseNumber(a.code) - getCourseNumber(b.code);
    });
  }, [searchQuery, fuse]);

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

  // Stats - fetch from API for real-time accuracy
  const [stats, setStats] = useState({ totalCourses: 0, subjects: 0, mostPopularSubject: '', mostPopularCount: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchStats() {
      try {
        setStatsLoading(true);
        // Use cache-busting to ensure fresh data
        const timestamp = Date.now();
        const response = await fetch(`/api/courses?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        const totalCount = response.headers.get('X-Total-Count');
        const actualCount = totalCount ? parseInt(totalCount, 10) : data.length;
        
        const subjects = new Set(data.map((c: Course) => c.subject)).size;
        
        // Find most popular subject
        const subjectCounts = new Map<string, number>();
        data.forEach((c: Course) => {
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
        
        console.log(`[Stats] Fetched ${data.length} courses (${actualCount} total), ${subjects} subjects`);
        
        setStats({
          totalCourses: actualCount,
          subjects,
          mostPopularSubject,
          mostPopularCount,
        });
      } catch (error) {
        console.error('[Stats] Error fetching stats:', error);
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
    // Refresh stats every 3 seconds for real-time updates
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  // Get popular courses (by subject frequency)
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
    
    // Get subjects with most courses and pick a sample from each
    const sortedSubjects = Array.from(subjectCounts.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 6);
    
    return sortedSubjects.flatMap(([_, courses]) => courses.slice(0, 1));
  }, [courses]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Theme Toggle */}
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          
          {/* Hero Section */}
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center justify-center mb-6">
              <Image
                src="/logo.png"
                alt="GryphonGrade Logo"
                width={80}
                height={80}
                className="drop-shadow-lg"
                priority
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent transition-colors duration-200">
              GryphonGrade
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-2 font-medium transition-colors duration-200">
              University of Guelph Grade Calculator
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-lg transition-colors duration-200">
              Calculate your grades and find out what you need on your final exam
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <Card className="border-2 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCourses.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Courses</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.subjects}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Subjects</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.mostPopularSubject || 'N/A'}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Most Popular ({stats.mostPopularCount} courses)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Card */}
          <Card className="shadow-xl border-2 dark:border-gray-700 dark:bg-gray-800 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl dark:text-white">
                <Search className="h-6 w-6" />
                Search Courses
              </CardTitle>
              <CardDescription className="text-base dark:text-gray-400">
                Enter a course code (e.g., CIS*1300) or course name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Try 'CIS*1300' or 'Programming'..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full text-lg py-6 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all"
                  autoFocus
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedIndex(-1);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>

              {loading && (
                <div className="mt-4 text-center text-gray-500 dark:text-gray-400">
                  Loading courses...
                </div>
              )}

              {!loading && searchQuery && searchResults.length > 0 && (
                <div className="mt-4 border-2 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-lg max-h-[600px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
                  {searchResults.map((course, index) => (
                    <button
                      key={course.id}
                      onClick={() => handleSelectCourse(course)}
                      className={`w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 border-b last:border-b-0 dark:border-gray-700 ${
                        index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500 dark:border-l-blue-400' : 'hover:border-l-4 hover:border-l-blue-300 dark:hover:border-l-blue-600'
                      } active:scale-[0.98]`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                          <BookOpen className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            {course.code}
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                              {course.subject}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 truncate mt-0.5">
                            {course.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                            <span>{course.credits} credits</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!loading && courses.length === 0 && (
                <div className="mt-4 text-center text-gray-500 py-8">
                  <div className="mb-2">⏳ No courses loaded yet.</div>
                  <div className="text-sm">
                    The course scraper is still running. This takes 10-30 minutes.
                    <br />
                    Check your terminal for progress, or wait a bit and refresh this page.
                  </div>
                </div>
              )}
                {!loading && courses.length > 0 && searchQuery && searchResults.length === 0 && (
                  <div className="mt-4 text-center text-gray-500 dark:text-gray-400 py-8">
                    No courses found. Try a different search term.
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Popular & Browse Sections */}
          {!loading && courses.length > 0 && !searchQuery && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              {/* Popular Courses */}
              {popularCourses.length > 0 && (
                <Card className="border-2 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 transition-all duration-150">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      Popular Courses
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">Most common subjects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {popularCourses.slice(0, 6).map((course) => (
                        <button
                          key={course.id}
                          onClick={() => handleSelectCourse(course)}
                          className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-100 border border-transparent hover:border-gray-200 dark:border-gray-700 group active:scale-[0.98]"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {course.code}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                {course.title}
                              </div>
                            </div>
                            <BookOpen className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors ml-2 flex-shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Browse by Subject */}
              <BrowseBySubjectCard courses={courses} onSubjectClick={setSearchQuery} />
            </div>
          )}

          {/* Quick Tips */}
          {!loading && courses.length > 0 && !searchQuery && (
            <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
              <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
                <Calculator className="h-4 w-4" />
                <span>Tip: Search by course code or name, then customize weightings and calculate your grades!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

