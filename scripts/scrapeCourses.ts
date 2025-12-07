import * as cheerio from 'cheerio';
import { supabaseAdmin } from '../lib/supabase';

interface CourseData {
  subject: string;
  code: string;
  title: string;
  description: string;
  credits: number;
  url: string;
}

async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return await response.text();
}

async function getSubjectLinks(): Promise<string[]> {
  const linksSet = new Set<string>();
  
  // Base URLs for different calendar sections
  const baseUrls = [
    'https://calendar.uoguelph.ca/undergraduate-calendar/course-descriptions/',
    'https://calendar.uoguelph.ca/guelph-humber-calendar/course-descriptions/',
    'https://calendar.uoguelph.ca/associate-diploma/course-descriptions/',
  ];

  // COMPREHENSIVE subject codes - all possible subject codes from UofG calendar
  // This includes all subjects from undergraduate, Guelph-Humber, and Associate Diploma calendars
  const knownSubjects = [
    // Undergraduate Calendar - Core subjects
    'acct', 'agr', 'ansc', 'anth', 'arab', 'arth', 'asci', 'bioc', 'biol', 'biom', 'blck', 'bot', 'bus',
    'chem', 'chin', 'clas', 'cis', 'coop', 'crea', 'crwr', 'cjpp', 'crop', 'cts', 'cdx', 'csi', 'cons',
    'econ', 'engg', 'engl', 'edrd', 'envm', 'envs', 'eqn', 'euro', 'xsen', 'frhd', 'fin', 'food', 'fare',
    'fren', 'geog', 'germ', 'grek', 'hist', 'hort', 'htm', 'hhns', 'hk', 'hrob', 'humn', 'ies', 'indg',
    'ibio', 'ieaf', 'ips', 'iss', 'univ', 'idev', 'ital', 'jls', 'larc', 'lat', 'lacs', 'lead', 'ling',
    'mgmt', 'mcs', 'math', 'micr', 'mcb', 'mbg', 'musc', 'nano', 'neur', 'nutr', 'oneh', 'oagr', 'path',
    'phil', 'phys', 'pbio', 'pols', 'popm', 'port', 'psyc', 'real', 'rpd', 'rurs', 'sxgn', 'socp', 'soc',
    'soan', 'span', 'spmt', 'stat', 'sart', 'thst', 'tox', 'vetm', 'wmst', 'zoo', 'dasc', 'clst',
    // Guelph-Humber Calendar
    'ahss', 'badm', 'css', 'ecs', 'just', 'kin', 'mdst', 'scma',
    // Associate Diploma
    'dagr', 'denm', 'deqn', 'dhrt', 'cphh', 'dtm', 'cvoa', 'dvt',
  ];

  // First, get links from the main pages
  for (const baseUrl of baseUrls) {
    try {
      const html = await fetchPage(baseUrl);
      const $ = cheerio.load(html);
      
      $('a[href*="/course-descriptions/"]').each((_, element) => {
        const href = $(element).attr('href');
        if (href && !href.includes('#') && !href.includes('.pdf')) {
          const fullUrl = href.startsWith('http') ? href : `https://calendar.uoguelph.ca${href}`;
          const normalizedUrl = fullUrl.replace(/\/$/, '');
          linksSet.add(normalizedUrl);
        }
      });
    } catch (error) {
      console.error(`Error fetching ${baseUrl}:`, error);
    }
  }

  // Also add known subject URLs directly to ensure we don't miss any
  // Try each subject in all calendar types
  const calendarTypes = [
    'undergraduate-calendar',
    'guelph-humber-calendar',
    'associate-diploma'
  ];

  for (const calendarType of calendarTypes) {
    for (const subject of knownSubjects) {
      const url = `https://calendar.uoguelph.ca/${calendarType}/course-descriptions/${subject}/`;
      linksSet.add(url);
    }
  }

  console.log(`Found ${linksSet.size} unique subject pages (including ${knownSubjects.length} known subjects)`);
  console.log(`Known subjects: ${knownSubjects.slice(0, 20).join(', ')}${knownSubjects.length > 20 ? '...' : ''}`);
  return Array.from(linksSet);
}

