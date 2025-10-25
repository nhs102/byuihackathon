import { Star, Play } from 'lucide-react';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

export interface RoleModel {
  id: string;
  name: string;
  quote: string;
  imageUrl: string;
  accentColor: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  isInProgress?: boolean;
}

interface RoleModelCardProps {
  roleModel: RoleModel;
  onClick: (roleModel: RoleModel) => void;
  isDisabled?: boolean;
  onDisabledClick?: () => void;
}

export function RoleModelCard({ roleModel, onClick, isDisabled, onDisabledClick }: RoleModelCardProps) {
  const handleClick = () => {
    if (isDisabled) {
      if (onDisabledClick) {
        onDisabledClick();
      }
    } else {
      onClick(roleModel);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative group transition-all duration-300 ${
        isDisabled 
          ? 'cursor-not-allowed opacity-50' 
          : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
      }`}
      style={{ width: '340px', height: '420px' }}
    >
      {/* Badge */}
      {roleModel.isInProgress ? (
        <Badge 
          className="absolute top-4 right-4 z-10 bg-gradient-to-r from-[#10b981] to-[#059669] text-white border-0 shadow-lg animate-pulse"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <Play className="w-3 h-3 mr-1" fill="currentColor" strokeWidth={0} />
          In Progress
        </Badge>
      ) : (roleModel.isFeatured || roleModel.isPopular) && (
        <Badge 
          className="absolute top-4 right-4 z-10 bg-gradient-to-r from-[#f9a826] to-[#f7931e] text-white border-0 shadow-lg"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <Star className="w-3 h-3 mr-1" fill="currentColor" strokeWidth={0} />
          {roleModel.isFeatured ? 'Featured' : 'Popular'}
        </Badge>
      )}

      {/* Card */}
      <div 
        className={`relative w-full h-full rounded-3xl overflow-hidden shadow-lg transition-shadow duration-300 ${
          isDisabled ? '' : 'group-hover:shadow-2xl'
        }`}
        style={{
          background: `linear-gradient(135deg, ${roleModel.accentColor}15 0%, ${roleModel.accentColor}05 100%)`,
        }}
      >
        {/* Glow Effect */}
        <div 
          className={`absolute inset-0 opacity-0 transition-opacity duration-300 blur-xl ${
            isDisabled ? '' : 'group-hover:opacity-20'
          }`}
          style={{
            background: `radial-gradient(circle at center, ${roleModel.accentColor} 0%, transparent 70%)`,
          }}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col p-6">
          {/* Photo Section */}
          <div className="flex justify-center mb-5">
            <div 
              className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white/50"
              style={{
                boxShadow: `0 8px 24px ${roleModel.accentColor}30`,
              }}
            >
              <ImageWithFallback
                src={roleModel.imageUrl}
                alt={roleModel.name}
                className="w-full h-full object-cover"
              />
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
              />
            </div>
          </div>

          {/* Name */}
          <h3 
            className="text-center mb-4 text-[#1a2332]"
            style={{ 
              fontFamily: 'var(--font-headline)',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: '1.5rem',
              lineHeight: '1.3'
            }}
          >
            {roleModel.name}
          </h3>

          {/* Quote */}
          <div className="flex-1 flex items-center justify-center px-2">
            <blockquote className="text-center">
              <p 
                className="text-[#1a2332]/80 italic relative"
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.95rem',
                  lineHeight: '1.5'
                }}
              >
                <span className="text-2xl absolute -left-2 -top-2 opacity-30" style={{ fontFamily: 'Georgia, serif' }}>"</span>
                {roleModel.quote}
                <span className="text-2xl absolute -right-2 -bottom-2 opacity-30" style={{ fontFamily: 'Georgia, serif' }}>"</span>
              </p>
            </blockquote>
          </div>

          {/* Bottom Accent Line */}
          <div 
            className="h-1 rounded-full mt-4 transform group-hover:scale-x-110 transition-transform duration-300"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${roleModel.accentColor} 50%, transparent 100%)`,
            }}
          />
        </div>

        {/* Card Border Glow on Hover */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 0 2px ${roleModel.accentColor}40`,
          }}
        />
        
        {/* Disabled Overlay - placed at the end to be on top */}
        {isDisabled && (
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-30 flex items-center justify-center rounded-3xl">
            <div className="bg-white px-6 py-4 rounded-2xl shadow-2xl">
              <p 
                className="text-[#1a2332] text-center font-semibold"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem'
                }}
              >
                Finish current challenge first
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
