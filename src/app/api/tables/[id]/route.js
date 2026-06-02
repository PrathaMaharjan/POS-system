import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export async function PATCH(req, context) {
  try {
    const { id } = await context.params;
    const { status } = await req.json();

    const table = await prisma.table.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(table);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}