import { prisma } from '../../../lib/db';

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      include: { outlet: true },
      orderBy: { createdAt: 'desc' },
    });
    return Response.json({ success: true, data: staff });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}