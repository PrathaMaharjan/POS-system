import { NextResponse } from 'next/server';

import { prisma } from '../../lib/db'; 



export async function GET() {
  try {
    // 1. Fetch tables from the database
    let dbTables = await prisma.table.findMany({
      orderBy: { label: 'asc' }
    });

    // 2. If database has no tables, seed the defaults automatically
    if (dbTables.length === 0) {
      await prisma.table.createMany({
        data: DEFAULT_TABLES
      });
      // Fetch them again after creation
      dbTables = await prisma.table.findMany({
        orderBy: { label: 'asc' }
      });
    }

    return NextResponse.json(dbTables);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}