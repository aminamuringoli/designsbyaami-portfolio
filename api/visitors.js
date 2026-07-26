const COUNTER_URL = "https://api.counterapi.dev/v1/designsbyaami-live/homepage-visitors";

module.exports = async function visitors(request, response) {
  if (request.method !== "GET" && request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const action = request.method === "POST" ? "/up" : "";

  try {
    const counterResponse = await fetch(`${COUNTER_URL}${action}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (!counterResponse.ok) {
      throw new Error(`Counter service responded with ${counterResponse.status}`);
    }

    const data = await counterResponse.json();
    const count = Number(data.count);

    if (!Number.isFinite(count) || count < 1) {
      throw new Error("Counter service returned an invalid count");
    }

    response.setHeader("Cache-Control", "no-store, max-age=0");
    response.status(200).json({ count });
  } catch {
    response.setHeader("Cache-Control", "no-store, max-age=0");
    response.status(503).json({ error: "Visitor count is temporarily unavailable" });
  }
};
