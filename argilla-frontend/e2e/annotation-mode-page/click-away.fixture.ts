import { Page } from "@playwright/test";
import { mockFields } from "../common/field-api-mock";

export const CLICK_AWAY_TEXT = "Synthetic record for keyboard focus testing.";

export type ClickAwayOptions = {
  choiceType?: "label_selection" | "multi_label_selection" | "rating";
  searchable?: boolean;
  extraChoice?: boolean;
};

export const mockClickAwayAnnotation = async (
  page: Page,
  {
    choiceType = "label_selection",
    searchable = false,
    extraChoice = false,
  }: ClickAwayOptions = {}
) => {
  const unexpectedRequests: string[] = [];
  const responseWrites: string[] = [];
  const timestamp = "2024-01-01T00:00:00";
  const workspace = {
    id: "00000000-0000-4000-8000-000000000005",
    name: "synthetic-workspace",
  };
  const dataset = {
    id: "00000000-0000-4000-8000-000000000006",
    name: "keyboard-focus-synthetic",
    guidelines: "Synthetic keyboard focus test.",
    status: "ready",
    workspace_id: workspace.id,
    allow_extra_metadata: false,
    distribution: { strategy: "overlap", min_submitted: 1 },
    metadata: {},
    inserted_at: timestamp,
    updated_at: timestamp,
    last_activity_at: timestamp,
  };
  const record = {
    id: "00000000-0000-4000-8000-000000000001",
    fields: { text: CLICK_AWAY_TEXT },
    metadata: {},
    responses: [],
    suggestions: [],
    status: "pending",
    inserted_at: timestamp,
    updated_at: timestamp,
  };

  // No API request may fall through to a real backend, including writes.
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const description = `${request.method()} ${path}`;
    if (/responses/.test(path) && request.method() !== "GET") {
      responseWrites.push(description);
    } else {
      unexpectedRequests.push(description);
    }
    await route.fulfill({ status: 501, json: { detail: "Unmocked API" } });
  });

  await mockFields(page, dataset.id);

  const responses = {
    "/api/v1/me/workspaces": { items: [workspace] },
    "/api/v1/me/datasets": { items: [dataset] },
    [`/api/v1/datasets/${dataset.id}`]: dataset,
    [`/api/v1/workspaces/${workspace.id}`]: workspace,
    "/api/v1/settings": {},
    "/api/v1/oauth2/providers": { items: [] },
    "/api/v1/token": {
      access_token: "synthetic-test-token",
      token_type: "bearer",
    },
    "/api/v1/me": {
      id: "00000000-0000-4000-8000-000000000002",
      username: "synthetic-annotator",
      first_name: "Synthetic",
      last_name: "Annotator",
      full_name: "Synthetic Annotator",
      role: "annotator",
      workspaces: [dataset.workspace_id],
    },
    [`/api/v1/datasets/${dataset.id}/metadata-properties`]: { items: [] },
    [`/api/v1/me/datasets/${dataset.id}/metadata-properties`]: { items: [] },
    [`/api/v1/datasets/${dataset.id}/vectors-settings`]: { items: [] },
    [`/api/v1/datasets/${dataset.id}/questions`]: {
      items: [
        {
          id: "00000000-0000-4000-8000-000000000003",
          name: "notes",
          title: "Notes",
          required: true,
          settings: { type: "text", use_markdown: false },
        },
        ...(extraChoice
          ? [
              {
                id: "00000000-0000-4000-8000-000000000007",
                name: "tags",
                title: "Tags",
                required: false,
                settings: {
                  type: "multi_label_selection",
                  options: [
                    { value: "alpha", text: "Alpha" },
                    { value: "beta", text: "Beta" },
                    { value: "gamma", text: "Gamma" },
                  ],
                },
              },
            ]
          : []),
        {
          id: "00000000-0000-4000-8000-000000000004",
          name: "decision",
          title: "Decision",
          required: true,
          settings: {
            type: choiceType,
            options:
              choiceType === "rating"
                ? [1, 2, 3].map((value) => ({ value }))
                : [
                    { value: "yes", text: "Yes" },
                    { value: "no", text: "No" },
                    { value: "not-sure", text: "Not sure" },
                    ...(searchable
                      ? Array.from({ length: 12 }, (_, index) => ({
                          value: `extra-${index + 4}`,
                          text: `Extra ${index + 4}`,
                        }))
                      : []),
                  ],
          },
        },
      ].map((question) => ({
        ...question,
        description: "",
        inserted_at: timestamp,
        updated_at: timestamp,
      })),
    },
    [`/api/v1/me/datasets/${dataset.id}/records/search`]: {
      items: [{ record, query_score: 1 }],
      total: 1,
    },
    [`/api/v1/me/datasets/${dataset.id}/metrics`]: {
      records: { count: 1 },
      responses: { count: 0, submitted: 0, discarded: 0, draft: 0 },
    },
    [`/api/v1/datasets/${dataset.id}/progress`]: {
      total: 1,
      completed: 0,
      pending: 1,
      users: [],
    },
  };

  for (const [path, json] of Object.entries(responses)) {
    await page.route(
      (url) => url.pathname === path,
      (route) => route.fulfill({ json })
    );
  }

  return { dataset, unexpectedRequests, responseWrites };
};
