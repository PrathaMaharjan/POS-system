import { prisma } from '../../lib/db';

export async function POST(req) {

  const { items, type, tableId, staffId, paymentMethod, subtotal, tax, total, status } = await req.json();

  const order = await prisma.order.create({
    data: {
      type,
      paymentMethod,
      subtotal,
      tax,
      total,

      status: status || 'PENDING',
      staffId: staffId || null,
      tableId: tableId || null,
      items: {
        create: items.map(i => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          subtotal: i.product.price * i.quantity,
        }))
      }
    },
    include: { items: true }
  });

  return Response.json(order);
}

export async function GET() {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      staff: true,
      table: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return Response.json(orders);
}