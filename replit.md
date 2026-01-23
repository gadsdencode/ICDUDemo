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
- 2026-01-23: Initial implementation of full ICDU explainer application
  - Created all core components
  - Implemented 6 persona journeys with 5 steps each
  - Built 4 interactive demos
  - Added responsive navigation and theming
  - Set up analytics tracking
