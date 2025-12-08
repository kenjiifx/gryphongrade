import { AssessmentComponent } from './types';

export function extractWeightings(description: string): AssessmentComponent[] {
  const components: AssessmentComponent[] = [];
  const text = description.toLowerCase();

  // Pattern 1: "Assignments: 30%" or "Assignments - 30%"
  const pattern1 = /([a-z\s]+?)\s*[:\-–]\s*(\d{1,3})\s*%/gi;
  let match;
  const found: Map<string, number> = new Map();

  while ((match = pattern1.exec(description)) !== null) {
    const name = match[1].trim();
    const weight = parseInt(match[2], 10);
    
    // Filter out common false positives
    if (name.length > 2 && name.length < 50 && weight > 0 && weight <= 100) {
      // Normalize common names
      const normalizedName = normalizeComponentName(name);
      if (!found.has(normalizedName) || found.get(normalizedName)! < weight) {
        found.set(normalizedName, weight);
      }
    }
  }

  // Pattern 2: Look for evaluation sections
  const evalSection = description.match(/evaluation[:\s]+(.*?)(?:\n\n|$)/is);
  if (evalSection) {
    const evalText = evalSection[1];
    const evalMatches = evalText.matchAll(/([a-z\s]+?)\s*[:\-–]\s*(\d{1,3})\s*%/gi);
    for (const m of evalMatches) {
      const name = normalizeComponentName(m[1].trim());
      const weight = parseInt(m[2], 10);
      if (weight > 0 && weight <= 100) {
        found.set(name, weight);
      }
    }
  }

  // Pattern 3: Look for "Assessment Weighting" or "Mark Distribution"
  const assessmentSection = description.match(/(?:assessment|mark|grade)\s*(?:weighting|distribution)[:\s]+(.*?)(?:\n\n|$)/is);
  if (assessmentSection) {
    const assessText = assessmentSection[1];
    const assessMatches = assessText.matchAll(/([a-z\s]+?)\s*[:\-–]\s*(\d{1,3})\s*%/gi);
    for (const m of assessMatches) {
      const name = normalizeComponentName(m[1].trim());
      const weight = parseInt(m[2], 10);
      if (weight > 0 && weight <= 100) {
        found.set(name, weight);
      }
    }
  }

  // Convert map to array
  for (const [name, weight] of found.entries()) {
    components.push({ name, weight });
  }

  // If we found components, return them
  if (components.length > 0) {
    // Ensure total doesn't exceed 100%
    const total = components.reduce((sum, c) => sum + c.weight, 0);
    if (total > 100) {
      // Scale down proportionally
      components.forEach(c => {
        c.weight = Math.round((c.weight / total) * 100);
      });
    }
    return components;
  }

  // Fallback: return sensible defaults instead of 100% final exam
  return [
    { name: 'Assignments', weight: 30 },
    { name: 'Midterm', weight: 30 },
    { name: 'Final Exam', weight: 40 },
  ];
}

function normalizeComponentName(name: string): string {
  const normalized = name.trim();
  
  // Common variations
  const mappings: Record<string, string> = {
    'assignment': 'Assignments',
    'assignments': 'Assignments',
    'assign': 'Assignments',
    'lab': 'Labs',
    'labs': 'Labs',
    'laboratory': 'Labs',
    'midterm': 'Midterm',
    'midterm exam': 'Midterm',
    'mid term': 'Midterm',
    'final': 'Final Exam',
    'final exam': 'Final Exam',
    'final examination': 'Final Exam',
    'exam': 'Final Exam',
    'examination': 'Final Exam',
    'quiz': 'Quizzes',
    'quizzes': 'Quizzes',
    'project': 'Project',
    'projects': 'Project',
    'presentation': 'Presentation',
    'presentations': 'Presentation',
    'participation': 'Participation',
    'attendance': 'Attendance',
    'homework': 'Homework',
    'home work': 'Homework',
  };

  const lower = normalized.toLowerCase();
  for (const [key, value] of Object.entries(mappings)) {
    if (lower.includes(key)) {
      return value;
    }
  }

  // Capitalize first letter of each word
  return normalized
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

