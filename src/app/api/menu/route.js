import { prisma } from '../../lib/db';

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { name: 'asc' },
  });

  const categories = [...new Set(products.map(p => p.category))];

  return Response.json({ items: products, categories });
}