import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Download, FlaskConical, Code2, Wrench } from "lucide-react";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";
import {
  BrandPage,
  PageHero,
  ContentSection,
  SecondaryCTA,
} from "@/components/brand";
import {
  generatedTechnicalDocs,
  downloadCatalogItem,
} from "@/data/siteResources";

export default function Developers() {
  useSEO({
    title: "Developers | ICDU",
    description:
      "Technical resources for ICDU — schema samples, Advanced Lab, and the local Fine-Tune developer utility.",
  });

  useEffect(() => {
    trackPageViewed("developers");
  }, []);

  return (
    <BrandPage>
      <div className="mx-auto max-w-4xl space-y-12 sm:space-y-14">
        <PageHero
          label="Developers"
          title="Technical resources and labs"
          description="Schema samples, interactive Advanced Lab controls, and a local Fine-Tune utility for teams with a training API running in their own environment."
          displayTitle={false}
        />

        <ContentSection
          label="Labs"
          heading="Where to work hands-on"
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-5">
              <div className="flex items-start gap-3">
                <FlaskConical
                  className="h-5 w-5 shrink-0 mt-0.5"
                  style={{ color: "var(--icdu-blue)" }}
                />
                <div>
                  <h3 className="font-semibold text-sm m-0 mb-1">
                    Advanced Lab
                  </h3>
                  <p className="text-sm text-[color:var(--icdu-fg-muted)] m-0 mb-3">
                    Builder, Judge, HITL, and Stress tools with deterministic mock
                    behavior — inspect fields, thresholds, and JSON directly in
                    the browser.
                  </p>
                  <Link
                    href="/demos?mode=lab"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--icdu-blue)] hover:underline"
                  >
                    Open Advanced Lab <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-5">
              <div className="flex items-start gap-3">
                <Wrench
                  className="h-5 w-5 shrink-0 mt-0.5"
                  style={{ color: "var(--icdu-blue)" }}
                />
                <div>
                  <h3 className="font-semibold text-sm m-0 mb-1">
                    Fine-Tune — local developer utility
                  </h3>
                  <p className="text-sm text-[color:var(--icdu-fg-muted)] m-0 mb-2">
                    Optional UI for teams running an ICDU training API on their
                    own machine or private network. Not a public production
                    service and not required for buyer evaluation.
                  </p>
                  <p className="text-xs text-[color:var(--icdu-fg-faint)] m-0 mb-3">
                    Prerequisites: local API process, dataset JSONL files, and
                    environment configuration documented on the Fine-Tune page.
                  </p>
                  <Link
                    href="/fine-tune"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--icdu-blue)] hover:underline"
                  >
                    Open Fine-Tune lab <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[color:var(--icdu-border)] p-5">
              <div className="flex items-start gap-3">
                <Code2
                  className="h-5 w-5 shrink-0 mt-0.5"
                  style={{ color: "var(--icdu-blue)" }}
                />
                <div>
                  <h3 className="font-semibold text-sm m-0 mb-1">
                    Guided Demo
                  </h3>
                  <p className="text-sm text-[color:var(--icdu-fg-muted)] m-0 mb-3">
                    Scenario-led walkthrough from intent to evidence — useful
                    before diving into Advanced Lab controls.
                  </p>
                  <Link
                    href="/demos"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--icdu-blue)] hover:underline"
                  >
                    Start Guided Demo <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          label="Downloads"
          heading="Schema samples and exports"
          description="Generated technical files for integration testing. Executive DOCX/PDF materials live on Resources."
        >
          <div className="grid sm:grid-cols-2 gap-3">
            {generatedTechnicalDocs.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-[color:var(--icdu-border)] p-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{item.title}</div>
                  <div className="text-sm text-[color:var(--icdu-fg-faint)]">
                    {item.format}
                  </div>
                </div>
                <SecondaryCTA
                  type="button"
                  className="!text-xs shrink-0"
                  onClick={() => downloadCatalogItem(item)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </SecondaryCTA>
              </div>
            ))}
          </div>
        </ContentSection>
      </div>
    </BrandPage>
  );
}
