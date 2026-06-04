import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export async function GET() {
  try {
    const outlets = await prisma.outlet.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: outlets });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const outlet = await prisma.outlet.create({ data: body });
    return NextResponse.json({ success: true, data: outlet });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}