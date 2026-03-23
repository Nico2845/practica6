"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const EsquemaReserva = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio."),
  correo: z.string().email("El correo no es válido."),
  fecha: z.string().min(1, "La fecha es obligatoria."),
  servicioId: z.coerce.number({ message: "Debe seleccionar un servicio." }),
});

// EJERCICIO 1: VALIDACIÓN DE DISPONIBILIDAD 
// Verifica que no haya conflicto de horario antes de crear la reserva
export async function crearReserva(_estadoPrevio: any, formData: FormData) {
  const campos = EsquemaReserva.safeParse({
    nombre: formData.get("nombre"),
    correo: formData.get("correo"),
    fecha: formData.get("fecha"),
    servicioId: formData.get("servicioId"),
  });

  if (!campos.success) {
    return {
      errores: campos.error.flatten().fieldErrors,
      mensaje: "Error de validación.",
    };
  }

  const fechaNueva = new Date(campos.data.fecha);

  // Obtener la duración del servicio seleccionado
  const servicio = await prisma.servicio.findUnique({
    where: { id: campos.data.servicioId },
  });

  if (!servicio) {
    return {
      errores: {},
      mensaje: "El servicio seleccionado no existe.",
    };
  }

  // Calcular el fin de la nueva reserva
  const finNueva = new Date(fechaNueva.getTime() + servicio.duracion * 60000);

  // Buscar reservas existentes para el mismo servicio que no estén canceladas
  const reservasExistentes = await prisma.reserva.findMany({
    where: {
      servicioId: campos.data.servicioId,
      estado: { not: "cancelada" },
    },
    include: { servicio: true },
  });

  // Verificar si hay conflicto de horario
  const hayConflicto = reservasExistentes.some((r) => {
    const inicioExistente = new Date(r.fecha);
    const finExistente = new Date(
      inicioExistente.getTime() + r.servicio.duracion * 60000
    );
    return fechaNueva < finExistente && finNueva > inicioExistente;
  });

  if (hayConflicto) {
    return {
      errores: {},
      mensaje: `Ya existe una reserva para ese servicio en ese horario. Por favor elige otro horario.`,
    };
  }

  await prisma.reserva.create({
    data: {
      nombre: campos.data.nombre,
      correo: campos.data.correo,
      fecha: fechaNueva,
      servicioId: campos.data.servicioId,
    },
  });

  revalidatePath("/reservas");
  redirect("/reservas");
}

export async function eliminarReserva(id: number) {
  try {
    await prisma.reserva.delete({ where: { id } });
    revalidatePath("/reservas");
    return { exito: true };
  } catch {
    return { exito: false, mensaje: "No se pudo eliminar la reserva." };
  }
}

// EJERCICIO 2: CANCELACIÓN DE RESERVAS 
// En lugar de eliminar, cambia el estado a "cancelada"

export async function cancelarReserva(id: number) {
  try {
    await prisma.reserva.update({
      where: { id },
      data: { estado: "cancelada" },
    });
    revalidatePath("/reservas");
    return { exito: true };
  } catch {
    return { exito: false, mensaje: "No se pudo cancelar la reserva." };
  }
}


//EJERCICIO 4: CONFIRMACIÓN DE RESERVAS 
//Cambia el estado de "pendiente" a "confirmada"

export async function confirmarReserva(id: number) {
  try {
    await prisma.reserva.update({
      where: { id },
      data: { estado: "confirmada" },
    });
    revalidatePath("/reservas");
    return { exito: true };
  } catch {
    return { exito: false, mensaje: "No se pudo confirmar la reserva." };
  }
}