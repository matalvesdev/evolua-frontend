export interface LeadContact {
  fullName: string;
  email: string;
  phone?: string;
}

export interface LeadCaptureInput {
  source: "landing_page" | "instagram" | "linkedin" | "webinar" | "referral";
  contact: LeadContact;
  consent: boolean;
  tags?: string[];
  metadata?: Record<string, string>;
}

export interface LeadCaptureOutput {
  leadId: string;
  accepted: boolean;
  normalizedContact: LeadContact;
  queue: "sales" | "nurture" | "review";
  capturedAt: string;
}

export interface LeadCaptureDeps {
  saveLead?: (input: LeadCaptureInput) => Promise<{ id: string }>;
}

function log(event: string, payload?: Record<string, unknown>): void {
  console.info(JSON.stringify({ skill: "lead_capture", event, payload, at: new Date().toISOString() }));
}

export async function leadCapture(
  input: LeadCaptureInput,
  deps: LeadCaptureDeps = {},
): Promise<LeadCaptureOutput> {
  log("start", { source: input.source, hasConsent: input.consent });

  const normalizedContact: LeadContact = {
    fullName: input.contact.fullName.trim(),
    email: input.contact.email.trim().toLowerCase(),
    phone: input.contact.phone?.trim(),
  };

  const saved = deps.saveLead ? await deps.saveLead(input) : { id: `lead_${Date.now()}` };
  const queue: LeadCaptureOutput["queue"] = input.consent ? "sales" : "review";

  const output: LeadCaptureOutput = {
    leadId: saved.id,
    accepted: input.consent,
    normalizedContact,
    queue,
    capturedAt: new Date().toISOString(),
  };

  log("success", { leadId: output.leadId, queue: output.queue });
  return output;
}

export async function exampleUsage(): Promise<LeadCaptureOutput> {
  return leadCapture({
    source: "landing_page",
    contact: {
      fullName: "Maria Oliveira",
      email: "maria@example.com",
      phone: "+55 11 99999-0000",
    },
    consent: true,
    tags: ["ebook", "top_funnel"],
  });
}