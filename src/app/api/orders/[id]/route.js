import { prisma } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(req, context) {
  const { id } = await context.params;
  const { status } = await req.json();

  const order = await prisma.order.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });

  return NextResponse.json(order);
}