import { client } from "#hub/shared/api/client";

async function exchangeAuthCode() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("auth_code");

  if (!code) {
    return;
  }

  url.searchParams.delete("auth_code");
  window.history.replaceState({}, "", url.pathname + url.search);

  await client.v1.auth.exchange.post({ code });
}

export { exchangeAuthCode };
