import { Router, Route } from "@solidjs/router";
import { lazy, Component, Suspense } from "solid-js";
import { Layout } from "./layout";
import { MetaProvider } from "@solidjs/meta";

type ComponentModule = { default: Component };

const lazyWithLog = (loader: () => Promise<ComponentModule>) =>
  lazy(async () => {
    console.time("route-chunk");
    const mod = await loader();
    console.timeEnd("route-chunk");
    return mod;
  });

const HomePage = lazyWithLog(() => import("../pages/home-page"));
const ProgressPage = lazyWithLog(() => import("../pages/progress-page"));
const AboutPage = lazyWithLog(() => import("../pages/about-page"));

const AppRouter: Component<{ url?: string }> = (props) => {
  return (
    <MetaProvider>
      <Suspense fallback={<div class="text-gray-400">Загрузка...</div>}>
        <Router url={props.url} root={Layout}>
          <Route path="/" component={HomePage} />
          <Route path="/progress" component={ProgressPage} />
          <Route path="/about" component={AboutPage} />
        </Router>
      </Suspense>
    </MetaProvider>
  );
};

export default AppRouter;
