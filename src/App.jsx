import React, { useState, useEffect } from "react";

/* =========================
   LocalStorage Helpers
========================= */

const LS = {
  fabrics: "sss_fabrics_v1",
  inventory: "sss_inventory_v1",
  txns: "sss_txns_v1",
};

function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* =========================
   Seed Data
========================= */

const SEED_FABRICS = [
  { id: "f1", name: "Egyptian Cotton", composition: "100% Cotton" },
  { id: "f2", name: "Silk Charmeuse", composition: "100% Silk" },
  { id: "f3", name: "Wool Tweed", composition: "80% Wool 20% Poly" },
];

const SEED_INVENTORY = [
  { id: "i1", fabricId: "f1", department: "TL", qty: 120 },
  { id: "i2", fabricId: "f2", department: "TL", qty: 80 },
  { id: "i3", fabricId: "f1", department: "SWATCHES", qty: 200 },
];

/* =========================
   App Component
========================= */

export default function App() {
  const [fabrics, setFabrics] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedFabric, setSelectedFabric] = useState("");
  const [qty, setQty] = useState("");
  const [dept, setDept] = useState("TL");

  /* Load data */
  useEffect(() => {
    const f = lsGet(LS.fabrics, SEED_FABRICS);
    const i = lsGet(LS.inventory, SEED_INVENTORY);
    const t = lsGet(LS.txns, []);
    setFabrics(f);
    setInventory(i);
    setTransactions(t);
  }, []);

  /* Save data */
  useEffect(() => {
    lsSet(LS.fabrics, fabrics);
  }, [fabrics]);

  useEffect(() => {
    lsSet(LS.inventory, inventory);
  }, [inventory]);

  useEffect(() => {
    lsSet(LS.txns, transactions);
  }, [transactions]);

  /* Add Stock */
  const addStock = () => {
    if (!selectedFabric || !qty) return;

    const found = inventory.find(
      (i) =>
        i.fabricId === selectedFabric && i.department === dept
    );

    if (found) {
      const updated = inventory.map((i) =>
        i.id === found.id
          ? { ...i, qty: i.qty + parseInt(qty) }
          : i
      );
      setInventory(updated);
    } else {
      const newItem = {
        id: Date.now().toString(),
        fabricId: selectedFabric,
        department: dept,
        qty: parseInt(qty),
      };
      setInventory([...inventory, newItem]);
    }

    setTransactions([
      ...transactions,
      {
        id: Date.now().toString(),
        type: "ADD",
        fabricId: selectedFabric,
        department: dept,
        qty: parseInt(qty),
        date: new Date().toISOString(),
      },
    ]);

    setQty("");
  };

  /* Dispatch Stock */
  const dispatchStock = () => {
    if (!selectedFabric || !qty) return;

    const found = inventory.find(
      (i) =>
        i.fabricId === selectedFabric && i.department === dept
    );

    if (!found || found.qty < parseInt(qty)) {
      alert("Not enough stock");
      return;
    }

    const updated = inventory.map((i) =>
      i.id === found.id
        ? { ...i, qty: i.qty - parseInt(qty) }
        : i
    );
    setInventory(updated);

    setTransactions([
      ...transactions,
      {
        id: Date.now().toString(),
        type: "DISPATCH",
        fabricId: selectedFabric,
        department: dept,
        qty: parseInt(qty),
        date: new Date().toISOString(),
      },
    ]);

    setQty("");
  };

  /* Helper */
  const fabricName = (id) =>
    fabrics.find((f) => f.id === id)?.name || "";

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>Sample Stock System — PWA</h2>

      <hr />

      <h3>Transaction</h3>

      <select
        value={selectedFabric}
        onChange={(e) => setSelectedFabric(e.target.value)}
      >
        <option value="">Select Fabric</option>
        {fabrics.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>

      <select
        value={dept}
        onChange={(e) => setDept(e.target.value)}
      >
        <option value="TL">TL</option>
        <option value="SWATCHES">Swatches</option>
      </select>

      <input
        type="number"
        placeholder="Quantity"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
      />

      <button onClick={addStock}>Add</button>
      <button onClick={dispatchStock}>Dispatch</button>

      <hr />

      <h3>Current Inventory</h3>

      <ul>
        {inventory.map((item) => (
          <li key={item.id}>
            {fabricName(item.fabricId)} | {item.department} | Qty:{" "}
            {item.qty}
          </li>
        ))}
      </ul>

      <hr />

      <h3>Transactions</h3>

      <ul>
        {transactions.map((t) => (
          <li key={t.id}>
            {t.type} | {fabricName(t.fabricId)} |{" "}
            {t.department} | {t.qty}
          </li>
        ))}
      </ul>
    </div>
  );
}
