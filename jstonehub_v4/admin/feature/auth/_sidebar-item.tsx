import type { SidebarItem } from "@packages/ui/layout";

import { Link } from "@tanstack/solid-router";
import {
  Database,
  Fingerprint,
  Globe,
  Home,
  KeyRound,
  Laugh,
  Server,
  Tag,
} from "lucide-solid";

const GROUP_CHILD_ROUTES: Record<string, string[]> = {
  Infrastructure: [
    "/infrastructure/browser-fingerprint",
    "/infrastructure/secret-voicer-credential",
    "/storage",
  ],
  Content: ["/content/joke", "/content/language", "/content/tag"],
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    type: "link",
    icon: (props) => <Home size={props.size} />,
    label: "Home",
    render: (renderProps) => (
      <Link
        to="/"
        class={renderProps.class}
        ref={renderProps.ref}
        onMouseEnter={renderProps.onMouseEnter}
        onMouseLeave={renderProps.onMouseLeave}
        onFocus={renderProps.onFocus}
        onBlur={renderProps.onBlur}
        activeOptions={{ exact: true }}
      >
        {renderProps.children}
      </Link>
    ),
  },
  { type: "separator" },
  {
    type: "group",
    icon: (props) => <Server size={props.size} />,
    label: "Infrastructure",
    defaultOpen: true,
    children: [
      {
        icon: (props) => <Fingerprint size={props.size} />,
        label: "Fingerprints",
        render: (renderProps) => (
          <Link
            to="/infrastructure/browser-fingerprint"
            search={{}}
            class={renderProps.class}
            ref={renderProps.ref}
            onMouseEnter={renderProps.onMouseEnter}
            onMouseLeave={renderProps.onMouseLeave}
            onFocus={renderProps.onFocus}
            onBlur={renderProps.onBlur}
          >
            {renderProps.children}
          </Link>
        ),
      },
      {
        icon: (props) => <KeyRound size={props.size} />,
        label: "Secret Voicer",
        render: (renderProps) => (
          <Link
            to="/infrastructure/secret-voicer-credential"
            class={renderProps.class}
            ref={renderProps.ref}
            onMouseEnter={renderProps.onMouseEnter}
            onMouseLeave={renderProps.onMouseLeave}
            onFocus={renderProps.onFocus}
            onBlur={renderProps.onBlur}
          >
            {renderProps.children}
          </Link>
        ),
      },
      {
        icon: (props) => <Database size={props.size} />,
        label: "Storage",
        render: (renderProps) => (
          <Link
            to="/storage"
            class={renderProps.class}
            ref={renderProps.ref}
            onMouseEnter={renderProps.onMouseEnter}
            onMouseLeave={renderProps.onMouseLeave}
            onFocus={renderProps.onFocus}
            onBlur={renderProps.onBlur}
          >
            {renderProps.children}
          </Link>
        ),
      },
    ],
  },
  {
    type: "group",
    icon: (props) => <Laugh size={props.size} />,
    label: "Content",
    defaultOpen: true,
    children: [
      {
        icon: (props) => <Laugh size={props.size} />,
        label: "Jokes",
        render: (renderProps) => (
          <Link
            to="/content/joke"
            class={renderProps.class}
            ref={renderProps.ref}
            onMouseEnter={renderProps.onMouseEnter}
            onMouseLeave={renderProps.onMouseLeave}
            onFocus={renderProps.onFocus}
            onBlur={renderProps.onBlur}
          >
            {renderProps.children}
          </Link>
        ),
      },
      {
        icon: (props) => <Globe size={props.size} />,
        label: "Languages",
        render: (renderProps) => (
          <Link
            to="/content/language"
            class={renderProps.class}
            ref={renderProps.ref}
            onMouseEnter={renderProps.onMouseEnter}
            onMouseLeave={renderProps.onMouseLeave}
            onFocus={renderProps.onFocus}
            onBlur={renderProps.onBlur}
          >
            {renderProps.children}
          </Link>
        ),
      },
      {
        icon: (props) => <Tag size={props.size} />,
        label: "Tags",
        render: (renderProps) => (
          <Link
            to="/content/tag"
            class={renderProps.class}
            ref={renderProps.ref}
            onMouseEnter={renderProps.onMouseEnter}
            onMouseLeave={renderProps.onMouseLeave}
            onFocus={renderProps.onFocus}
            onBlur={renderProps.onBlur}
          >
            {renderProps.children}
          </Link>
        ),
      },
    ],
  },
];

export { GROUP_CHILD_ROUTES, SIDEBAR_ITEMS };
