here’s a “copy-paste” prompt you can give to Amazon Q (Developer/Business) so it will:
	1.	call your intelligence API, 2) populate every field in the UI, 3) update all metadata, and 4) render an interactive screen with click behaviors.

⸻

Prompt for Amazon Q

Goal: Build and wire a -style “Intelligence Details” screen that reads one Intelligence record from our API and fully renders + updates metadata in the UI. Include attached docs, community feedback, and related intelligence. Add all click actions and state updates.

1) Data contract & API calls
	•	Primary endpoint (GET): {{API_BASE_URL}}/intelligence/{id}
	•	Update metadata (PATCH): {{API_BASE_URL}}/intelligence/{id}/metadata
	•	Feedback (POST): {{API_BASE_URL}}/intelligence/{id}/feedback
	•	Related intelligence (GET): {{API_BASE_URL}}/intelligence/{id}/related
	•	Docs download URL: provided per doc as downloadUrl

Assume JSON shape (example):

{
  "id": "FINRA-2025-0702-001",
  "title": "North Korean State-Sponsored Actors' Attempted Cryptocurrency Exchange Infiltration",
  "breadcrumbs": ["Intelligence Center", "FINRA Intelligence", "Intelligence Details"],
  "source": "FBI",
  "intelligenceType": "Threat Intelligence Product",
  "category": "Anti-Money Laundering Cyber External Fraud",
  "datePublished": "2025-07-02T08:37:00-04:00",
  "severity": "Medium",
  "status": "Resolved",
  "distribution": {"label": "Targeted", "count": 5},
  "executiveSummary": "North Korean state-sponsored threat actors have been identified attempting to infiltrate cryptocurrency exchanges...",
  "attachments": [
    {"title":"Threat Intelligence Report - Full Analysis","pages":15,"sizeBytes":2411724,"fileType":"pdf","downloadUrl":"..."},
    {"title":"Indicators of Compromise (IOCs)","pages":3,"sizeBytes":467312,"fileType":"pdf","downloadUrl":"..."},
    {"title":"Mitigation Strategies and Best Practices","pages":8,"sizeBytes":1126400,"fileType":"pdf","downloadUrl":"..."}
  ],
  "feedback": {"helpful":4,"alsoImpacted":2,"notRelevant":0,"total":5},
  "related": [
    {"id":"FINRA-2025-0615-002","title":"Cryptocurrency Exchange Security Framework Updates","source":"FBI","date":"2025-06-15","severity":"Medium"},
    {"id":"UST-2025-0628-019","title":"Social Engineering Trends in Financial Services","source":"Treasury-Other","date":"2025-06-28","severity":"Low"}
  ],
  "metadata": {
    "lastViewedAt": null,
    "viewerCount": 0,
    "tags": ["crypto","AML","external-fraud","DPRK"]
  }
}

2) UI layout & design (replicate from screenshots)

Screen name: “Intelligence Details – FIFC”

Top:
	•	Breadcrumbs: clickable → navigates back to list pages.
	•	Page title: from title.

Key facts panel (two-column grid):
	•	Left column:
	•	Source → source
	•	Category → category
	•	Severity Level → badge colored by severity (Low=calm, Medium=warning, High=alert, Critical=danger).
	•	Intelligence ID → id (copy-to-clipboard icon).
	•	Right column:
	•	Type of Intelligence → intelligenceType
	•	Date Published → localized (e.g., “07/02/2025 at 8:37am ET”)
	•	Status → status pill (Resolved, Open, In Review); color by status.
	•	Distribution → distribution.label + (count) tooltip “Targeted distribution to N firms.”

Section: Executive Summary
	•	Render executiveSummary with safe rich text (links auto-detected).

Section: Attached Documents
	•	Card list, one row per doc:
	•	Leading file icon from fileType
	•	Title (button)—click downloads using downloadUrl
	•	Right-side meta: “PDF · {pages} pages · {size}”
	•	Secondary action kebab: “Copy link”, “Open in new tab”
	•	Show skeleton loaders while fetching

