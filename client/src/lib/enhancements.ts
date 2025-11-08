import type { Enhancement } from "@/components/EnhancementCard";
import type { CategoryId } from "@/components/CategoryTabs";

// Preset definitions for simple mode
export interface Preset {
  id: string;
  name: string;
  description: string;
  enhancements: Array<{
    title: string;
    description: string;
    category: CategoryId;
  }>;
}

export const PRESETS: Preset[] = [
  {
    id: "cinematic-drama",
    name: "Cinematic Drama",
    description: "Professional dramatic look with depth and atmosphere",
    enhancements: [
      { title: "Low Angle Shot", description: "Camera below subject emphasizing power and drama", category: "camera-angles" },
      { title: "Hard Side Light", description: "Strong directional lighting with dramatic shadows", category: "lighting" },
      { title: "Cinematic Anamorphic", description: "Widescreen with characteristic lens flares", category: "style" },
      { title: "Shallow Focus", description: "Subject sharp, background beautifully blurred", category: "depth-of-field" },
    ]
  },
  {
    id: "dreamy-atmosphere",
    name: "Dreamy Atmosphere",
    description: "Soft, ethereal mood with gentle motion",
    enhancements: [
      { title: "Soft Diffused Light", description: "Even, wraparound lighting with minimal shadows", category: "lighting" },
      { title: "Golden Hour Glow", description: "Warm sunrise or sunset natural light", category: "time-of-day" },
      { title: "Slow Dolly Movement", description: "Gentle forward camera motion", category: "camera-motion" },
      { title: "Pastel Color Palette", description: "Soft pinks, lavenders, mint greens", category: "color-palette" },
    ]
  },
  {
    id: "action-energy",
    name: "Action & Energy",
    description: "Dynamic movement with bold visual impact",
    enhancements: [
      { title: "Handheld Camera", description: "Natural shake for documentary energy", category: "camera-motion" },
      { title: "High Contrast", description: "Bold shadows and highlights", category: "lighting" },
      { title: "Quick Timing", description: "Fast-paced action under 2 seconds", category: "motion-timing" },
      { title: "Wide Establishing Shot", description: "Full scene context with action", category: "camera-angles" },
    ]
  },
  {
    id: "documentary-realism",
    name: "Documentary Realism",
    description: "Authentic, natural look with minimal stylization",
    enhancements: [
      { title: "Natural Lighting", description: "Soft ambient light without artificial sources", category: "lighting" },
      { title: "Medium Shot Framing", description: "Balanced subject and environment", category: "camera-angles" },
      { title: "16mm Documentary Style", description: "Raw, authentic with natural grain", category: "style" },
      { title: "Deep Focus", description: "Everything sharp from foreground to background", category: "depth-of-field" },
    ]
  },
];

