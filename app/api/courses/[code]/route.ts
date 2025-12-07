import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractWeightings } from '@/lib/weightExtractor';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code: codeParam } = await params;
    const code = decodeURIComponent(codeParam);

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Extract weightings from description
    const weightings = extractWeightings(data.description || '');

    return NextResponse.json({
      ...data,
      weightings,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

