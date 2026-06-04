// src/app/api/admin/staff/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import bcrypt from 'bcryptjs';

// ==========================================================
// GET: Pull all admins and cashiers directly from Postgres
// ==========================================================
export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      where: {
        role: { in: ['ADMIN', 'CASHIER'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: staff });
  } catch (err) {
    console.error("Staff local GET error:", err);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

// ==========================================================
// POST: Force write new team profiles straight to out-001
// ==========================================================
export async function POST(req) {
  try {
    const { name, pin, password, role } = await req.json();

    if (!name || !pin || !password) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Double check PIN usage
    const existingPin = await prisma.staff.findUnique({ where: { pin } });
    if (existingPin) {
      return NextResponse.json({ success: false, error: "PIN code is already taken." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newStaff = await prisma.staff.create({
      data: { 
        name, 
        pin, 
        password: hashed, 
        role: role || 'CASHIER', 
        outletId: 'out-001' // Explicitly pins new operators straight to Delights branch
      },
    });

    return NextResponse.json({ success: true, data: newStaff });
  } catch (err) {
    console.error("Staff local POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}