export async function GET(req) {
  const res = await fetch("https://randomuser.me/api/?results=5");

  if (!res.ok) {
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
      status: 500,
    });
  }

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
