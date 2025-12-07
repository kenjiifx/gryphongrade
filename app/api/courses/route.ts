import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    // Log the request for debugging
    const timestamp = Date.now();
    console.log(`[API] /api/courses called at ${new Date(timestamp).toISOString()}`);

    // Supabase has a HARD LIMIT of 1000 rows per query - must use pagination
    // Fetch all courses in batches using .range()
    let allCourses: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;
    let totalCount = 0;

    try {
      while (hasMore) {
        const from = page * pageSize;
        const to = (page + 1) * pageSize - 1;
        
        const { data, error, count } = await supabase
          .from('courses')
          .select('*', { count: page === 0 ? 'exact' : undefined })
          .order('code', { ascending: true })
          .range(from, to);

        if (error) {
          console.error(`[API] Supabase error on page ${page}:`, error);
          throw error;
        }

        if (count !== null && page === 0) {
          totalCount = count;
          console.log(`[API] Total courses in DB: ${totalCount}`);
        }

        if (data && data.length > 0) {
          allCourses = [...allCourses, ...data];
          console.log(`[API] Fetched page ${page + 1}: ${data.length} courses (total so far: ${allCourses.length})`);
          page++;
          hasMore = data.length === pageSize && (totalCount === 0 || allCourses.length < totalCount);
        } else {
          hasMore = false;
        }
      }
    } catch (paginationError: any) {
      console.error('[API] Pagination error:', paginationError);
      return NextResponse.json({ error: paginationError.message || 'Failed to fetch courses' }, { status: 500 });
    }

    console.log(`[API] Returning ${allCourses.length} courses (total in DB: ${totalCount})`);
    
    // Log sample courses to verify data
    if (allCourses.length > 0) {
      const mathCourses = allCourses.filter((c: any) => c.code?.startsWith('MATH'));
      console.log(`[API] Found ${mathCourses.length} MATH* courses`);
      if (mathCourses.length > 0) {
        console.log(`[API] Sample MATH course: ${mathCourses[0].code} - ${mathCourses[0].title}`);
      }
      
      const uniqueSubjects = new Set(allCourses.map((c: any) => c.subject)).size;
      console.log(`[API] Found ${uniqueSubjects} unique subjects`);
    }

    // Ensure we return an array
    return NextResponse.json(allCourses, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Total-Count': String(totalCount || allCourses.length),
        'X-Timestamp': String(timestamp),
      },
    });
  } catch (error: any) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

