import { buildAudienceUrl, type AudienceChoice, type DemoMode } from "@/data/audience";
import {
  getSitePage,
  getSiteSection,
  isPersonaId,
  isScenarioId,
  pageFromPath,
  personaFromJourneyPath,
  type SitePage,
} from "@shared/siteKnowledge";

export type NavigationRequest = {
  pageId: string;
  sectionId?: string;
  personaId?: string;
  industryId?: string;
  demoMode?: DemoMode;
};

export type NavigationPlan = {
  ok: true;
  href: string;
  path: string;
  page: SitePage;
  sectionId: string | null;
  personaId: string | null;
  industryId: string | null;
  demoMode: DemoMode | null;
};

export function planNavigation(
  request: NavigationRequest,
  current: AudienceChoice & { pathname: string; demoMode: DemoMode | null },
): NavigationPlan | { ok: false; error: string } {
  const page = getSitePage(request.pageId);
  if (!page) return { ok: false, error: "That page is not on the public site." };
  if (request.personaId && !isPersonaId(request.personaId)) {
    return { ok: false, error: "That role is not on the site." };
  }
  if (request.industryId && !isScenarioId(request.industryId)) {
    return { ok: false, error: "That workflow is not on the site." };
  }
  if (request.demoMode && page.id !== "demos") {
    return { ok: false, error: "Demo mode only applies to the demos page." };
  }
  if (request.sectionId && request.sectionId !== "intro") {
    const section = getSiteSection(page.id, request.sectionId);
    if (!section?.anchor) {
      return { ok: false, error: "That section is not a destination on the page." };
    }
  }

  const personaId = request.personaId ?? personaFromJourneyPath(current.pathname) ?? current.personaId;
  const industryId = request.industryId ?? current.industryId;
  let path = page.path;
  if (page.id === "journey" && personaId && (request.personaId || request.sectionId?.startsWith(`${personaId}-`) || request.sectionId === personaId)) {
    path = `/journey/${personaId}`;
  }
  if (page.id === "journey" && request.sectionId && request.sectionId !== "intro" && request.sectionId !== "journey-roles") {
    const owner = request.sectionId.split("-")[0];
    if (isPersonaId(owner)) path = `/journey/${owner}`;
  }

  const audienceHref = buildAudienceUrl(`http://localhost${path}`, {
    personaId: page.id === "journey" ? personaId : personaId,
    industryId,
  });
  const url = new URL(audienceHref, "http://localhost");
  if (page.id === "demos") {
    const mode = request.demoMode ?? (current.pathname === "/demos" ? current.demoMode : null);
    if (mode === "lab") url.searchParams.set("mode", "lab");
    else url.searchParams.delete("mode");
  }
  const sectionId = request.sectionId && request.sectionId !== "intro" ? request.sectionId : null;
  if (sectionId) url.hash = sectionId;
  return {
    ok: true,
    href: `${url.pathname}${url.search}${url.hash}`,
    path: url.pathname,
    page,
    sectionId,
    personaId,
    industryId,
    demoMode: page.id === "demos" ? (url.searchParams.get("mode") === "lab" ? "lab" : "guided") : null,
  };
}

export function currentPageId(pathname: string): string | null {
  return pageFromPath(pathname)?.id ?? null;
}

export function waitForAssistantTarget(
  pageId: string,
  sectionId: string | null,
): Promise<{ mounted: boolean; sectionFound: boolean }> {
  const deadline = Date.now() + 2_000;
  return new Promise((resolve) => {
    const tick = () => {
      const marker = document.querySelector(`[data-assistant-page="${pageId}"]`);
      const section = sectionId ? document.getElementById(sectionId) : null;
      if (marker && (!sectionId || section)) {
        if (section instanceof HTMLElement) {
          section.scrollIntoView({ block: "start" });
          if (!section.hasAttribute("tabindex")) section.tabIndex = -1;
          section.focus({ preventScroll: true });
        }
        resolve({ mounted: true, sectionFound: !sectionId || Boolean(section) });
        return;
      }
      if (Date.now() >= deadline) {
        resolve({ mounted: Boolean(marker), sectionFound: false });
        return;
      }
      window.setTimeout(tick, 50);
    };
    tick();
  });
}
