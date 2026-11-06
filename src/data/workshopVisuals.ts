import { Workshop } from '../types/asako';

const workshopVisuals: Record<Workshop['category'], { image: string; alt: string }> = {
  'Tech & Architecture': {
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    alt: 'Laptop and workspace for software development',
  },
  'Design Systems': {
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=80',
    alt: 'Creative design workspace with visual interface concepts',
  },
  'Business Innovation': {
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80',
    alt: 'Team collaborating on a business project',
  },
  'AI Engineering': {
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    alt: 'Artificial intelligence concept visual',
  },
  'Career Growth': {
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    alt: 'Online learning and professional development',
  },
};

export function getWorkshopVisual(category: Workshop['category']) {
  return workshopVisuals[category];
}
