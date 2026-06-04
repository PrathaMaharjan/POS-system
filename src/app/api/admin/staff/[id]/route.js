import { prisma } from '../../../../lib/db';
import bcrypt from 'bcryptjs';

export async function PATCH(req, { params }) {
  const { id } = await params;
  const { name, pin, role, password } = await req.json();
  try {
    const data = { name, pin, role };
    if (password) data.password = await bcrypt.hash(password, 10);
    const staff = await prisma.staff.update({ where: { id }, data });
    return Response.json({ success: true, data: staff });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  try {
    await prisma.staff.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}