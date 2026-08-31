import { QueryDevtool } from "./query-devtool";
import { RouterDevtool } from "./router-devtool";

function Devtools() {
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div class="hidden lg:block">
      <RouterDevtool />
      <QueryDevtool />
    </div>
  );
}

export { Devtools };
