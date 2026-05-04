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
    <div className="space-y-3">
      <h4 className="text-lg font-semibold text-slate-800 capitalize">{baseDate.toLocaleString("es-AR", { month: "long", year: "numeric" })}</h4>
      <div className="grid grid-cols-7 gap-2">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => <div className="text-center text-sm font-semibold text-slate-500" key={d}>{d}</div>)}
        {monthMeta.cells.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const iso = toIso(cell);
          const selected = iso === selectedDate;
          const marked = markedDates.has(iso);
          return (
            <button key={iso} onClick={() => onSelectDate(iso)} className={`rounded-lg border p-2 text-sm ${selected ? "border-brand ring-1 ring-brand" : "border-slate-300"} ${marked ? "bg-blue-100" : "bg-white"}`}>
              {cell.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
