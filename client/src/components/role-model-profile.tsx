import { ArrowLeft, Heart, Target, Lightbulb, Zap, Briefcase, Dumbbell, BookOpen, Users, Moon, Coffee } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RoleModel } from './role-model-card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

export interface RoleModelProfileData {
  roleModel: RoleModel;
  title: string;
  values: string[];
  philosophy: string;
  timeAllocation: Array<{
    name: string;
    value: number;
    color: string;
    icon: React.ReactNode;
  }>;
  schedule: Array<{
    time: string;
    activity: string;
    icon: React.ReactNode;
  }>;
}

interface RoleModelProfileProps {
  profileData: RoleModelProfileData;
  onBack: () => void;
  onContinue: () => void;
}

export function RoleModelProfile({ profileData, onBack, onContinue }: RoleModelProfileProps) {
  const { roleModel, title, values, philosophy, timeAllocation, schedule } = profileData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-[#e8eaed]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-[#1a2332] to-[#2a3748] shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="px-6 pb-6 flex flex-col items-center">
          <div 
            className="w-28 h-28 rounded-full overflow-hidden shadow-2xl ring-4 ring-white/30 mb-4"
            style={{
              boxShadow: `0 8px 32px ${roleModel.accentColor}40`,
            }}
          >
            <ImageWithFallback
              src={roleModel.imageUrl}
              alt={roleModel.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 
            className="text-white text-center mb-1"
            style={{ 
              fontFamily: 'var(--font-headline)',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: '1.75rem'
            }}
          >
            {roleModel.name}
          </h1>
          
          <p 
            className="text-white/70 text-center"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem'
            }}
          >
            {title}
          </p>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="px-6 py-6 space-y-6 pb-32">
          {/* Values & Philosophy */}
          <Card className="p-6 bg-white shadow-md border-0" style={{ boxShadow: 'var(--card-shadow)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${roleModel.accentColor}20` }}
              >
                <Heart className="w-5 h-5" style={{ color: roleModel.accentColor }} strokeWidth={2} />
              </div>
              <h3 
                className="text-[#1a2332]"
                style={{ 
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 'var(--font-weight-semibold)',
                  fontSize: '1.25rem'
                }}
              >
                Values & Philosophy
              </h3>
            </div>

            {/* Values Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {values.map((value, index) => (
                <Badge
                  key={index}
                  className="px-4 py-2 rounded-full border-0"
                  style={{
                    background: `${roleModel.accentColor}15`,
                    color: roleModel.accentColor,
                    fontFamily: 'var(--font-body)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  {value}
                </Badge>
              ))}
            </div>

            {/* Philosophy Text */}
            <p 
              className="text-[#1a2332]/80 leading-relaxed"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                lineHeight: '1.7'
              }}
            >
              {philosophy}
            </p>
          </Card>

          {/* Daily Time Allocation */}
          <Card className="p-6 bg-white shadow-md border-0" style={{ boxShadow: 'var(--card-shadow)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${roleModel.accentColor}20` }}
              >
                <Target className="w-5 h-5" style={{ color: roleModel.accentColor }} strokeWidth={2} />
              </div>
              <h3 
                className="text-[#1a2332]"
                style={{ 
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 'var(--font-weight-semibold)',
                  fontSize: '1.25rem'
                }}
              >
                Daily Time Allocation
              </h3>
            </div>

            {/* Pie Chart */}
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={timeAllocation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${value}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {timeAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              {timeAllocation.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${item.color}20` }}
                    >
                      <div style={{ color: item.color }}>{item.icon}</div>
                    </div>
                    <span 
                      className="text-[#1a2332]"
                      style={{ 
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9rem'
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span 
                    className="font-medium"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: item.color,
                      fontWeight: 'var(--font-weight-semibold)'
                    }}
                  >
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Typical Day Schedule */}
          <Card className="p-6 bg-white shadow-md border-0" style={{ boxShadow: 'var(--card-shadow)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${roleModel.accentColor}20` }}
              >
                <Lightbulb className="w-5 h-5" style={{ color: roleModel.accentColor }} strokeWidth={2} />
              </div>
              <h3 
                className="text-[#1a2332]"
                style={{ 
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 'var(--font-weight-semibold)',
                  fontSize: '1.25rem'
                }}
              >
                Typical Day Schedule
              </h3>
            </div>

            {/* Schedule Table */}
            <div className="space-y-0">
              {schedule.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 py-3 px-4 rounded-lg"
                  style={{
                    background: index % 2 === 0 ? '#f8f9fa' : 'transparent'
                  }}
                >
                  <div 
                    className="text-[#6b7280] min-w-[100px] text-sm"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    {item.time}
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="text-[#1a2332]/60">
                      {item.icon}
                    </div>
                    <span 
                      className="text-[#1a2332]"
                      style={{ 
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.95rem'
                      }}
                    >
                      {item.activity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </ScrollArea>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
        <Button
          onClick={onContinue}
          className="w-full py-7 rounded-2xl shadow-xl relative overflow-hidden group"
          style={{
            background: `linear-gradient(135deg, ${roleModel.accentColor} 0%, #f7931e 100%)`,
            fontFamily: 'var(--font-body)',
            fontWeight: 'var(--font-weight-semibold)',
            fontSize: '1.1rem'
          }}
        >
          <span className="relative z-10 text-white flex items-center justify-center gap-2">
            Live Like {roleModel.name.split(' ')[0]}?
            <Zap className="w-5 h-5" fill="currentColor" strokeWidth={0} />
          </span>
          
          {/* Pulse Animation */}
          <div 
            className="absolute inset-0 rounded-2xl animate-pulse-slow"
            style={{
              background: `linear-gradient(135deg, ${roleModel.accentColor} 0%, #f7931e 100%)`,
              opacity: 0.5,
            }}
          />
        </Button>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.02);
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