export const ENHANCEMENTS: Record<CategoryId, Enhancement[]> = {
  "camera-angles": [
    { id: "ca-1", title: "Wide Establishing Shot", description: "Eye-level wide angle capturing the full scene context", category: "camera-angles" },
    { id: "ca-2", title: "Dutch Angle", description: "Tilted camera creating dynamic tension and unease", category: "camera-angles" },
    { id: "ca-3", title: "Bird's Eye View", description: "Overhead shot looking directly down on the subject", category: "camera-angles" },
    { id: "ca-4", title: "Low Angle", description: "Camera positioned below subject looking up, emphasizing power", category: "camera-angles" },
    { id: "ca-5", title: "Over-the-Shoulder", description: "Framed from behind one subject viewing another", category: "camera-angles" },
    { id: "ca-6", title: "Close-Up", description: "Tight framing on subject's face or detail, intimate and emotional", category: "camera-angles" },
    { id: "ca-7", title: "Extreme Close-Up", description: "Very tight shot on specific detail like eyes or hands", category: "camera-angles" },
    { id: "ca-8", title: "Medium Shot", description: "Waist-up framing balancing subject and environment", category: "camera-angles" },
  ],
  "camera-motion": [
    { id: "cm-1", title: "Slow Dolly In", description: "Smooth forward camera movement creating intimacy", category: "camera-motion" },
    { id: "cm-2", title: "Tracking Shot", description: "Camera following subject's lateral movement fluidly", category: "camera-motion" },
    { id: "cm-3", title: "Handheld", description: "Natural camera shake for documentary realism and energy", category: "camera-motion" },
    { id: "cm-4", title: "Crane Shot", description: "Sweeping vertical or arcing movement for grandeur", category: "camera-motion" },
    { id: "cm-5", title: "Slow Pan", description: "Horizontal rotation revealing the environment gradually", category: "camera-motion" },
    { id: "cm-6", title: "Tilt Up/Down", description: "Vertical rotation from ground to sky or vice versa", category: "camera-motion" },
    { id: "cm-7", title: "Steadicam Glide", description: "Smooth floating movement through space", category: "camera-motion" },
    { id: "cm-8", title: "Static/Locked", description: "Fixed camera position allowing action to unfold", category: "camera-motion" },
  ],
  "lighting": [
    { id: "l-1", title: "Golden Hour", description: "Warm, soft natural light during sunrise or sunset", category: "lighting" },
    { id: "l-2", title: "Hard Side Light", description: "Strong directional light creating dramatic shadows", category: "lighting" },
    { id: "l-3", title: "Soft Diffused", description: "Even, wraparound lighting with minimal shadows", category: "lighting" },
    { id: "l-4", title: "Backlighting", description: "Light from behind subject creating silhouette or rim light", category: "lighting" },
    { id: "l-5", title: "Volumetric Rays", description: "Visible light beams cutting through atmosphere or fog", category: "lighting" },
    { id: "l-6", title: "Neon Glow", description: "Colorful artificial lighting with electric atmosphere", category: "lighting" },
    { id: "l-7", title: "Candlelit Ambience", description: "Warm, flickering practical light sources", category: "lighting" },
    { id: "l-8", title: "Blue Hour", description: "Cool twilight tones with deep blue sky", category: "lighting" },
  ],
  "style": [
    { id: "s-1", title: "Cinematic Anamorphic", description: "2.39:1 widescreen with characteristic lens flares", category: "style" },
    { id: "s-2", title: "1970s Film Stock", description: "Grainy, warm tones with vintage color science", category: "style" },
    { id: "s-3", title: "IMAX Documentary", description: "Crystal-clear, ultra-sharp large-format aesthetic", category: "style" },
    { id: "s-4", title: "Black & White Film Noir", description: "High contrast monochrome with deep shadows", category: "style" },
    { id: "s-5", title: "Wes Anderson Symmetry", description: "Perfectly centered, pastel-colored compositions", category: "style" },
    { id: "s-6", title: "Blade Runner Cyberpunk", description: "Neon-soaked, rain-slicked dystopian atmosphere", category: "style" },
    { id: "s-7", title: "16mm Documentary", description: "Raw, authentic handheld with natural grain", category: "style" },
    { id: "s-8", title: "Music Video Energy", description: "Dynamic cuts, color grading, stylized visuals", category: "style" },
  ],
  "depth-of-field": [
    { id: "dof-1", title: "Shallow Focus", description: "Subject sharp, background beautifully blurred (bokeh)", category: "depth-of-field" },
    { id: "dof-2", title: "Deep Focus", description: "Everything from foreground to background in crisp focus", category: "depth-of-field" },
    { id: "dof-3", title: "Rack Focus", description: "Focus shifts from one subject to another during shot", category: "depth-of-field" },
    { id: "dof-4", title: "Selective Focus", description: "Isolating specific element while rest falls soft", category: "depth-of-field" },
    { id: "dof-5", title: "Tilt-Shift Miniature", description: "Narrow plane of focus creating toy-like effect", category: "depth-of-field" },
    { id: "dof-6", title: "Hyperfocal Distance", description: "Maximum depth with acceptable sharpness throughout", category: "depth-of-field" },
  ],
  "motion-timing": [
    { id: "mt-1", title: "Slow Motion", description: "Action slowed to 1/4 speed for dramatic effect", category: "motion-timing" },
    { id: "mt-2", title: "Time-lapse", description: "Hours compressed into seconds showing passage of time", category: "motion-timing" },
    { id: "mt-3", title: "Beat-Perfect Timing", description: "Actions synchronized to counted beats (3 steps, pause, turn)", category: "motion-timing" },
    { id: "mt-4", title: "Held Moment", description: "Subject freezes mid-action for 2 seconds before continuing", category: "motion-timing" },
    { id: "mt-5", title: "Gradual Reveal", description: "Subject or object slowly enters frame over 4 seconds", category: "motion-timing" },
    { id: "mt-6", title: "Quick Cut Energy", description: "Fast-paced action completing in under 2 seconds", category: "motion-timing" },
  ],
  "color-palette": [
    { id: "cp-1", title: "Warm Earth Tones", description: "Amber, terracotta, burnt sienna, cream palette", category: "color-palette" },
    { id: "cp-2", title: "Cool Blue-Teal", description: "Icy blues, teals, silver creating cold atmosphere", category: "color-palette" },
    { id: "cp-3", title: "Complementary Orange-Teal", description: "Classic cinematic color scheme with high contrast", category: "color-palette" },
    { id: "cp-4", title: "Monochromatic Green", description: "Various shades of single color for cohesive mood", category: "color-palette" },
    { id: "cp-5", title: "Pastel Dream", description: "Soft pinks, lavenders, mint greens, peachy tones", category: "color-palette" },
    { id: "cp-6", title: "Neon Synthwave", description: "Electric purples, hot pinks, cyan creating retro-future vibe", category: "color-palette" },
    { id: "cp-7", title: "Desaturated Bleach", description: "Washed-out colors with blown highlights", category: "color-palette" },
    { id: "cp-8", title: "Rich Jewel Tones", description: "Deep emerald, sapphire, ruby, gold for opulence", category: "color-palette" },
  ],
  "weather": [
    { id: "w-1", title: "Morning Mist", description: "Soft fog rolling through scene adding mystery", category: "weather" },
    { id: "w-2", title: "Gentle Rain", description: "Light rainfall creating texture and reflections", category: "weather" },
    { id: "w-3", title: "Falling Snow", description: "Snowflakes drifting creating serene atmosphere", category: "weather" },
    { id: "w-4", title: "Dust Particles", description: "Floating particles caught in light beams", category: "weather" },
    { id: "w-5", title: "Heavy Storm", description: "Dramatic clouds and turbulent atmosphere", category: "weather" },
    { id: "w-6", title: "Clear Crisp Air", description: "High visibility with sharp atmospheric clarity", category: "weather" },
  ],
  "time-of-day": [
    { id: "tod-1", title: "Golden Hour", description: "Warm sunset/sunrise light with long shadows", category: "time-of-day" },
    { id: "tod-2", title: "Blue Hour", description: "Deep twilight blues before sunrise or after sunset", category: "time-of-day" },
    { id: "tod-3", title: "Harsh Midday", description: "Direct overhead sun with strong contrast", category: "time-of-day" },
    { id: "tod-4", title: "Twilight Dusk", description: "Fading light with rich gradient skies", category: "time-of-day" },
    { id: "tod-5", title: "Deep Night", description: "Dark atmosphere lit by moon or artificial sources", category: "time-of-day" },
    { id: "tod-6", title: "Early Dawn", description: "First light breaking with cool morning tones", category: "time-of-day" },
  ],
  "composition": [
    { id: "comp-1", title: "Rule of Thirds", description: "Subject positioned on intersecting grid lines", category: "composition" },
    { id: "comp-2", title: "Symmetrical Balance", description: "Perfect mirror balance creating harmony", category: "composition" },
    { id: "comp-3", title: "Leading Lines", description: "Natural lines guiding eye to subject", category: "composition" },
    { id: "comp-4", title: "Negative Space", description: "Empty areas emphasizing subject isolation", category: "composition" },
    { id: "comp-5", title: "Framing Device", description: "Natural frame within frame (doorway, window)", category: "composition" },
    { id: "comp-6", title: "Diagonal Dynamics", description: "Angled elements creating visual energy", category: "composition" },
  ],
  "mood": [
    { id: "mood-1", title: "Serene & Peaceful", description: "Calm, tranquil emotional atmosphere", category: "mood" },
    { id: "mood-2", title: "Tense & Suspenseful", description: "Anxious anticipation and unease", category: "mood" },
    { id: "mood-3", title: "Mysterious & Enigmatic", description: "Unknown elements creating curiosity", category: "mood" },
    { id: "mood-4", title: "Nostalgic & Wistful", description: "Bittersweet remembrance and longing", category: "mood" },
    { id: "mood-5", title: "Uplifting & Joyful", description: "Optimistic and energizing emotion", category: "mood" },
    { id: "mood-6", title: "Melancholic & Somber", description: "Reflective sadness and contemplation", category: "mood" },
  ],
  "texture": [
    { id: "tex-1", title: "Film Grain", description: "35mm organic grain texture throughout", category: "texture" },
    { id: "tex-2", title: "Smooth Surfaces", description: "Polished, clean textures with minimal detail", category: "texture" },
    { id: "tex-3", title: "Rough Weathered", description: "Aged, worn surfaces with character", category: "texture" },
    { id: "tex-4", title: "Glossy Reflective", description: "Shiny surfaces with mirror-like quality", category: "texture" },
    { id: "tex-5", title: "Matte Finish", description: "Non-reflective surfaces absorbing light", category: "texture" },
    { id: "tex-6", title: "Organic Natural", description: "Tactile natural materials like wood, stone", category: "texture" },
  ],
};
