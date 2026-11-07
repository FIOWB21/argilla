import { Page } from "@playwright/test";
import { mockClickAwayAnnotation } from "../annotation-mode-page/click-away.fixture";

export const MANUAL_TEXTS = [
  "Record 01. Tomorrow I will visit the library and return two books.",
  "Record 02. The blue cup is standing beside the window.",
  "Record 03. Perhaps we can meet on Friday; the time is still uncertain.",
  "Record 04. I have booked a train ticket for next Monday morning.",
  "Record 05. The garden was quiet after the rain. A small bird sat on the fence.",
  "Record 06. We are planning to paint the kitchen this weekend. First we need to choose a colour.",
  "Record 07. This sentence contains the numbers 123 and 456 for selection and copy checks.",
  "Record 08. I might join the walking group, but I have not decided yet.",
  "Record 09. Please check whether the parcel has already arrived.",
  "Record 10. On Saturday we will plant three trees and water the new flowers.",
];

type ManualAnswer = {
  id: string;
  record_id: string;
  user_id: string;
  status: "submitted" | "discarded" | "draft";
  values: { decision?: { value: string } };
  inserted_at: string;
  updated_at: string;
};

// This API exists only inside the Playwright browser context. The application
// uses its ordinary save, pagination and filtering code; no backend is used.
export const mockManualRecords = async (page: Page) => {
  const mocked = await mockClickAwayAnnotation(page, { includeNotes: false });
  const timestamp = "2024-01-01T00:00:00";
  const answers = new Map<string, ManualAnswer>();
  const writes: ManualAnswer[] = [];
  const records = MANUAL_TEXTS.map((text, index) => ({
    id: `10000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    fields: { text },
    metadata: {},
    suggestions: [],
    inserted_at: timestamp,
    updated_at: timestamp,
  }));
  const view = (record: (typeof records)[number]) => ({
    ...record,
    responses: answers.has(record.id) ? [answers.get(record.id)] : [],
    status: ["submitted", "discarded"].includes(answers.get(record.id)?.status)
      ? "completed"
      : "pending",
  });

  const datasetPath = `/api/v1/me/datasets/${mocked.dataset.id}`;
  await page.route(
    (url) => url.pathname === `${datasetPath}/records/search`,
    async (route) => {
      const url = new URL(route.request().url());
      const body = route.request().postDataJSON();
      const status = body.filters.and.find(
        (filter) =>
          filter.scope.entity === "response" &&
          filter.scope.property === "status"
      )?.values[0];
      const text = (body.query?.text?.q ?? "").toLowerCase();
      const matching = records.filter((record) => {
        const answer = answers.get(record.id);
        return (
          (status === "pending" ? !answer : answer?.status === status) &&
          record.fields.text.toLowerCase().includes(text)
        );
      });
      const offset = Number(url.searchParams.get("offset") ?? 0);
      const limit = Number(url.searchParams.get("limit") ?? 10);
      await route.fulfill({
        json: {
          items: matching
            .slice(offset, offset + limit)
            .map((record) => ({ record: view(record), query_score: 1 })),
          total: matching.length,
        },
      });
    }
  );

  await page.route(
    (url) => /^\/api\/v1\/(records|responses)\//.test(url.pathname),
    async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      const record = records.find(
        (item) =>
          path === `/api/v1/records/${item.id}` ||
          path === `/api/v1/records/${item.id}/responses` ||
          path === `/api/v1/responses/${answers.get(item.id)?.id}`
      );
      if (!record) return route.fallback();
      if (request.method() === "GET") {
        await route.fulfill({ json: view(record) });
        return;
      }
      if (request.method() === "DELETE") {
        answers.delete(record.id);
        await route.fulfill({ status: 204 });
        return;
      }
      if (!["POST", "PUT"].includes(request.method())) return route.fallback();
      const body = request.postDataJSON();
      const answer: ManualAnswer = {
        id: record.id.replace(/^1/, "2"),
        record_id: record.id,
        user_id: "00000000-0000-4000-8000-000000000002",
        status: body.status,
        values: body.values,
        inserted_at: timestamp,
        updated_at: new Date().toISOString(),
      };
      answers.set(record.id, answer);
      writes.push(answer);
      await route.fulfill({
        status: request.method() === "POST" ? 201 : 200,
        json: answer,
      });
    }
  );

  await page.route(
    (url) => url.pathname === `${datasetPath}/metrics`,
    (route) => {
      const count = (status: string) =>
        [...answers.values()].filter((answer) => answer.status === status)
          .length;
      return route.fulfill({
        json: {
          records: { count: records.length },
          responses: {
            count: answers.size,
            submitted: count("submitted"),
            discarded: count("discarded"),
            draft: count("draft"),
          },
        },
      });
    }
  );
  await page.route(
    (url) => url.pathname === `/api/v1/datasets/${mocked.dataset.id}/progress`,
    (route) => {
      const completed = [...answers.values()].filter(
        (answer) => answer.status !== "draft"
      ).length;
      return route.fulfill({
        json: {
          total: records.length,
          completed,
          pending: records.length - completed,
          users: [],
        },
      });
    }
  );
  return { ...mocked, records, answers, writes };
};
