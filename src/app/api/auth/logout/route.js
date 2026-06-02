export async function POST() {
  const res = Response.json({ success: true });
  res.headers.set('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; Path=/');
  return res;
}