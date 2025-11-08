import { Clapperboard } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative border-b bg-gradient-to-br from-background via-background to-accent/20">
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="film-strip" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="60" height="40" fill="none" stroke="currentColor" strokeWidth="1"/>
              <circle cx="5" cy="5" r="2" fill="currentColor"/>
              <circle cx="55" cy="5" r="2" fill="currentColor"/>
              <circle cx="5" cy="35" r="2" fill="currentColor"/>
              <circle cx="55" cy="35" r="2" fill="currentColor"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#film-strip)" />
        </svg>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Clapperboard className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold">
              Sora Prompt Builder
            </h1>
          </div>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
            Craft perfect video prompts with AI-powered enhancements. Select cinematic options and watch as AI intelligently merges them while preserving your creative vision.
          </p>
        </div>
      </div>
    </div>
  );
}