async function scrapeCoursesFromSubject(url: string): Promise<CourseData[]> {
  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const courses: CourseData[] = [];

  // Extract subject from URL
  const subjectMatch = url.match(/\/([a-z]+)\/?$/i);
  const subject = subjectMatch ? subjectMatch[1].toUpperCase() : 'UNKNOWN';

  // UofG calendar uses div.courseblock structure - try multiple selectors
  const selectors = [
    'div.courseblock',
    'div.course',
    '.courseblock',
    '.course',
  ];

  for (const selector of selectors) {
    $(selector).each((_, element) => {
      const $el = $(element);
      
      // Try multiple ways to find course code
      let codeText = '';
      const codeSelectors = [
        'span.detail-code strong',
        'span.detail-code',
        '.detail-code strong',
        '.detail-code',
        'strong:contains("*")',
      ];
      
      for (const codeSel of codeSelectors) {
        const $codeEl = $el.find(codeSel);
        if ($codeEl.length > 0) {
          codeText = $codeEl.first().text().trim();
          break;
        }
      }
      
      // Also try finding in the element's direct text
      if (!codeText) {
        const directText = $el.text();
        const directMatch = directText.match(/([A-Z]{2,4})\*(\d{4})/);
        if (directMatch) {
          codeText = directMatch[0];
        }
      }
      
      const codeMatch = codeText.match(/([A-Z]{2,4})\*?(\d{4})/);
      if (!codeMatch) return;

      const code = `${codeMatch[1]}*${codeMatch[2]}`;
      const courseSubject = codeMatch[1];

      // Skip if we already have this course
      if (courses.some(c => c.code === code)) return;

      // Extract title - try multiple selectors
      let title = '';
      const titleSelectors = [
        'span.detail-title strong',
        'span.detail-title',
        '.detail-title strong',
        '.detail-title',
        'h3',
        'h4',
      ];
      
      for (const titleSel of titleSelectors) {
        const $titleEl = $el.find(titleSel);
        if ($titleEl.length > 0) {
          title = $titleEl.first().text().trim();
          // Clean up title - remove course code if present
          title = title.replace(/^[A-Z]{2,4}\*?\d{4}\s*[-–]\s*/i, '').trim();
          if (title) break;
        }
      }

      // Extract description - try multiple selectors
      let description = '';
      const descSelectors = [
        'div.courseblockextra',
        '.courseblockextra',
        'div.description',
        '.description',
        'p',
      ];
      
      for (const descSel of descSelectors) {
        const $descEl = $el.find(descSel);
        if ($descEl.length > 0) {
          description = $descEl.text().trim();
          // Remove course code and title from description if present
          description = description.replace(/^[A-Z]{2,4}\*?\d{4}\s*[-–]\s*/i, '');
          description = description.replace(new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[-–]?\\s*`, 'i'), '');
          if (description) break;
        }
      }

      // Extract credits - try multiple formats
      let credits = 0.50;
      const creditsSelectors = [
        'span.detail-hours_html strong',
        'span.detail-hours_html',
        '.detail-hours_html',
        'span.detail-hours strong',
        '.detail-hours',
      ];
      
      for (const credSel of creditsSelectors) {
        const $creditsEl = $el.find(credSel);
        if ($creditsEl.length > 0) {
          const creditsText = $creditsEl.text().trim();
          // Try [0.50] format
          let creditsMatch = creditsText.match(/\[(\d+\.?\d*)\]/);
          if (creditsMatch) {
            credits = parseFloat(creditsMatch[1]);
            break;
          }
          // Try "0.50 credits" format
          creditsMatch = creditsText.match(/(\d+\.?\d*)\s*(?:credit|unit)/i);
          if (creditsMatch) {
            credits = parseFloat(creditsMatch[1]);
            break;
          }
        }
      }
      
      // Fallback: search in all text for credit pattern
      if (credits === 0.50) {
        const allText = $el.text();
        const creditsMatch = allText.match(/(\d+\.?\d*)\s*(?:credit|unit)/i);
        if (creditsMatch) {
          credits = parseFloat(creditsMatch[1]);
        }
      }

      courses.push({
        subject: courseSubject,
        code,
        title: title || `${codeMatch[1]}*${codeMatch[2]}`,
        description,
        credits,
        url,
      });
    });
    
    // If we found courses with this selector, break
    if (courses.length > 0) break;
  }

  // Fallback: if no courseblock divs found, try searching all text for course codes
  if (courses.length === 0) {
    const allText = $('body').text();
    const codeMatches = allText.match(/([A-Z]{2,4})\*(\d{4})/g);
    if (codeMatches) {
      const uniqueCodes = [...new Set(codeMatches)];
      for (const codeText of uniqueCodes) {
        const codeMatch = codeText.match(/([A-Z]{2,4})\*(\d{4})/);
        if (codeMatch) {
          courses.push({
            subject: codeMatch[1],
            code: codeText,
            title: '',
            description: '',
            credits: 0.50,
            url,
          });
        }
      }
    }
  }

  return courses;
}

async function main() {
  console.log('Starting course scraping...');

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    process.exit(1);
  }

  try {
    // Get all subject links
    console.log('Fetching subject links...');
    const subjectLinks = await getSubjectLinks();
    console.log(`Found ${subjectLinks.length} subject pages`);

    // Scrape courses from each subject
    const allCourses: CourseData[] = [];
    const seenCourseCodes = new Set<string>();
    const subjectStats = new Map<string, number>();
    
    for (let i = 0; i < subjectLinks.length; i++) {
      const link = subjectLinks[i];
      const subjectMatch = link.match(/\/([a-z]+)\/?$/i);
      const subjectCode = subjectMatch ? subjectMatch[1].toUpperCase() : 'UNKNOWN';
      
      console.log(`Scraping ${i + 1}/${subjectLinks.length}: ${subjectCode} - ${link}`);
      try {
        const courses = await scrapeCoursesFromSubject(link);
        let added = 0;
        for (const course of courses) {
          if (!seenCourseCodes.has(course.code)) {
            allCourses.push(course);
            seenCourseCodes.add(course.code);
            added++;
            // Track courses per subject
            const currentCount = subjectStats.get(course.subject) || 0;
            subjectStats.set(course.subject, currentCount + 1);
          }
        }
        if (courses.length > 0) {
          console.log(`  ✅ ${subjectCode}: Found ${courses.length} courses (${added} new, ${allCourses.length} total unique)`);
        } else {
          console.log(`  ⚠️  ${subjectCode}: No courses found (might be empty or 404)`);
        }
        // Be nice to the server
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error: any) {
        // Don't fail completely on errors, just log and continue
        if (error.message?.includes('404') || error.message?.includes('Not Found')) {
          console.log(`  ⚠️  ${subjectCode}: Page not found (404) - skipping`);
        } else {
          console.error(`  ❌ ${subjectCode}: Error - ${error.message || error}`);
        }
      }
    }
    
    // Print subject statistics
    console.log(`\n📊 Subject Statistics:`);
    const sortedSubjects = Array.from(subjectStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    sortedSubjects.forEach(([subject, count]) => {
      console.log(`   ${subject}: ${count} courses`);
    });
    console.log(`\n   Total unique subjects with courses: ${subjectStats.size}`);

    console.log(`\nTotal courses found: ${allCourses.length}`);

    // Deduplicate courses by code (keep the one with longer description)
    const uniqueCourses = new Map<string, CourseData>();
    for (const course of allCourses) {
      if (!uniqueCourses.has(course.code) || course.description.length > uniqueCourses.get(course.code)!.description.length) {
        uniqueCourses.set(course.code, course);
      }
    }
    const deduplicatedCourses = Array.from(uniqueCourses.values());
    console.log(`After deduplication: ${deduplicatedCourses.length} unique courses`);

    // Insert into Supabase in batches to avoid conflicts
    console.log('Inserting courses into Supabase...');
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < deduplicatedCourses.length; i += batchSize) {
      const batch = deduplicatedCourses.slice(i, i + batchSize);
      const { error } = await supabaseAdmin
        .from('courses')
        .upsert(batch, { onConflict: 'code' });

      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        // Continue with next batch instead of exiting
      } else {
        inserted += batch.length;
        console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(deduplicatedCourses.length / batchSize)} (${inserted}/${deduplicatedCourses.length} courses)`);
      }
    }

    console.log(`\n✅ Successfully scraped and saved ${inserted} courses!`);
    console.log(`📊 Subjects found: ${new Set(deduplicatedCourses.map(c => c.subject)).size}`);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
