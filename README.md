# ICDU Explainer - Interactive Web Application

An interactive web application that explains ICDU (Intent-Conscious Data Unit) and guides users through persona-based "journey maps" showing why ICDU is necessary and what benefits it provides.

## Overview

This application teaches ICDU concepts through:
1. **Overview Page** - Quick introduction to ICDU and the pipeline
2. **Persona Journeys** - Role-specific walkthroughs (Executive, Director, Manager, Developer, Risk & Compliance, Evaluator)
3. **Interactive Demos** - Build ICDUs, run AI Judge evaluations, use HITL rubrics, and stress test
4. **FAQ & Glossary** - Reference documentation and terminology

## How to Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`.

## Project Structure

```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ICDUBuilder.tsx   # Interactive ICDU form builder
│   │   ├── JudgePanel.tsx    # AI Judge evaluation demo
│   │   ├── RubricPanel.tsx   # HITL Nuance Grader
│   │   ├── StressPanel.tsx   # Stress Engine perturbation tester
│   │   ├── PersonaSelector.tsx
│   │   ├── JourneyStepper.tsx
│   │   ├── PipelineDiagram.tsx
│   │   ├── Navigation.tsx
│   │   └── ...
│   ├── data/                # Configuration data
│   │   ├── personas.json     # Persona definitions
│   │   ├── journeys.json     # Journey step configurations
│   │   └── examples.ts       # Sample data and glossary
│   ├── pages/               # Page components
│   │   ├── Overview.tsx
│   │   ├── Journey.tsx
│   │   ├── Demos.tsx
│   │   └── FAQ.tsx
│   └── lib/
│       └── analytics.ts     # Client-side analytics tracking
```

## Adding a New Persona

1. Open `client/src/data/personas.json`
2. Add a new persona object:

```json
{
  "id": "your-persona-id",
  "name": "Persona Name",
  "tagline": "Short description",
  "icon": "IconName", // Lucide icon name: Building2, Users, ClipboardList, Code2, Shield, Search
  "primaryConcerns": ["Concern 1", "Concern 2"],
  "successMetrics": ["Metric 1", "Metric 2"],
  "recommendedStartingSection": "section-name"
}
```

3. Add journey steps in `client/src/data/journeys.json`:

```json
{
  "your-persona-id": [
    {
      "stepId": "step-1",
      "title": "Step Title",
      "problem": "Description of the pain point without ICDU",
      "withIcdu": "How ICDU addresses this pain point",
      "proofMetrics": "Measurable outcomes and metrics",
      "example": "A concrete example scenario",
      "whereInPipeline": "ICDU Creation | AI Judge Gate | HITL Nuance Grading | Stress Testing | Full Pipeline",
      "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"]
    }
  ]
}
```

## Adding Journey Steps

Each journey step in `journeys.json` requires:

| Field | Description |
|-------|-------------|
| `stepId` | Unique identifier for the step |
| `title` | Display title for the step |
| `problem` | The pain point without ICDU |
| `withIcdu` | How ICDU solves this problem |
| `proofMetrics` | Measurable outcomes |
| `example` | Concrete example scenario |
| `whereInPipeline` | Pipeline stage this relates to |
| `keyTakeaways` | Array of 3 key points |

## Features

### ICDU Builder
- Interactive form to create ICDU records
- Live JSON preview with copy-to-clipboard
- Fields: intent, principles, persona/tone, context/constraints, input

### AI Judge Demo
- Mock scoring engine generating IAS/PAS/AS scores
- Threshold-based gate decisions (PROMOTE/ESCALATE/BLOCK)
- Visual rationale display

### HITL Nuance Grader
- 5 interactive sliders (empathy, clarity, coaching, trust, safety)
- Score aggregation and notes
- Structured rubric following HITL best practices

### Stress Engine
- Select from 10 perturbation types
- Generates results table with stability metrics
- Pass/Warn/Fail status indicators

## Analytics

The app includes lightweight client-side analytics (console logging):
- Persona selection events
- Journey step views
- Demo interactions
- Page views

See `client/src/lib/analytics.ts` for implementation.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: Wouter
- **State**: React hooks (no external state management needed)
- **Data**: Local JSON configuration files

## License Notice

This application is for **evaluation and research purposes only**. ICDU is protected by patent-pending applications. Commercial use requires a separate license.
