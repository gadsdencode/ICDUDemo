type AnalyticsEvent = {
  type: 'persona_selected' | 'journey_step_viewed' | 'demo_interaction' | 'page_viewed';
  data: Record<string, string | number>;
  timestamp: number;
};

const events: AnalyticsEvent[] = [];

export function trackEvent(type: AnalyticsEvent['type'], data: Record<string, string | number>) {
  const event: AnalyticsEvent = {
    type,
    data,
    timestamp: Date.now()
  };
  
  events.push(event);
  
  console.log(`[Analytics] ${type}:`, data);
}

export function trackPersonaSelected(personaId: string, personaName: string) {
  trackEvent('persona_selected', { personaId, personaName });
}

export function trackJourneyStepViewed(personaId: string, stepId: string, stepTitle: string) {
  trackEvent('journey_step_viewed', { personaId, stepId, stepTitle });
}

export function trackDemoInteraction(demoType: string, action: string) {
  trackEvent('demo_interaction', { demoType, action });
}

export function trackPageViewed(pageName: string) {
  trackEvent('page_viewed', { pageName });
}

export function getEvents() {
  return [...events];
}
