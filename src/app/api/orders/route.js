import { NextResponse } from 'next/server';
import { prisma } from '../../lib/db';
import { getCurrentUser } from '../../lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    const orders = await prisma.order.findMany({
      where: user?.outletId ? { outletId: user.outletId } : {},
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (err) {
    console.error('❌ Failed to load orders:', err);
    return NextResponse.json([], { status: 500 });
  }
}



export async function POST(req) {
  try {
    const user = await getCurrentUser();
    const { items, type, tableId, staffId, paymentMethod, subtotal, tax, total, status } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Empty cart.' }, { status: 400 });
    }

    // ✅ Find any outlet to fall back on if user has none
    let outletId = user?.outletId;
    if (!outletId) {
      const firstOutlet = await prisma.outlet.findFirst();
      if (!firstOutlet) {
        return NextResponse.json({ success: false, error: 'No outlet exists in the system.' }, { status: 500 });
      }
      outletId = firstOutlet.id;
    }

    const order = await prisma.order.create({
      data: {
        type: type || 'TAKEAWAY',
        paymentMethod: paymentMethod || 'Cash',
        subtotal: parseFloat(subtotal) || 0,
        tax: parseFloat(tax) || 0,
        total: parseFloat(total) || 0,
        status: status || 'PENDING',
        tableId: tableId || null,
        staffId: staffId || null,
        outletId,
        items: {
          create: await Promise.all(items.map(async (item) => {
            const p = item.product || {};
            const price = parseFloat(p.price) || 0;
            const qty = parseInt(item.quantity) || 1;

            // ✅ Verify productId actually exists in DB before using it
            let productId = p.id || null;
            if (productId) {
              const exists = await prisma.product.findUnique({ where: { id: productId } });
              if (!exists) productId = null;
            }

            // ✅ If no valid productId, find/create a placeholder product
            if (!productId) {
              const placeholder = await prisma.product.findFirst({
                where: { name: p.name || 'Unknown Item', outletId }
              });
              productId = placeholder?.id;

              if (!productId) {
                const created = await prisma.product.create({
                  data: {
                    name: p.name || 'Unknown Item',
                    price,
                    category: 'Uncategorized',
                    outletId,
                  }
                });
                productId = created.id;
              }
            }

            return {
              productId,
              name: p.name || 'Unknown Item',
              price,
              quantity: qty,
              subtotal: price * qty,
            };
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, data: order });
  } catch (err) {
    console.error('Order error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}