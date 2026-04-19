export default function DataTable({ columns, rows, loading, emptyText = 'Aucune donnée' }) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="text-left px-4 py-3 font-semibold text-slate-600">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={columns.length} className="p-6 text-center text-slate-500">Chargement…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={columns.length} className="p-6 text-center text-slate-500">{emptyText}</td></tr>
            )}
            {rows.map((row, i) => (
              <tr key={row.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3">
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
