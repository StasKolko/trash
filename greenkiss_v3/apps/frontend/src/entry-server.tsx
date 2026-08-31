import { renderToStringAsync, generateHydrationScript } from "solid-js/web";
import AppRouter from "./app/router";

export async function render(url: string) {
  const body = await renderToStringAsync(() => <AppRouter url={url} />);
  const hydration = generateHydrationScript();
  return { body, hydration };
}
