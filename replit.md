# ICDU Explainer Application

## Overview
An interactive web application that explains ICDU (Intent-Conscious Data Unit) and guides users through persona-based journey maps showing the benefits of AI safety evaluation pipelines.

## Project Structure
- `client/src/components/` - Reusable UI components
  - `ICDUBuilder.tsx` - Interactive ICDU form with live JSON preview
  - `JudgePanel.tsx` - AI Judge mock evaluation demo
  - `RubricPanel.tsx` - HITL Nuance Grader with 5 rubric dimensions
  - `StressPanel.tsx` - Stress Engine perturbation testing
  - `PersonaSelector.tsx` - Persona card/tab selector
  - `JourneyStepper.tsx` - Step-by-step journey navigation
  - `PipelineDiagram.tsx` - Visual pipeline representation
  - `Navigation.tsx` - Top navigation bar
  - `ThemeProvider.tsx` - Dark/light theme context
- `client/src/pages/` - Page components
  - `Overview.tsx` - Landing page with pipeline overview
  - `Journey.tsx` - Persona-based journey experience
  - `Demos.tsx` - Interactive demo tools
  - `FAQ.tsx` - FAQ and glossary
- `client/src/data/` - Configuration data
  - `personas.json` - 6 persona definitions
  - `journeys.json` - Journey steps for each persona (5 steps each)
  - `examples.ts` - Sample data, glossary terms, FAQ content
- `client/src/lib/analytics.ts` - Client-side analytics tracking

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui components
- Wouter for routing
- No backend needed - all data is static JSON

## Key Features
1. **Persona-based journeys** - 6 roles (Executive, Director, Manager, Developer, Risk & Compliance, Evaluator) with personalized content
2. **Interactive demos** - ICDU Builder, AI Judge, HITL Rubric, Stress Engine
3. **Responsive design** - Works on mobile and desktop
4. **Dark/light theme** - User preference persisted
5. **Analytics tracking** - Console logging for persona selection, step views, demo interactions

## Data-Driven Architecture
All content is rendered from configuration files:
- Add personas to `personas.json`
- Add journey steps to `journeys.json` keyed by persona ID
- Glossary and FAQ in `examples.ts`

## Recent Changes
- 2026-01-23: Eliminated all horizontal scrolling on mobile
  - Removed overflow-x-auto patterns from all components
  - Changed step buttons and persona selectors to use flex-wrap
  - All content now wraps within viewport width (320px tested)
- 2026-01-23: Aggressive mobile optimization for 320-375px screens
  - Further reduced text sizes (text-[10px], text-[9px], text-[11px])
  - Ultra-compact padding (p-2, p-2.5) and spacing (gap-1, gap-1.5)
  - Smaller icons (h-3 w-3) and buttons (h-7, h-8) on mobile
  - Hidden descriptions/taglines on mobile to save space
  - 2-column grid for persona cards on mobile
  - Journey step buttons show just numbers on mobile
  - Shortened all headings and labels for mobile
- 2026-01-23: Comprehensive mobile-first responsive optimization
  - Updated all components with sm/md breakpoints for mobile-friendly sizing
  - Added responsive text sizing (text-xs sm:text-sm, text-[10px] sm:text-xs)
  - Implemented flexible layouts (flex-col sm:flex-row, grid breakpoints)
  - Added horizontal scroll containers with -mx-4 px-4 patterns
  - Touch-optimized buttons and interactive elements
  - Reduced padding/spacing on mobile (p-3 sm:p-4, gap-2 sm:gap-4)
  - Shortened labels on mobile (Step 1, Step 2 instead of full titles)
  - Hidden non-essential columns on mobile tables
- 2026-01-23: Initial implementation of full ICDU explainer application
  - Created all core components
  - Implemented 6 persona journeys with 5 steps each
  - Built 4 interactive demos
  - Added responsive navigation and theming
  - Set up analytics tracking
