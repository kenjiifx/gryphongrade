export interface Course {
  id: number
  subject: string
  code: string
  title: string
  description: string
  credits: number
  url: string
}

export interface AssessmentComponent {
  name: string
  weight: number
}

export interface GradeEntry {
  componentName: string
  earnedScore: number
  maxScore: number
  weight: number
}

