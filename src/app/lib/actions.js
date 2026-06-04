"use server";

import { prisma } from './db';
import { revalidatePath } from 'next/cache';



// Fetch live items from your actual "Product" table
export async function getMenuItems() {
  try {

    return await prisma.product.findMany(); 
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    return [];
  }
}


export async function saveMenuItem(data, editingId = null) {
  try {
    // Mapped precisely to your pgAdmin columns: name, price, category, imageUrl
    const payload = {
      name: data.name,
      category: data.category,
      price: parseFloat(data.price),
      imageUrl: data.img || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400', 
    };

    if (editingId) {
      await prisma.product.update({
        where: { id: editingId },
        data: payload
      });
    } else {
      await prisma.product.create({ data: payload });
    }
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Failed to save menu item:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMenuItem(id) {
  try {
    await prisma.product.delete({
      where: { id }
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    return { success: false };
  }
}



export async function getTables() {
  try {
    // Capitalized Table matching your exact model name setup
    return await prisma.table.findMany(); 
  } catch (error) {
    console.error("Failed to fetch tables:", error);
    return [];
  }
}

export async function addTable(data) {
  try {
    await prisma.table.create({
      data: {
        name: data.name,
        seats: parseInt(data.seats),
        status: data.status || 'Available',
        shape: data.shape || 'square',
      }
    });
    revalidatePath('/admin');
    revalidatePath('/cashier/tables');
    return { success: true };
  } catch (error) {
    console.error("Failed to add table:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleTableStatusInDb(id, currentStatus) {
  try {
    const nextStatus = currentStatus === 'Available' ? 'Occupied' : 'Available';
    await prisma.table.update({
      where: { id },
      data: { status: nextStatus }
    });
    revalidatePath('/admin');
    revalidatePath('/cashier/tables');
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle table status:", error);
    return { success: false };
  }
}