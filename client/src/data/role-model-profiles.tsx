import { Briefcase, Dumbbell, BookOpen, Users, Moon, Coffee, Zap, Brain, Heart } from 'lucide-react';
import { RoleModelProfileData } from '../components/role-model-profile';
import { RoleModel } from '../components/role-model-card';

const iconSize = 16;
const iconStroke = 2;

export function getRoleModelProfile(roleModel: RoleModel): RoleModelProfileData {
  const profiles: Record<string, Omit<RoleModelProfileData, 'roleModel'>> = {
    '1': { // Elon Musk
      title: 'CEO of Tesla & SpaceX',
      values: ['Innovation', 'Risk-Taking', 'Long-term Thinking', 'Relentless Work Ethic'],
      philosophy: 'Elon Musk believes in solving humanity\'s biggest problems through technology and innovation. His philosophy centers on taking calculated risks, thinking from first principles, and working relentlessly toward ambitious goals. He emphasizes the importance of learning continuously, questioning assumptions, and never settling for incremental improvements when revolutionary changes are possible. His approach combines deep technical knowledge with bold vision and unwavering determination.',
      timeAllocation: [
        { 
          name: 'Work/Deep Focus', 
          value: 50, 
          color: '#3b82f6',
          icon: <Briefcase size={iconSize} strokeWidth={iconStroke} />
        },
        { 
          name: 'Exercise/Health', 
          value: 5, 
          color: '#10b981',
          icon: <Dumbbell size={iconSize} strokeWidth={iconStroke} />
        },
        { 
          name: 'Learning/Reading', 
          value: 10, 
          color: '#8b5cf6',
          icon: <BookOpen size={iconSize} strokeWidth={iconStroke} />
        },
        { 
          name: 'Family/Relationships', 
          value: 10, 
          color: '#f59e0b',
          icon: <Users size={iconSize} strokeWidth={iconStroke} />
        },
        { 
          name: 'Sleep/Rest', 
          value: 25, 
          color: '#1a2332',
          icon: <Moon size={iconSize} strokeWidth={iconStroke} />
        },
      ],
      schedule: [
        { time: '7:00 AM', activity: 'Wake up & critical emails', icon: <Coffee size={iconSize} strokeWidth={iconStroke} /> },
        { time: '8:00 AM', activity: 'Breakfast with family', icon: <Users size={iconSize} strokeWidth={iconStroke} /> },
        { time: '9:00 AM', activity: 'Tesla engineering review', icon: <Briefcase size={iconSize} strokeWidth={iconStroke} /> },
        { time: '12:00 PM', activity: 'Working lunch meetings', icon: <Briefcase size={iconSize} strokeWidth={iconStroke} /> },
        { time: '1:00 PM', activity: 'SpaceX development review', icon: <Briefcase size={iconSize} strokeWidth={iconStroke} /> },
        { time: '3:00 PM', activity: 'Design & engineering work', icon: <Brain size={iconSize} strokeWidth={iconStroke} /> },
        { time: '6:00 PM', activity: 'Quick workout', icon: <Dumbbell size={iconSize} strokeWidth={iconStroke} /> },
        { time: '7:00 PM', activity: 'Dinner & family time', icon: <Users size={iconSize} strokeWidth={iconStroke} /> },
        { time: '9:00 PM', activity: 'Evening work session', icon: <Briefcase size={iconSize} strokeWidth={iconStroke} /> },
        { time: '1:00 AM', activity: 'Sleep', icon: <Moon size={iconSize} strokeWidth={iconStroke} /> },
      ]
    },
    '2': { // Russell M. Nelson
      title: 'Religious Leader & Former Cardiac Surgeon',
      values: ['Faith', 'Service', 'Compassion', 'Lifelong Learning'],
      philosophy: 'Russell M. Nelson combines decades of medical excellence with spiritual leadership. His philosophy emphasizes the importance of faith, continuous learning, and selfless service to others. As both a pioneering heart surgeon and religious leader, he believes in the power of compassion, the value of scientific knowledge paired with spiritual wisdom, and the importance of family relationships. Nelson advocates for personal growth through discipline, dedication to helping others, and maintaining hope and joy regardless of circumstances.',
      timeAllocation: [
        { 
          name: 'Work/Deep Focus', 
          value: 35, 
          color: '#3b82f6',
          icon: <Briefcase size={iconSize} strokeWidth={iconStroke} />
        },
        { 
          name: 'Exercise/Health', 
          value: 8, 
          color: '#10b981',
          icon: <Dumbbell size={iconSize} strokeWidth={iconStroke} />
        },
        { 
          name: 'Learning/Reading', 
          value: 15, 
          color: '#8b5cf6',
          icon: <BookOpen size={iconSize} strokeWidth={iconStroke} />
        },
        { 
          name: 'Family/Relationships', 
          value: 12, 
          color: '#f59e0b',
          icon: <Users size={iconSize} strokeWidth={iconStroke} />
        },
        { 
          name: 'Sleep/Rest', 
          value: 30, 
          color: '#1a2332',
          icon: <Moon size={iconSize} strokeWidth={iconStroke} />
        },
      ],
      schedule: [
        { time: '5:30 AM', activity: 'Wake up & meditation', icon: <Heart size={iconSize} strokeWidth={iconStroke} /> },
        { time: '6:30 AM', activity: 'Study & reading', icon: <BookOpen size={iconSize} strokeWidth={iconStroke} /> },
        { time: '7:30 AM', activity: 'Breakfast with family', icon: <Users size={iconSize} strokeWidth={iconStroke} /> },
        { time: '9:00 AM', activity: 'Leadership meetings', icon: <Briefcase size={iconSize} strokeWidth={iconStroke} /> },
        { time: '12:00 PM', activity: 'Lunch & review', icon: <Coffee size={iconSize} strokeWidth={iconStroke} /> },
        { time: '1:00 PM', activity: 'Service & counseling', icon: <Heart size={iconSize} strokeWidth={iconStroke} /> },
        { time: '3:00 PM', activity: 'Writing & preparation', icon: <BookOpen size={iconSize} strokeWidth={iconStroke} /> },
        { time: '5:00 PM', activity: 'Exercise walk', icon: <Dumbbell size={iconSize} strokeWidth={iconStroke} /> },
        { time: '6:00 PM', activity: 'Family dinner', icon: <Users size={iconSize} strokeWidth={iconStroke} /> },
        { time: '8:00 PM', activity: 'Study & reflection', icon: <BookOpen size={iconSize} strokeWidth={iconStroke} /> },
        { time: '10:00 PM', activity: 'Sleep', icon: <Moon size={iconSize} strokeWidth={iconStroke} /> },
      ]
    },
    '3': { // Michael Jordan
      title: 'NBA Legend & Business Mogul',
      values: ['Excellence', 'Competitiveness', 'Discipline', 'Never Give Up'],
      philosophy: 'Michael Jordan\'s philosophy is built on relentless pursuit of excellence and an unmatched competitive drive. He believes that talent is just the starting point—true greatness comes from discipline, practice, and the willingness to fail and learn. Jordan emphasizes mental toughness, preparation, and the importance of raising the performance of those around you. His approach combines intense focus, systematic preparation, and the courage to take decisive action in critical moments.',
      timeAllocation: [
        { 
          name: 'Work/Deep Focus', 
          value: 30, 
          color: '#3b82f6',
          icon: <Briefcase size={iconSize} strokeWidth={iconStroke} />
        },
        { 
          name: 'Exercise/Health', 
          value: 20, 
          color: '#10b981',
          icon: <Dumbbell size={iconSize} strokeWidth={iconStroke} />
        },
        { 
          name: 'Learning/Reading', 
          value: 8, 
          color: '#8b5cf6',
          icon: <BookOpen size={iconSize} strokeWidth={iconStroke} />
        },
        { 
          name: 'Family/Relationships', 
          value: 12, 
          color: '#f59e0b',
          icon: <Users size={iconSize} strokeWidth={iconStroke} />
        },
        { 
          name: 'Sleep/Rest', 
          value: 30, 
          color: '#1a2332',
          icon: <Moon size={iconSize} strokeWidth={iconStroke} />
        },
      ],
      schedule: [
        { time: '5:00 AM', activity: 'Wake up & morning workout', icon: <Dumbbell size={iconSize} strokeWidth={iconStroke} /> },
        { time: '7:00 AM', activity: 'Breakfast & recovery', icon: <Coffee size={iconSize} strokeWidth={iconStroke} /> },
        { time: '8:00 AM', activity: 'Business meetings', icon: <Briefcase size={iconSize} strokeWidth={iconStroke} /> },
        { time: '10:00 AM', activity: 'Brand management', icon: <Briefcase size={iconSize} strokeWidth={iconStroke} /> },
        { time: '12:00 PM', activity: 'Lunch & film study', icon: <Brain size={iconSize} strokeWidth={iconStroke} /> },
        { time: '1:00 PM', activity: 'Skills training', icon: <Dumbbell size={iconSize} strokeWidth={iconStroke} /> },
        { time: '3:00 PM', activity: 'Team practice', icon: <Dumbbell size={iconSize} strokeWidth={iconStroke} /> },
        { time: '5:00 PM', activity: 'Strength training', icon: <Dumbbell size={iconSize} strokeWidth={iconStroke} /> },
        { time: '7:00 PM', activity: 'Family time & dinner', icon: <Users size={iconSize} strokeWidth={iconStroke} /> },
        { time: '9:00 PM', activity: 'Mental preparation', icon: <Brain size={iconSize} strokeWidth={iconStroke} /> },
        { time: '11:00 PM', activity: 'Sleep', icon: <Moon size={iconSize} strokeWidth={iconStroke} /> },
      ]
    },
    '4': { // Donald Trump
      title: 'Businessman & Former US President',
      values: ['Deal-Making', 'Brand Building', 'Negotiation', 'Confidence'],
      philosophy: 'Donald Trump\'s approach to business and life centers on bold deal-making, strategic negotiation, and powerful branding. He believes in projecting strength and confidence, thinking big, and never backing down from challenges. His philosophy emphasizes the importance of reputation, media presence, and positioning yourself advantageously in every situation. Trump advocates for aggressive pursuit of goals, leveraging relationships, and turning setbacks into comebacks through persistence and strategic thinking.',
      timeAllocation: [
        { 
          name: 'Work/Deep Focus', 
          value: 40, 
          color: '#3b82f6',
          icon: <Briefcase size={iconSize} strokeWidth={iconStroke} />
        },
        { 
          name: 'Exercise/Health', 
          value: 5, 
          color: '#10b981',
          icon: <Dumbbell size={iconSize} strokeWidth={iconStroke} />
        },
        { 
          name: 'Learning/Reading', 
          value: 10, 
          color: '#8b5cf6',
          icon: <BookOpen size={iconSize} strokeWidth={iconStroke} />
        },
        { 
          name: 'Family/Relationships', 
          value: 15, 
          color: '#f59e0b',
          icon: <Users size={iconSize} strokeWidth={iconStroke} />
        },
        { 
          name: 'Sleep/Rest', 
          value: 30, 
          color: '#1a2332',
          icon: <Moon size={iconSize} strokeWidth={iconStroke} />
        },
      ],
      schedule: [
        { time: '5:00 AM', activity: 'Wake up & news review', icon: <Coffee size={iconSize} strokeWidth={iconStroke} /> },
        { time: '6:00 AM', activity: 'Phone calls & emails', icon: <Briefcase size={iconSize} strokeWidth={iconStroke} /> },
        { time: '8:00 AM', activity: 'Business meetings', icon: <Briefcase size={iconSize} strokeWidth={iconStroke} /> },
        { time: '10:00 AM', activity: 'Deal negotiations', icon: <Briefcase size={iconSize} strokeWidth={iconStroke} /> },
        { time: '12:00 PM', activity: 'Working lunch', icon: <Briefcase size={iconSize} strokeWidth={iconStroke} /> },
        { time: '2:00 PM', activity: 'Property inspections', icon: <Briefcase size={iconSize} strokeWidth={iconStroke} /> },
        { time: '4:00 PM', activity: 'Media & public relations', icon: <Briefcase size={iconSize} strokeWidth={iconStroke} /> },
        { time: '6:00 PM', activity: 'Golf / Networking', icon: <Dumbbell size={iconSize} strokeWidth={iconStroke} /> },
        { time: '8:00 PM', activity: 'Family dinner', icon: <Users size={iconSize} strokeWidth={iconStroke} /> },
        { time: '10:00 PM', activity: 'Reading & preparation', icon: <BookOpen size={iconSize} strokeWidth={iconStroke} /> },
        { time: '12:00 AM', activity: 'Sleep', icon: <Moon size={iconSize} strokeWidth={iconStroke} /> },
      ]
    },
  };

  return {
    roleModel,
    ...profiles[roleModel.id]
  };
}
