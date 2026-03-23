"use client";

import { eliminarReserva, confirmarReserva, cancelarReserva } from "@/app/actions/reservas";
import { useState } from "react";
import { botonPeligro } from "@/lib/estilos";

export function BotonEliminarReserva({ id, estado }: { id: number, estado: string }) {
  const [error, setError] = useState<string | null>(null);

  async function manejarEliminar() {
    const resultado = await eliminarReserva(id);
    if (!resultado.exito) setError(resultado.mensaje ?? "Error desconocido.");
  }

  async function manejarConfirmar() {
    const resultado = await confirmarReserva(id);
    if (!resultado.exito) setError(resultado.mensaje ?? "Error desconocido.");
  }

  async function manejarCancelar() {
    const resultado = await cancelarReserva(id);
    if (!resultado.exito) setError(resultado.mensaje ?? "Error desconocido.");
  }
      //BOTON PARA CANCELAR Y CONFIRMAR, solo aparecen segun el estado actual de la reserva
  return (
    <div className="text-right shrink-0 ml-4 flex flex-col gap-2">
      {estado === "pendiente" && (
        <button onClick={manejarConfirmar} className="text-sm text-green-500 hover:text-green-700 transition-colors">
          Confirmar
        </button>
      )}
      {estado !== "cancelada" && (
        <button onClick={manejarCancelar} className="text-sm text-yellow-500 hover:text-yellow-700 transition-colors">
          Cancelar
        </button>
      )}
      <button onClick={manejarEliminar} className={botonPeligro}>
        Eliminar
      </button>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}