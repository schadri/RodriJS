"use client";

import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export default function Page() {
  const [showStock, setShowStock] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [ingreso, setIngreso] = useState("");
  const [ingresoFijo, setIngresoFijo] = useState(false);
  const [editandoStock, setEditandoStock] = useState(false);
  const [items, setItems] = useState([]);

  // Cargar productos y stock global al iniciar
  useEffect(() => {
    const fetchData = async () => {
      // Productos
      const querySnapshot = await getDocs(collection(db, "stock"));
      const docs = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setItems(docs);
      // Stock global
      const stockDoc = await getDoc(doc(db, "meta", "stockGlobal"));
      if (stockDoc.exists()) {
        setIngreso(stockDoc.data().valor.toString());
        setIngresoFijo(true);
      } else {
        setIngreso("");
        setIngresoFijo(false);
      }
    };
    fetchData();
  }, []);

  const addItem = async () => {
    if (!name || !price || !quantity || !ingreso) return;
    const ingresoNum = parseInt(ingreso);
    const cantidadNum = parseInt(quantity);
    if (cantidadNum > ingresoNum) return;
    const stockRestante = ingresoNum - cantidadNum;
    const fecha = new Date().toISOString();
    const newItem = {
      name,
      price: parseFloat(price),
      quantity: cantidadNum,
      fecha,
    };
    await addDoc(collection(db, "stock"), newItem);
    // Guardar el stock global actualizado
    await setDoc(doc(db, "meta", "stockGlobal"), { valor: stockRestante });
    // Refrescar lista y stock
    const querySnapshot = await getDocs(collection(db, "stock"));
    const docs = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setItems(docs);
    setIngreso(stockRestante.toString());
    setName("");
    setPrice("");
    setQuantity("");
    setIngresoFijo(true);
  };

  const handleDelete = async (id, quantityToReturn) => {
    await deleteDoc(doc(db, "stock", id));
    // Actualizar stock global
    const nuevoStock = parseInt(ingreso || "0") + quantityToReturn;
    await setDoc(doc(db, "meta", "stockGlobal"), { valor: nuevoStock });
    // Refrescar lista y stock
    const querySnapshot = await getDocs(collection(db, "stock"));
    const docs = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setItems(docs);
    setIngreso(nuevoStock.toString());
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
              <div className="flex gap-2 items-center">
                <input
                  className="border p-2 rounded"
                  placeholder="Ingreso"
                  type="number"
                  value={ingreso}
                  onChange={(e) => setIngreso(e.target.value)}
                  disabled={ingresoFijo && !editandoStock}
                />
                {(ingresoFijo || editandoStock) && (
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                    type="button"
                    onClick={async () => {
                      if (editandoStock) {
                        // Guardar el nuevo stock global en Firestore
                        await setDoc(doc(db, "meta", "stockGlobal"), {
                          valor: parseInt(ingreso),
                        });
                        setEditandoStock(false);
                        setIngresoFijo(true);
                      } else {
                        setEditandoStock(true);
                        setIngresoFijo(false);
                      }
                    }}
                  >
                    {editandoStock ? "OK" : "Editar stock disponible"}
                  </button>
                )}
              </div>
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
        {(() => {
          // Ordenar por fecha descendente
          const sortedItems = [...items].sort((a, b) =>
            (b.fecha || "") > (a.fecha || "") ? 1 : -1
          );
          let lastMonth = "";
          return sortedItems.map((item, idx) => {
            const fechaObj = item.fecha ? new Date(item.fecha) : null;
            const mes = fechaObj
              ? fechaObj.toLocaleString("es-ES", {
                  month: "long",
                  year: "numeric",
                })
              : "";
            const mostrarDivision = mes !== lastMonth;
            lastMonth = mes;
            return (
              <>
                {mostrarDivision && idx !== 0 && (
                  <div className="border-t border-gray-300 my-4">
                    <div className="text-gray-500 text-sm mt-2 mb-2 font-semibold">
                      {mes.charAt(0).toUpperCase() + mes.slice(1)}
                    </div>
                  </div>
                )}
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
                  {fechaObj && (
                    <p className="text-gray-500 text-xs">
                      <strong>Fecha:</strong>{" "}
                      {fechaObj.toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  <button
                    className="bg-red-500 text-white p-1 rounded w-fit"
                    onClick={() => handleDelete(item.id, item.quantity)}
                  >
                    Eliminar
                  </button>
                </div>
              </>
            );
          });
        })()}
      </div>
    </main>
  );
}
