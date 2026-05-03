import { useMemo } from "react";

const CalendarGrid = ({ selectedDate, onSelectDate, markedDates = new Set() }) => {
  const baseDate = selectedDate ? new Date(selectedDate) : new Date();

  const monthMeta = useMemo(() => {
    const y = baseDate.getFullYear();
    const m = baseDate.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const offset = first.getDay();
    const cells = [];

    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(y, m, d));
    while (cells.length % 7 !== 0) cells.push(null);

    return { cells };
  }, [baseDate]);

  const toIso = (d) => d.toISOString().slice(0, 10);

  return (
    <div>
      <h4>{baseDate.toLocaleString("es-AR", { month: "long", year: "numeric" })}</h4>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => <b key={d}>{d}</b>)}
        {monthMeta.cells.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const iso = toIso(cell);
          const selected = iso === selectedDate;
          const marked = markedDates.has(iso);
          return (
            <button key={iso} onClick={() => onSelectDate(iso)} style={{ padding: "0.6rem", borderRadius: 8, border: selected ? "2px solid #2563eb" : "1px solid #ccc", background: marked ? "#dbeafe" : "#fff" }}>
              {cell.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
