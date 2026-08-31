import { fireEvent, render, screen } from "@solidjs/testing-library";

import { DEFAULT_COMPONENT_SIZE } from "../_model/constant";
import { ICON_SIZE } from "../action/icon/icon.constant";
import { DEFAULT_THEME, THEME_OPPOSITE } from "./_theme.constant";
import { ModeToggle } from "./mode.toggle";
import { ThemeProvider } from "./theme.provider";

const DARK_TESTID = "dark-icon";
const LIGHT_TESTID = "light-icon";
const BTN_TESTID = "mode-toggle";

describe("[ModeToggle]", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.style.colorScheme = "";
  });

  it("should show correct icon for default theme, toggle on click, call onClick, and use default icon size", () => {
    const onClick = vi.fn();
    renderToggle(onClick);

    const btn = screen.getByTestId(BTN_TESTID);
    const defaultIconPx = ICON_SIZE[DEFAULT_COMPONENT_SIZE];

    if (DEFAULT_THEME === "dark") {
      const darkIcon = screen.getByTestId(DARK_TESTID);
      expect(darkIcon).toBeInTheDocument();
      expect(darkIcon).toHaveAttribute("width", String(defaultIconPx));
      expect(darkIcon).toHaveAttribute("height", String(defaultIconPx));
      expect(screen.queryByTestId(LIGHT_TESTID)).not.toBeInTheDocument();
    } else {
      const lightIcon = screen.getByTestId(LIGHT_TESTID);
      expect(lightIcon).toBeInTheDocument();
      expect(lightIcon).toHaveAttribute("width", String(defaultIconPx));
      expect(lightIcon).toHaveAttribute("height", String(defaultIconPx));
      expect(screen.queryByTestId(DARK_TESTID)).not.toBeInTheDocument();
    }

    fireEvent.click(btn);

    expect(onClick).toHaveBeenCalledOnce();

    const opposite = THEME_OPPOSITE[DEFAULT_THEME];
    if (opposite === "dark") {
      expect(screen.getByTestId(DARK_TESTID)).toBeInTheDocument();
      expect(screen.queryByTestId(LIGHT_TESTID)).not.toBeInTheDocument();
    } else {
      expect(screen.getByTestId(LIGHT_TESTID)).toBeInTheDocument();
      expect(screen.queryByTestId(DARK_TESTID)).not.toBeInTheDocument();
    }

    fireEvent.click(btn);

    expect(onClick).toHaveBeenCalledTimes(2);

    if (DEFAULT_THEME === "dark") {
      expect(screen.getByTestId(DARK_TESTID)).toBeInTheDocument();
      expect(screen.queryByTestId(LIGHT_TESTID)).not.toBeInTheDocument();
    } else {
      expect(screen.getByTestId(LIGHT_TESTID)).toBeInTheDocument();
      expect(screen.queryByTestId(DARK_TESTID)).not.toBeInTheDocument();
    }
  });
});

function renderToggle(onClick?: (e: MouseEvent) => void) {
  return render(() => (
    <ThemeProvider>
      <ModeToggle
        data-testid={BTN_TESTID}
        aria-label="Toggle theme"
        data-dark-testid={DARK_TESTID}
        data-light-testid={LIGHT_TESTID}
        onClick={onClick}
      />
    </ThemeProvider>
  ));
}
