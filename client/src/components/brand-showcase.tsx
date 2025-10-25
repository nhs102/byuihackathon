import { ArrowLeft, Palette, Type, Layout, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface BrandShowcaseProps {
  onBack: () => void;
}

export function BrandShowcase({ onBack }: BrandShowcaseProps) {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#2a3748] px-6 py-6 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-white" style={{ fontFamily: 'var(--font-headline)' }}>IMPRINT Brand Guide</h2>
            <p className="text-white/60 text-sm" style={{ fontFamily: 'var(--font-body)' }}>Design System Overview</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 pb-20 max-w-2xl mx-auto space-y-6">
        {/* Colors Section */}
        <Card className="p-6 bg-white shadow-md border-0" style={{ boxShadow: 'var(--card-shadow)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1a2332] to-[#2a3748] rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-headline)', color: 'var(--navy-primary)' }}>Color Palette</h3>
          </div>
          
          <div className="space-y-4">
            {/* Primary Color */}
            <div>
              <p className="text-sm text-[#6b7280] mb-2" style={{ fontFamily: 'var(--font-body)' }}>Primary - Deep Navy</p>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-[#1a2332] rounded-xl shadow-md border border-gray-200"></div>
                <div>
                  <code className="text-sm bg-[#f0f1f3] px-3 py-1 rounded-lg" style={{ fontFamily: 'monospace' }}>
                    #1a2332
                  </code>
                  <p className="text-xs text-[#6b7280] mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                    Backgrounds, headers, text
                  </p>
                </div>
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <p className="text-sm text-[#6b7280] mb-2" style={{ fontFamily: 'var(--font-body)' }}>Accent - Gold</p>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-[#f9a826] rounded-xl shadow-md border border-gray-200"></div>
                <div>
                  <code className="text-sm bg-[#f0f1f3] px-3 py-1 rounded-lg" style={{ fontFamily: 'monospace' }}>
                    #f9a826
                  </code>
                  <p className="text-xs text-[#6b7280] mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                    Success, achievements, CTAs
                  </p>
                </div>
              </div>
            </div>

            {/* Background Colors */}
            <div>
              <p className="text-sm text-[#6b7280] mb-2" style={{ fontFamily: 'var(--font-body)' }}>Background Colors</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="w-full h-12 bg-white rounded-lg shadow-sm border border-gray-200"></div>
                  <code className="text-xs mt-1 block text-center" style={{ fontFamily: 'monospace' }}>#ffffff</code>
                </div>
                <div className="flex-1">
                  <div className="w-full h-12 bg-[#f8f9fa] rounded-lg shadow-sm border border-gray-200"></div>
                  <code className="text-xs mt-1 block text-center" style={{ fontFamily: 'monospace' }}>#f8f9fa</code>
                </div>
                <div className="flex-1">
                  <div className="w-full h-12 bg-[#f0f1f3] rounded-lg shadow-sm border border-gray-200"></div>
                  <code className="text-xs mt-1 block text-center" style={{ fontFamily: 'monospace' }}>#f0f1f3</code>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Typography Section */}
        <Card className="p-6 bg-white shadow-md border-0" style={{ boxShadow: 'var(--card-shadow)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-[#f9a826] to-[#f7931e] rounded-xl flex items-center justify-center">
              <Type className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-headline)', color: 'var(--navy-primary)' }}>Typography</h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <p className="text-sm text-[#6b7280] mb-2" style={{ fontFamily: 'var(--font-body)' }}>Headlines - Poppins</p>
              <h1 className="text-3xl" style={{ fontFamily: 'var(--font-headline)', fontWeight: 'var(--font-weight-bold)', color: 'var(--navy-primary)' }}>
                Bold & Impactful
              </h1>
              <p className="text-xs text-[#6b7280] mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                Weights: 500, 600, 700, 800
              </p>
            </div>
            
            <div>
              <p className="text-sm text-[#6b7280] mb-2" style={{ fontFamily: 'var(--font-body)' }}>Body - Inter</p>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--navy-primary)' }}>
                Clean, readable text for all body content and UI elements. Optimized for screen readability.
              </p>
              <p className="text-xs text-[#6b7280] mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                Weights: 300, 400, 500, 600
              </p>
            </div>
          </div>
        </Card>

        {/* UI Components Section */}
        <Card className="p-6 bg-white shadow-md border-0" style={{ boxShadow: 'var(--card-shadow)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2a3748] to-[#1a2332] rounded-xl flex items-center justify-center">
              <Layout className="w-5 h-5 text-[#f9a826]" strokeWidth={2} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-headline)', color: 'var(--navy-primary)' }}>UI Elements</h3>
          </div>
          
          <div className="space-y-4">
            {/* Buttons */}
            <div>
              <p className="text-sm text-[#6b7280] mb-3" style={{ fontFamily: 'var(--font-body)' }}>Buttons</p>
              <div className="flex flex-wrap gap-2">
                <Button className="bg-[#1a2332] text-white hover:bg-[#2a3748] rounded-xl">
                  Primary
                </Button>
                <Button className="bg-gradient-to-r from-[#f9a826] to-[#f7931e] text-[#1a2332] hover:from-[#f7931e] hover:to-[#f9a826] rounded-xl">
                  Accent
                </Button>
                <Button variant="outline" className="border-[#1a2332] text-[#1a2332] rounded-xl">
                  Secondary
                </Button>
              </div>
            </div>

            {/* Badges */}
            <div>
              <p className="text-sm text-[#6b7280] mb-3" style={{ fontFamily: 'var(--font-body)' }}>Badges</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-[#f9a826] text-white hover:bg-[#f7931e] rounded-lg">
                  Achievement
                </Badge>
                <Badge variant="secondary" className="bg-[#f0f1f3] text-[#1a2332] rounded-lg">
                  In Progress
                </Badge>
                <Badge variant="outline" className="border-[#f9a826] text-[#f9a826] rounded-lg">
                  Milestone
                </Badge>
              </div>
            </div>

            {/* Cards */}
            <div>
              <p className="text-sm text-[#6b7280] mb-3" style={{ fontFamily: 'var(--font-body)' }}>Card Example</p>
              <Card className="p-4 bg-gradient-to-br from-[#1a2332] to-[#2a3748] border-0 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#f9a826] to-[#f7931e] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white mb-1" style={{ fontFamily: 'var(--font-headline)' }}>Premium Cards</h4>
                    <p className="text-white/70 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
                      Smooth gradients with subtle shadows
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        {/* Design Principles */}
        <Card className="p-6 bg-gradient-to-br from-[#f9a826] to-[#f7931e] border-0 shadow-lg">
          <h3 className="text-white mb-4" style={{ fontFamily: 'var(--font-headline)' }}>Design Principles</h3>
          <ul className="space-y-2">
            {[
              'Clean, minimalist interface with premium feel',
              'Subtle shadows and smooth gradients',
              'Card-based layouts for content organization',
              'Line-style icons with consistent stroke width',
              'Motivational visual elements throughout',
              'Mobile-first, responsive design'
            ].map((principle, index) => (
              <li key={index} className="flex items-start gap-2 text-white/90" style={{ fontFamily: 'var(--font-body)' }}>
                <span className="text-white mt-1">•</span>
                <span className="text-sm">{principle}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
