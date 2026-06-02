import { prisma } from '../../../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  const { employeeId, password } = await req.json();

  const staff = await prisma.staff.findUnique({
    where: { pin: employeeId },
  });

  if (!staff) {
    return Response.json({ success: false, message: 'Employee not found' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, staff.password);
  if (!valid) {
    return Response.json({ success: false, message: 'Incorrect password' }, { status: 401 });
  }

  const token = jwt.sign(
    { id: staff.id, name: staff.name, role: staff.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  const res = Response.json({ success: true, role: staff.role, name: staff.name });
  res.headers.set('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=28800; SameSite=Strict`);
  return res;
}