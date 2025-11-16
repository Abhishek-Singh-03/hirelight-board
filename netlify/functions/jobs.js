const JOBS_URL = "https://opensheet.elk.sh/1s1a2XpHEmQnIATVQwK2VXszUPwAh306GWtkYbkBfFOY/Sheet1";

exports.handler = async function (event, context) {
  try {
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
