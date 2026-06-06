import { Code2, Sparkles, Wrench, Languages } from 'lucide-react';

export const skillCategories = [
  { id: 'technical', label: 'Technical', icon: Code2 },
  { id: 'soft', label: 'Soft Skills', icon: Sparkles },
  { id: 'tool', label: 'Tools', icon: Wrench },
  { id: 'language', label: 'Languages', icon: Languages },
];

export const emptyProjectForm = {
  title: '',
  description: '',
  techStack: '',
  githubUrl: '',
  liveUrl: '',
  imageUrl: '',
  startDate: '',
  endDate: '',
  isFeatured: false,
};

export const emptySkillForm = {
  name: '',
  level: 50,
  category: 'technical',
};
