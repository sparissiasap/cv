export interface CvMeta {
  lang: string;
  availableLangs: string[];
  pageTitle: string;
  description: string;
  shareUrl: string;
  ogImage?: string;
}

export interface ContactItem {
  icon: string;
  text: string;
  href?: string;
}

export interface StatItem {
  number: string;
  label: string;
}

export interface CvProfile {
  name: string;
  title: string;
  photo: string;
  photoPosition?: string;
  chips: string[];
  contact: ContactItem[];
  stats: StatItem[];
}

export interface CvSummary {
  label: string;
  paragraphs: string[];
}

export interface Job {
  title: string;
  company: string;
  dateRange: string;
  location?: string;
  current?: boolean;
  bullets: string[];
}

export interface CvExperience {
  label: string;
  jobs: Job[];
}

export interface SkillBar {
  name: string;
  tag: string;
  pct: number;
}

export interface Skill {
  text: string;
  primary?: boolean;
}

export interface SkillGroup {
  label: string;
  skills: Skill[];
}

export interface ExpertiseSection {
  type: 'expertise';
  label: string;
  bars?: SkillBar[];
  skillGroups?: SkillGroup[];
}

export interface CertItem {
  name: string;
  meta: string;
  verifyUrl?: string;
  dot?: 'default' | 'gold';
  badge?: string;
}

export interface CertListSection {
  type: 'certifications' | 'training';
  label: string;
  inProgressNote?: string;
  items: CertItem[];
}

export interface EduItem {
  degree: string;
  spec?: string;
  school: string;
  dateRange: string;
}

export interface EducationSection {
  type: 'education';
  label: string;
  items: EduItem[];
}

export interface LanguageItem {
  name: string;
  level: string;
  pct: number;
}

export interface LanguagesSection {
  type: 'languages';
  label: string;
  items: LanguageItem[];
}

export interface ProfileItem {
  icon: string;
  text: string;
  href: string;
}

export interface ProfilesSection {
  type: 'profiles';
  label: string;
  items: ProfileItem[];
}

export interface TextSection {
  type: 'text';
  label: string;
  content: string;
}

export type SidebarSection =
  | ExpertiseSection
  | CertListSection
  | EducationSection
  | LanguagesSection
  | ProfilesSection
  | TextSection;

export interface CertGalleryItem {
  title: string;
  issuer: string;
  date: string;
  file: string;
  icon: string;
  type?: 'anthropic' | 'sitecore' | 'scrum';
  badge?: string;
}

export interface CertGallery {
  label: string;
  certs: CertGalleryItem[];
}

export interface ShareBarDivider {
  type: 'divider';
}

export interface ShareBarButton {
  type: 'print' | 'copy' | 'link';
  icon: string;
  label: string;
  href?: string;
}

export type ShareBarItem = ShareBarDivider | ShareBarButton;

export interface CvData {
  meta: CvMeta;
  profile: CvProfile;
  summary: CvSummary;
  experience: CvExperience;
  sidebar: SidebarSection[];
  certGallery?: CertGallery;
  shareBar?: ShareBarItem[];
}
