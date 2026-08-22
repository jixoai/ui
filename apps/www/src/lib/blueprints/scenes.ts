/**
  Blueprint scene registry (apps/www/src/lib/blueprints/scenes.ts).
  ONE entry per CATALOG name — the gallery route renders them and
  test/blueprints.spec.ts locks the mapping (every catalog entry has a
  scene file AND a generated static/blueprints/<name>.svg). Scenes are
  authored by humans (and agents) one file at a time under scenes/;
  this file only wires the imports.
 */
import type { Component } from 'svelte';

import Accordion from './scenes/accordion.svelte';
import Alert from './scenes/alert.svelte';
import Avatar from './scenes/avatar.svelte';
import Badge from './scenes/badge.svelte';
import Breadcrumb from './scenes/breadcrumb.svelte';
import Dialog from './scenes/dialog.svelte';
import Empty from './scenes/empty.svelte';
import Input from './scenes/input.svelte';
import Kbd from './scenes/kbd.svelte';
import Popover from './scenes/popover.svelte';
import PressButton from './scenes/press-button.svelte';
import Progress from './scenes/progress.svelte';
import SectionCard from './scenes/section-card.svelte';
import Separator from './scenes/separator.svelte';
import Skeleton from './scenes/skeleton.svelte';
import Spin from './scenes/spin.svelte';
import Table from './scenes/table.svelte';
import Tabs from './scenes/tabs.svelte';
import Toast from './scenes/toast.svelte';
import Tooltip from './scenes/tooltip.svelte';

export const SCENES: Record<string, Component> = {
  accordion: Accordion,
  alert: Alert,
  avatar: Avatar,
  badge: Badge,
  breadcrumb: Breadcrumb,
  dialog: Dialog,
  empty: Empty,
  input: Input,
  kbd: Kbd,
  popover: Popover,
  'press-button': PressButton,
  progress: Progress,
  'section-card': SectionCard,
  separator: Separator,
  skeleton: Skeleton,
  spin: Spin,
  table: Table,
  tabs: Tabs,
  toast: Toast,
  tooltip: Tooltip,
};
