/*
 * Shared matrix content for the list-item fusion prototypes (2026-09-05).
 * One realistic product surface — "Workspace settings" — reused verbatim by
 * every strategy variant, so flipping the picker compares ARCHITECTURE,
 * not content. Nothing here imports production code.
 */

export const notifRows = [
  {
    key: 'mentions',
    label: 'Mentions and comments',
    description: 'New replies on threads you follow across repos',
  },
  {
    key: 'deploys',
    label: 'Deploy results',
    description: 'Pipeline outcomes for repositories you watch',
  },
  {
    key: 'security',
    label: 'Security alerts',
    description: 'Critical findings from code scanning',
  },
  {
    key: 'digest',
    label: 'Digest email',
    description: 'One rolled-up summary, sent to your address',
  },
  {
    key: 'retention',
    label: 'Auto-archive after',
    description: 'Read notifications older than N days disappear',
  },
] as const;

export const members = [
  { name: 'Ada Lovelace', handle: 'ada', role: 'Owner', initials: 'AL' },
  { name: 'Grace Hopper', handle: 'grace', role: 'Admin', initials: 'GH' },
  { name: 'Alan Kay', handle: 'kay', role: 'Member', initials: 'AK' },
] as const;

export const events = [
  { title: 'build-web.yml', meta: 'succeeded in 2m 14s', when: '12:04' },
  { title: 'release.yml', meta: 'running — shard 3 of 8', when: 'now' },
  { title: 'deploy-edge.yml', meta: 'failed on smoke test', when: '11:47' },
] as const;

export const tagSuggestions = ['urgent', 'flaky', 'needs-triage', 'infra', 'docs'];
