export interface SocialPost {
  channel: "instagram" | "facebook" | "linkedin" | "tiktok" | "x";
  content: string;
  mediaUrls?: string[];
  scheduledAt: string;
}

export interface SocialPublishInput {
  campaignId: string;
  posts: SocialPost[];
}

export interface PublishResult {
  channel: string;
  postId: string;
  status: "published" | "scheduled" | "failed";
  url?: string;
  error?: string;
}

export interface SocialPublishOutput {
  results: PublishResult[];
  publishedAt: string;
}

export interface SocialPublishDeps {
  publishPost?: (post: SocialPost) => Promise<PublishResult>;
}

function log(event: string, payload?: Record<string, unknown>): void {
  console.info(JSON.stringify({ skill: "social_publish", event, payload, at: new Date().toISOString() }));
}

export async function socialPublish(
  input: SocialPublishInput,
  deps: SocialPublishDeps = {},
): Promise<SocialPublishOutput> {
  log("start", { campaignId: input.campaignId, posts: input.posts.length });

  const results: PublishResult[] = [];

  for (const post of input.posts) {
    if (deps.publishPost) {
      results.push(await deps.publishPost(post));
      continue;
    }

    results.push({
      channel: post.channel,
      postId: `${post.channel}_${Date.now()}`,
      status: new Date(post.scheduledAt).getTime() > Date.now() ? "scheduled" : "published",
      url: `https://social.example/${post.channel}/${input.campaignId}`,
    });
  }

  const output: SocialPublishOutput = {
    results,
    publishedAt: new Date().toISOString(),
  };

  log("success", { successful: output.results.filter((r) => r.status !== "failed").length });
  return output;
}

export async function exampleUsage(): Promise<SocialPublishOutput> {
  return socialPublish({
    campaignId: "cmp_webinar_2026",
    posts: [
      {
        channel: "instagram",
        content: "Participe do webinar para clinicas de fonoaudiologia.",
        scheduledAt: new Date(Date.now() + 60_000).toISOString(),
      },
    ],
  });
}