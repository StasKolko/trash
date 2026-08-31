import type { SidebarItem } from "@packages/ui/layout";

import { Link } from "@tanstack/solid-router";
import { AudioLines, Home, Mic, Wrench } from "lucide-solid";

const GROUP_CHILD_ROUTES: Record<string, string[]> = {
  Tools: ["/tool/audio-processing", "/tool/tts"],
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
    icon: (props) => <Wrench size={props.size} />,
    label: "Tools",
    defaultOpen: true,
    children: [
      {
        icon: (props) => <AudioLines size={props.size} />,
        label: "Audio Processing",
        render: (renderProps) => (
          <Link
            to="/tool/audio-processing"
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
        icon: (props) => <Mic size={props.size} />,
        label: "Text to Speech",
        render: (renderProps) => (
          <Link
            to="/tool/tts"
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