Section: Community Feedback
	•	3 reaction buttons with counts:
	•	👍 “Found Helpful”
	•	🧩 “Also Impacted”
	•	🚫 “Not Relevant”
	•	Click = POST to /feedback with {type: "helpful"|"alsoImpacted"|"notRelevant"}; optimistic update counters; disable after user votes (or allow toggle if API supports).
	•	Show “Total Responses” = sum of 3.

Section: Related Intelligence
	•	Small cards (title link + source + date + severity badge).
	•	Click navigates to /intelligence/{related.id} and refreshes page state with new record.

Footer / utility
	•	“Last viewed” timestamp (from metadata.lastViewedAt), viewer count badge, and tag chips (metadata.tags).

3) Behaviors & state
	•	Initial load: fetch /intelligence/{id}, /related; set metadata.lastViewedAt = now, increment viewerCount via PATCH /metadata.
	•	Error states:
	•	404 → show empty state with “Record not found” and a “Back to Intelligence” button.
	•	Network or 5xx → toast with retry; keep skeletons visible.
	•	Loading states: skeleton bars for title and fields; gray boxes for attachment rows; shimmer for related cards.
	•	Permissions: If user lacks download scope, disable doc buttons with tooltip “No access.”
	•	Accessibility:
	•	All buttons have aria-label.
	•	Breadcrumbs are an ordered list (nav landmark).
	•	Severity/status use text + icon (don’t rely on color alone).
	•	Keyboard focus rings; Enter/Space to activate cards.
	•	Internationalization: dates and numbers via locale; fall back to ET display suffix if available in payload.
	•	Analytics hooks: fire events intelligence_view, doc_download, feedback_submit, related_open with {id, userId?}.

4) Metadata updates (PATCH)

When the screen becomes visible:

PATCH /intelligence/{id}/metadata
{
  "lastViewedAt": "{{nowIso}}",
  "viewerCount": "{{increment}}"
}

	•	Handle race conditions by retrying with backoff if 409.

5) Clickable interactions (define precisely)
	•	Breadcrumb items → route navigation.
	•	Intelligence ID copy icon → copies id to clipboard; toast “ID copied.”
	•	Status pill (if user has editor role) → dropdown to change status; on change, PATCH /intelligence/{id} with {status}; optimistic update + toast.
	•	Attachments row title → download; open in new tab if cmd/ctrl pressed.
	•	Attachments kebab → copy link / open in new tab.
	•	Feedback buttons → POST; update counts; throttle to 1 click per second.
	•	Related intelligence card → navigate and re-run full data load.
	•	Tag chip click → navigate to Intelligence list filtered by that tag (query param ?tags=xyz).

6) Visual system / tokens
	•	Typography: Title 24–28px semibold; section headers 16–18px bold; body 14–16px.
	•	Spacing: Use 24px section spacing, 12–16px between items.
	•	Badges:
	•	Severity colors: Low #6BBF59, Medium #F5A524, High #E4572E, Critical #B00020.
	•	Status colors: Open #1E88E5, Resolved #2E7D32, In Review #8E24AA.
	•	Cards: 1px border, 8px radius, subtle shadow on hover.
	•	Skeletons: 8px radius, 60% lightness.

7) Test scenarios Amazon Q should support
	1.	Happy path (record exists, all sections filled).
	2.	No attachments → hide section.
	3.	No related items → show compact “No related intelligence yet.”
	4.	Feedback already submitted → buttons disabled and counts shown.
	5.	Slow network → skeletons visible ≥ 800ms.
	6.	403 on download → show inline error on that row only.

8) Deliverables from Amazon Q
	•	Frontend code (framework of choice, prefer React + TypeScript) with:
	•	IntelligenceDetails.tsx component
	•	api/intelligence.ts with typed clients
	•	State management (React Query or equivalent)
	•	Unit tests for render + behaviors
	•	Integration into route /intelligence/:id
	•	Environment config: API_BASE_URL
	•	README: run instructions

Acceptance criteria
	•	All fields from API render exactly as specified.
	•	PATCH on view increments viewerCount and sets lastViewedAt.
	•	Feedback POST updates counts immediately and persists.
	•	Clicking any attachment downloads the file.
	•	Related cards navigate and re-fetch.
	•	Accessibility checks pass (axe core: no critical issues).

⸻

If you want, I can also output a ready-to-drop React component with mock API calls so your team can run it locally.