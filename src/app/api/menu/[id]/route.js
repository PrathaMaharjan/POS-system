import { prisma } from '../../../lib/db';

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        price: parseFloat(data.price),
        imageUrl: data.imageUrl,
      },
    });
    return Response.json(product);
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}