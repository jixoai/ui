# The reui timeline official family inventory (fetched 2026-09-15, Gate-1)

The docs page's embedded registry data lists EXACTLY twelve free
items — `c-timeline-1` … `c-timeline-12`, all public (no PRO gating;
the r1-era "two PRO variants" claim was wrong and is retracted):

```
1: Basic timeline.
2: Timeline with roadmap.
3: Timeline with order status.
4: Timeline with git activity.
5: Timeline with milestones.
6: Timeline with pipeline steps.
7: Timeline with roadmap items.
8: Vertical timeline
9: Horizontal timeline with leading labels
10: Deployment log timeline
11: Activity feed timeline with user avatars
12: Compact horizontal milestone timeline
```

Extraction: `curl -s https://reui.io/components/timeline` then
`\"name\":\"c-timeline-(\d+)\",\"title\":\"([^\"]+)\"` over the
embedded JSON (verified by both the Gate reviewer and the
orchestrator, independently). Demo screenshots for families 1-4 in
this directory (`reui-demo-*.png`); the primitive source in
`reui-timeline-primitive.tsx`.

## The raw snapshot (added Gate-1, r4)

`reui-page-snapshot.html` — fetched 2026-09-15 (216067 bytes,
sha256 61e8004d49f58f2da5ae0aebf1ae4e39cc0d46c4e81fde3fa709032f43c9aa17), carries all 12 `c-timeline-n`
entries verbatim (re-extracted on save, 12/12).

## The c-timeline-n ↔ docs stage mapping (frozen for 4.2's probe)

Each family mounts ONE canvas stage on timeline.html; the stage's
`aria-label` is the ComponentCanvas title, the short slug used in
the probe:

| n | official title | docs stage aria-label | probe slug |
|---|----------------|----------------------|------------|
| 1 | Basic timeline | timeline demo · basic | basic |
| 2 | Timeline with roadmap | timeline demo · roadmap | roadmap |
| 3 | Timeline with order status | timeline demo · order status | order-status |
| 4 | Timeline with git activity | timeline demo · git activity | git-activity |
| 5 | Timeline with milestones | timeline demo · milestones | milestones |
| 6 | Timeline with pipeline steps | timeline demo · pipeline steps | pipeline-steps |
| 7 | Timeline with roadmap items | timeline demo · roadmap items | roadmap-items |
| 8 | Vertical timeline | timeline demo · vertical | vertical |
| 9 | Horizontal timeline with leading labels | timeline demo · horizontal leading labels | horizontal-leading |
| 10 | Deployment log timeline | timeline demo · deployment log | deployment-log |
| 11 | Activity feed timeline with user avatars | timeline demo · activity feed | activity-feed |
| 12 | Compact horizontal milestone timeline | timeline demo · compact horizontal milestone | compact-milestone |
