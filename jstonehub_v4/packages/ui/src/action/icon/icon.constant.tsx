import type { JSX } from "solid-js";

import type { ComponentSize } from "../../_model/type";
import type { IconName } from "./_icon.type";

import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  Home,
  Info,
  LogOut,
  Minus,
  MoreHorizontal,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  SortAsc,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-solid";

const ICON_SIZE: Record<ComponentSize, number> = {
  sm: 16,
  md: 18,
  lg: 20,
};

const ICON_SIZE_OVERRIDE: Partial<
  Record<IconName, Record<ComponentSize, number>>
> = {
  close: { sm: 14, md: 16, lg: 18 },
};

const ICON_MAP: Record<
  IconName,
  (props: { size: number; class?: string }) => JSX.Element
> = {
  close: (p) => <X aria-hidden="true" {...p} />,
  check: (p) => <Check aria-hidden="true" {...p} />,
  copy: (p) => <Copy aria-hidden="true" {...p} />,
  edit: (p) => <Pencil aria-hidden="true" {...p} />,
  delete: (p) => <Trash2 aria-hidden="true" {...p} />,
  save: (p) => <Save aria-hidden="true" {...p} />,
  add: (p) => <Plus aria-hidden="true" {...p} />,
  remove: (p) => <Minus aria-hidden="true" {...p} />,
  search: (p) => <Search aria-hidden="true" {...p} />,
  filter: (p) => <Filter aria-hidden="true" {...p} />,
  sort: (p) => <SortAsc aria-hidden="true" {...p} />,
  chevronDown: (p) => <ChevronDown aria-hidden="true" {...p} />,
  chevronUp: (p) => <ChevronUp aria-hidden="true" {...p} />,
  chevronLeft: (p) => <ChevronLeft aria-hidden="true" {...p} />,
  chevronRight: (p) => <ChevronRight aria-hidden="true" {...p} />,
  info: (p) => <Info aria-hidden="true" {...p} />,
  warning: (p) => <AlertTriangle aria-hidden="true" {...p} />,
  error: (p) => <AlertCircle aria-hidden="true" {...p} />,
  success: (p) => <CheckCircle2 aria-hidden="true" {...p} />,
  settings: (p) => <Settings aria-hidden="true" {...p} />,
  logout: (p) => <LogOut aria-hidden="true" {...p} />,
  user: (p) => <User aria-hidden="true" {...p} />,
  home: (p) => <Home aria-hidden="true" {...p} />,
  externalLink: (p) => <ExternalLink aria-hidden="true" {...p} />,
  download: (p) => <Download aria-hidden="true" {...p} />,
  upload: (p) => <Upload aria-hidden="true" {...p} />,
  refresh: (p) => <RefreshCw aria-hidden="true" {...p} />,
  eye: (p) => <Eye aria-hidden="true" {...p} />,
  eyeOff: (p) => <EyeOff aria-hidden="true" {...p} />,
  plus: (p) => <Plus aria-hidden="true" {...p} />,
  minus: (p) => <Minus aria-hidden="true" {...p} />,
  moreHorizontal: (p) => <MoreHorizontal aria-hidden="true" {...p} />,
  moreVertical: (p) => <MoreVertical aria-hidden="true" {...p} />,
};

export { ICON_MAP, ICON_SIZE, ICON_SIZE_OVERRIDE };
