import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BotonEliminarReserva } from "./boton-eliminar";
import { tarjeta } from "@/lib/estilos";

const etiquetaEstado: Record<string, string> = {
  pendiente: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmada: "bg-green-50 text-green-700 border-green-200",
  cancelada: "bg-gray-100 text-gray-500 border-gray-200",
};

// Ejercicio 3: Filtrado por estado
// Lee el parámetro "estado" de la URL y filtra las reservas en Prisma
export default async function PaginaReservas({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;

  const reservas = await prisma.reserva.findMany({
    orderBy: { fecha: "asc" },
    include: { servicio: true },
    // Si hay un estado en la URL, filtra por ese estado
    where: estado ? { estado } : undefined,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Reservas</h1>
        <Link
          href="/reservas/nueva"
          className="bg-green-700 text-white px-4 py-2 rounded text-sm hover:bg-green-800 transition-colors"
        >
          Nueva reserva
        </Link>
      </div>

      {/* Ejercicio 3: Botones de filtro por estado */}
      <div className="flex gap-2 mb-6">
        <Link
          href="/reservas"
          className={`text-xs px-3 py-1 rounded border transition-colors ${!estado ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-500 border-gray-200 hover:text-black"}`}
        >
          Todas
        </Link>
        <Link
          href="/reservas?estado=pendiente"
          className={`text-xs px-3 py-1 rounded border transition-colors ${estado === "pendiente" ? "bg-yellow-500 text-white border-yellow-500" : "bg-white text-gray-500 border-gray-200 hover:text-black"}`}
        >
          Pendientes
        </Link>
        <Link
          href="/reservas?estado=confirmada"
          className={`text-xs px-3 py-1 rounded border transition-colors ${estado === "confirmada" ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-500 border-gray-200 hover:text-black"}`}
        >
          Confirmadas
        </Link>
        <Link
          href="/reservas?estado=cancelada"
          className={`text-xs px-3 py-1 rounded border transition-colors ${estado === "cancelada" ? "bg-gray-500 text-white border-gray-500" : "bg-white text-gray-500 border-gray-200 hover:text-black"}`}
        >
          Canceladas
        </Link>
      </div>

      {reservas.length === 0 ? (
        <p className="text-sm text-gray-400">No hay reservas registradas.</p>
      ) : (
        <ul className="space-y-3">
          {reservas.map((reserva) => (
            <li
              key={reserva.id}
              className={`${tarjeta} flex items-start justify-between`}
            >
              <div>
                <p className="font-medium text-sm text-gray-900">{reserva.nombre}</p>
                <p className="text-xs text-gray-600 mt-0.5">{reserva.correo}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {reserva.servicio.nombre} —{" "}
                  {new Date(reserva.fecha).toLocaleString("es-SV")}
                </p>
                <span
                  className={`inline-block mt-2 text-xs px-2 py-0.5 rounded border ${
                    etiquetaEstado[reserva.estado] ?? etiquetaEstado.pendiente
                  }`}
                >
                  {reserva.estado}
                </span>
              </div>
              <BotonEliminarReserva id={reserva.id} estado={reserva.estado} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}