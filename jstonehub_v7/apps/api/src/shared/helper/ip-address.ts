function extractIpAddress(input: {
  request: Request;
  server: { requestIP: (req: Request) => { address: string } | null } | null;
}) {
  const forwardedFor = input.request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();

    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = input.request.headers.get("x-real-ip");

  if (realIp) {
    return realIp;
  }

  const serverIp = input.server?.requestIP(input.request);

  if (serverIp) {
    return serverIp.address;
  }

  return null;
}

export { extractIpAddress };
