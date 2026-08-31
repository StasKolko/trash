import { hydrate } from "solid-js/web";
import AppRouter from "./app/router";
import "./app/styles/index.css";

hydrate(() => <AppRouter />, document.getElementById("app")!);
