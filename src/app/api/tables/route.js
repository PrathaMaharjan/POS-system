import { prisma } from '../../lib/db';

export async function GET() {
  const tables = await prisma.table.findMany({
    orderBy: { label: 'asc' },
  });
  return Response.json(tables);
}

export async function POST(req) {
  const { name, seats, status, shape } = await req.json();
  try {
    const table = await prisma.table.create({
      data: {
        label: name,
        seats: parseInt(seats),
        status: status.toLowerCase(),
        shape,
      },
    });
    return Response.json({ success: true, table });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const { id, currentStatus } = await req.json();
  const newStatus = currentStatus === 'Available' ? 'occupied' : 'available';
  try {
    const table = await prisma.table.update({
      where: { id },
      data: { status: newStatus },
    });
    return Response.json({ success: true, table });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}