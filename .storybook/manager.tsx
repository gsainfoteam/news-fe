import React from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { IconButton } from "storybook/internal/components";
import { addons, types, useGlobals } from "storybook/manager-api";

// One-click light/dark toggle; @storybook/addon-themes only offers a dropdown.
function ThemeToggle() {
  const [globals, updateGlobals] = useGlobals();
  const dark = globals.theme === "dark";

  return (
    <IconButton
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      active={dark}
      onClick={() => updateGlobals({ theme: dark ? "light" : "dark" })}
    >
      {dark ? <SunIcon size={14} /> : <MoonIcon size={14} />}
    </IconButton>
  );
}

addons.register("news-fe/theme", () => {
  addons.add("news-fe/theme/toggle", {
    type: types.TOOL,
    title: "Dark mode",
    render: ThemeToggle,
  });
});
