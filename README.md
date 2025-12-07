<<<<<<< HEAD
# 🎓 GryphonGrade

A modern, full-stack grade calculator for University of Guelph students. Search for courses, calculate your grades, and find out what you need on your final exam.

![GryphonGrade](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Free-green?style=for-the-badge&logo=supabase)

## ✨ Features

- 🔍 **Fast Course Search**: Fuzzy search through 2,600+ UofG courses with autocomplete
- 📊 **Real-Time Grade Calculator**: Track your grades across all assessment components
- ⚖️ **Custom Weightings**: Edit assessment weightings locally with localStorage persistence
- 🎯 **Final Exam Calculator**: Calculate what you need on your final to reach your target grade
- 🌓 **Dark Mode**: Beautiful dark/light mode toggle
- 🎨 **Modern UI**: Polished, responsive design built with TailwindCSS and ShadCN UI
- 📱 **Fully Responsive**: Works perfectly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account ([sign up free](https://supabase.com))
- Git (for deployment)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd gryphongrade
npm install
```

### 2. Set Up Supabase

1. **Create a Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose a name and database password
   - Wait 2 minutes for project setup

2. **Create the courses table:**
   - Go to SQL Editor in Supabase Dashboard
   - Run this SQL:

```sql
CREATE TABLE courses (
  id BIGSERIAL PRIMARY KEY,
  subject TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  credits NUMERIC,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_courses_subject ON courses(subject);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON courses
  FOR SELECT USING (true);
```

3. **Get your API keys:**
   - Go to Settings → API
   - Copy your Project URL, `anon` key, and `service_role` key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**⚠️ Important**: Never commit `.env.local` to Git! It's already in `.gitignore`.

### 4. Scrape Courses

Populate your database with all UofG courses:

```bash
npm run scrape:courses
```

This will:
- Scrape all course descriptions from `calendar.uoguelph.ca`
- Extract course codes, titles, descriptions, and credits
- Store everything in your Supabase database
- Take **10-30 minutes** (scrapes 2,600+ courses)

**Note**: The scraper includes rate limiting to be respectful to UofG's servers.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Searching for Courses

1. On the home page, type a course code (e.g., `CIS*1300`) or course name
2. Select a course from the autocomplete results
3. You'll be taken to the course detail page

### Calculating Grades

1. **Edit Weightings** (optional):
   - Use the "Assessment Weightings" panel to customize component names and weights
   - Click "Save" to persist changes (stored in localStorage)

2. **Enter Your Grades**:
   - For each assessment, enter your earned score and maximum score
   - Your current grade updates automatically
   - See your progress with the progress bar

3. **Calculate Final Exam Target**:
   - Set your target grade (e.g., 80%)
   - See exactly what you need on your final exam
   - Get warnings if the target is unachievable

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS + ShadCN UI
- **Database**: Supabase (PostgreSQL)
- **Search**: Fuse.js for fuzzy search
- **Scraping**: Cheerio for HTML parsing

## 📁 Project Structure

```
gryphongrade/
├── app/
│   ├── api/
│   │   ├── courses/
│   │   │   ├── route.ts          # Get all courses (with pagination)
│   │   │   └── [code]/route.ts   # Get single course + weightings
│   │   └── weights/[code]/route.ts
│   ├── course/[code]/page.tsx    # Course detail page
│   ├── globals.css               # Global styles + dark mode
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage with search
├── components/
│   ├── ui/                       # ShadCN UI components
│   ├── BrowseBySubjectCard.tsx   # Subject browser
│   ├── GradeCalculator.tsx       # Grade calculation UI
│   ├── ThemeToggle.tsx           # Dark/light mode toggle
│   └── WeightEditor.tsx          # Weighting editor
├── lib/
│   ├── supabase.ts               # Supabase client setup
│   ├── types.ts                  # TypeScript interfaces
│   ├── utils.ts                  # Utility functions
│   └── weightExtractor.ts       # Weighting extraction logic
├── scripts/
│   ├── scrapeCourses.ts         # Course scraper (2,600+ courses)
│   └── scrapeWeights.ts         # Weight extraction script
└── supabase/
    └── migrations/
        └── 001_create_courses_table.sql
```

## 🚀 Deployment (FREE!)

Deploy to **Vercel** completely free! See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.

**Quick Deploy:**
1. Push code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

**Cost**: $0/month (Vercel free tier + Supabase free tier)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run scrape:courses` - Scrape all UofG courses
- `npm run lint` - Run ESLint

## 🎯 How It Works

### Course Scraping

The scraper (`scripts/scrapeCourses.ts`):
1. Fetches course pages from `calendar.uoguelph.ca`
2. Extracts course codes, titles, descriptions, and credits
3. Stores everything in Supabase
4. Handles 109+ subjects across 3 calendar types

### Weight Extraction

The weight extractor (`lib/weightExtractor.ts`):
- Uses regex patterns to find assessment weightings in course descriptions
- Looks for patterns like "Assignments: 30%", "Midterm - 20%"
- Searches sections like "Evaluation:", "Assessment Weighting"
- Falls back to "Final Exam: 100%" if no weightings found

### Grade Calculation

- **Current Grade**: Weighted average of completed assessments
- **Final Exam Target**: Calculates required final exam score to reach target grade
- **Real-time Updates**: All calculations update as you type

## 🐛 Troubleshooting

### Courses not loading

- ✅ Make sure you've run `npm run scrape:courses`
- ✅ Check Supabase environment variables are set correctly
- ✅ Verify the `courses` table exists in Supabase
- ✅ Check browser console for API errors

### Only 1,000 courses showing

- ✅ This is fixed! The API now uses pagination to fetch all courses
- ✅ Restart your dev server if you still see this issue

### Weightings not appearing

- ✅ Weightings are extracted from course descriptions
- ✅ If a course doesn't have grading info, it defaults to "Final Exam: 100%"
- ✅ You can always edit weightings manually using the weight editor

### Build errors

- ✅ Make sure all dependencies are installed: `npm install`
- ✅ Check you're using Node.js 18+
- ✅ Verify TypeScript types are correct

## 📊 Current Stats

- **Total Courses**: 2,621
- **Total Subjects**: 109
- **Total Credits**: ~6,225

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 📝 License

MIT

## 🙏 Acknowledgments

- Inspired by [GooseGrade.ca](https://goosegrade.ca)
- Built for University of Guelph students
- Uses [ShadCN UI](https://ui.shadcn.com) components
- Powered by [Vercel](https://vercel.com) and [Supabase](https://supabase.com)

---

**Made with ❤️ for UofG students**
=======
# gryphongrade
>>>>>>> dfe24dc087d1bf1d982aa6a951889338419bc49f
