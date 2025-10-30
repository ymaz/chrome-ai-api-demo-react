import type { SummaryType } from "./types";

export const SUMMARY_TYPES: { value: SummaryType; label: string }[] = [
  { value: "tl;dr", label: "TL;DR" },
  { value: "key-points", label: "Key Points" },
  { value: "teaser", label: "Teaser" },
  { value: "headline", label: "Headline" },
];

export const SAMPLE_TEXTS = [
  {
    title: "Tech Article",
    text: `Artificial Intelligence has transformed the technology landscape in unprecedented ways. Machine learning algorithms now power everything from recommendation systems to autonomous vehicles. Deep learning, a subset of machine learning, has enabled breakthrough achievements in image recognition, natural language processing, and game playing. Companies worldwide are investing billions in AI research and development. However, concerns about AI ethics, bias, and job displacement continue to spark important debates. Experts emphasize the need for responsible AI development that considers societal impacts. As we move forward, the challenge lies in harnessing AI's potential while addressing its risks and ensuring equitable benefits across society.`,
  },
  {
    title: "News Story",
    text: `In a groundbreaking development, researchers at a leading university have discovered a new method for carbon capture that could revolutionize climate change mitigation efforts. The innovative technology uses specially designed materials that can absorb carbon dioxide from the atmosphere at unprecedented rates. Early tests show the system is 50% more efficient than existing methods and significantly less expensive to operate. The research team, funded by international climate organizations, plans to scale up the technology for commercial deployment within the next two years. Environmental scientists are calling this discovery a potential game-changer in the fight against global warming. Government officials from several countries have already expressed interest in implementing the technology at scale.`,
  },
  {
    title: "Blog Post",
    text: `Welcome to my journey of learning web development! After years of thinking about it, I finally took the plunge and started coding. The first few weeks were challenging - understanding HTML, CSS, and JavaScript fundamentals felt overwhelming. But persistence paid off. I built my first website, a simple portfolio page, and the feeling of accomplishment was incredible. Then came React, which opened up a whole new world of possibilities. Now I'm exploring backend development with Node.js. The tech community has been incredibly supportive. Online tutorials, coding bootcamps, and developer forums have been invaluable resources. To anyone considering learning to code: start today, be patient with yourself, and don't be afraid to ask for help. The journey is difficult but absolutely worth it.`,
  },
  {
    title: "Scientific Paper Abstract",
    text: `This study investigates the effects of intermittent fasting on metabolic health markers in adult participants over a 12-week period. Sixty volunteers were randomly assigned to either an intermittent fasting group (16:8 protocol) or a control group maintaining regular eating patterns. Blood samples were collected at baseline, week 6, and week 12 to measure glucose levels, insulin sensitivity, lipid profiles, and inflammatory markers. Results showed significant improvements in insulin sensitivity (p<0.01) and reduction in inflammatory markers (p<0.05) in the intermittent fasting group compared to controls. Body weight decreased by an average of 3.2kg in the fasting group versus 0.5kg in controls. No adverse effects were reported. These findings suggest intermittent fasting may be an effective intervention for improving metabolic health, though longer-term studies are needed to confirm sustained benefits.`,
  },
];

export const normalizeTypeForNewAPI = (type: SummaryType): "tldr" | SummaryType =>
  (type === "tl;dr" ? "tldr" : type);


