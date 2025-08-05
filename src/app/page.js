"use client";

import { useState, useEffect } from "react";

export default function Page() {
  const [showStock, setShowStock] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [ingreso, setIngreso] = useState("");
  const [ingresoFijo, setIngresoFijo] = useState(false);
  const [items, setItems] = useState([]);

  // Cargar stock desde la API al iniciar
  useEffect(() => {
    fetch("/api/stock")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      });
  }, []);

  const addItem = async () => {
    if (!name || !price || !quantity || !ingreso) return;
    const ingresoNum = parseInt(ingreso);
    const cantidadNum = parseInt(quantity);
    if (cantidadNum > ingresoNum) return;
    const newItem = {
      name,
      price: parseFloat(price),
      quantity: cantidadNum,
    };
    // Guardar en la base de datos
    await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    // Refrescar lista
    const res = await fetch("/api/stock");
    const data = await res.json();
    setItems(data);
    setIngreso((prev) => (ingresoNum - cantidadNum).toString());
    setName("");
    setPrice("");
    setQuantity("");
    setIngresoFijo(true);
  };

  const handleDelete = async (id, quantityToReturn) => {
    // Eliminar en la base de datos
    await fetch("/api/stock", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    // Refrescar lista
    const res = await fetch("/api/stock");
    const data = await res.json();
    setItems(data);
    setIngreso((prev) => (parseInt(prev || "0") + quantityToReturn).toString());
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestor de Stock</h1>
      <div className="grid gap-4 mb-6">
        <div className="text-cyan-500 text-xl font-bold mb-2">
          Stock disponible: {ingreso || 0} G
        </div>
        <div>
          <button
            className="text-lg font-semibold flex items-center gap-2 focus:outline-none"
            type="button"
            onClick={() => setShowStock((prev) => !prev)}
          >
            <span>Ingresar stock</span>
            <span>{showStock ? "▲" : "▼"}</span>
          </button>
          {showStock && (
            <div className="mt-2 flex flex-col gap-2">
              <input
                className="border p-2 rounded"
                placeholder="Ingreso"
                type="number"
                value={ingreso}
                onChange={(e) => setIngreso(e.target.value)}
                disabled={ingresoFijo}
              />
            </div>
          )}
        </div>
        <input
          className="border p-2 rounded"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2 rounded"
          placeholder="Cantidad"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Precio"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button
          className="bg-cyan-500 text-white p-2 rounded"
          onClick={addItem}
        >
          Agregar producto
        </button>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="border p-4 rounded shadow flex flex-col gap-2"
          >
            <p>
              <strong>Nombre:</strong> {item.name}
            </p>
            <p>
              <strong>Precio:</strong> ${item.price.toFixed(2)}
            </p>
            <p>
              <strong>Cantidad:</strong> {item.quantity}
            </p>
            <button
              className="bg-red-500 text-white p-1 rounded w-fit"
              onClick={() => handleDelete(item.id, item.quantity)}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
