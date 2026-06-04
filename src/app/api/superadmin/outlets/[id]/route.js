import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const outlet = await prisma.outlet.update({
      where: { id },
      data: {
        ...(body.name     !== undefined && { name:     body.name }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.status   !== undefined && { status:   body.status }),
        ...(body.seats    !== undefined && { seats:    body.seats ? parseInt(body.seats) : null }),
        ...(body.phone    !== undefined && { phone:    body.phone || null }),
        ...(body.manager  !== undefined && { manager:  body.manager || null }),
      },
    });
    return NextResponse.json({ success: true, data: outlet });
  } catch (err) {
    console.error('PATCH outlet error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    const { id } = await params;
    await prisma.outlet.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}