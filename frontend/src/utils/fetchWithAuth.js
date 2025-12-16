export async function fetchWithAuth(url, optionsOrToken = {}, maybeToken) {
  // Allow both signatures: (url, options, token) and (url, token, options)
  const token =
    typeof optionsOrToken === "string" ? optionsOrToken : maybeToken;
  const options =
    typeof optionsOrToken === "string" ? maybeToken || {} : optionsOrToken || {};

  if (!token) throw new Error("No token provided");

  let body = options.body;
  const isPlainObject =
    body &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof Blob);
  if (isPlainObject) {
    body = JSON.stringify(body);
  }

  const res = await fetch(url, {
    ...options,
    body,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type":
        options.body instanceof FormData
          ? undefined
          : options.headers?.["Content-Type"] || "application/json",
      ...(options.headers || {}),
    },
  });

  const contentType = res.headers?.get?.("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" && data.slice(0, 200)) ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}
