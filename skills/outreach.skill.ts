export interface OutreachContact {
  leadId: string;
  name: string;
  email?: string;
  phone?: string;
  preferredChannel: "email" | "whatsapp" | "linkedin";
}

export interface OutreachInput {
  campaignId: string;
  contacts: OutreachContact[];
  template: string;
  senderName: string;
}

export interface OutreachDispatch {
  leadId: string;
  channel: string;
  status: "sent" | "queued" | "failed";
  externalMessageId?: string;
}

export interface OutreachOutput {
  dispatches: OutreachDispatch[];
  sentAt: string;
}

export interface OutreachDeps {
  sendMessage?: (contact: OutreachContact, message: string) => Promise<OutreachDispatch>;
}

function log(event: string, payload?: Record<string, unknown>): void {
  console.info(JSON.stringify({ skill: "outreach", event, payload, at: new Date().toISOString() }));
}

export async function outreach(input: OutreachInput, deps: OutreachDeps = {}): Promise<OutreachOutput> {
  log("start", { campaignId: input.campaignId, contacts: input.contacts.length });

  const dispatches: OutreachDispatch[] = [];

  for (const contact of input.contacts) {
    const message = input.template
      .replace("{{name}}", contact.name)
      .replace("{{sender}}", input.senderName);

    if (deps.sendMessage) {
      dispatches.push(await deps.sendMessage(contact, message));
      continue;
    }

    dispatches.push({
      leadId: contact.leadId,
      channel: contact.preferredChannel,
      status: "sent",
      externalMessageId: `msg_${contact.leadId}_${Date.now()}`,
    });
  }

  const output: OutreachOutput = {
    dispatches,
    sentAt: new Date().toISOString(),
  };

  log("success", { sent: output.dispatches.filter((d) => d.status === "sent").length });
  return output;
}

export async function exampleUsage(): Promise<OutreachOutput> {
  return outreach({
    campaignId: "cmp_demo_followup",
    senderName: "Equipe Evolua",
    template: "Oi {{name}}, aqui e {{sender}}. Podemos agendar uma demo?",
    contacts: [
      {
        leadId: "lead_456",
        name: "Carlos",
        email: "carlos@example.com",
        preferredChannel: "email",
      },
    ],
  });
}