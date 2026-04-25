exports.handler = async function (event, context) {
  try {
    const JOBS_URL = process.env.VITE_DEV_API;
    
    // Explicit error if Netlify hasn't successfully loaded the environment variable
    if (!JOBS_URL) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "VITE_DEV_API environment variable is missing on the server." }),
      };
    }

    const res = await fetch(JOBS_URL);
    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Upstream fetch failed" }),
      };
    }

    const data = await res.json();

    // Optionally: light caching headers (Netlify will respect cache-control)
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60" // cache 60s; adjust as needed
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: String(err) }),
    };
  }
};
