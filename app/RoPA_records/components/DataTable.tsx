"use client";
interface DataTableProps {
  data: any[];
  columns: { key: string; label: string; render?: (item: any) => React.ReactNode }[];
  selectedIds: number[];
  onSelect: (id: number) => void;
  onSelectAll: () => void;
  bulkAction?: React.ReactNode;
}

export const DataTable = ({ data, columns, selectedIds, onSelect, onSelectAll, bulkAction }: DataTableProps) => {
  return (
    <div className="flex-1 bg-white rounded-t-[3rem] border-2 border-slate-50 overflow-hidden flex flex-col shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#E7F3FF]/50 border-b border-slate-100">
          <tr>
            <th className="p-6 w-12">
              <input type="checkbox" onChange={onSelectAll} checked={selectedIds.length === data.length && data.length > 0} className="w-4 h-4" />
            </th>
            {selectedIds.length > 0 ? (
              <th colSpan={columns.length} className="p-6">{bulkAction}</th>
            ) : (
              columns.map(col => <th key={col.key} className="p-6 font-black text-[#2D3663] uppercase">{col.label}</th>)
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((item) => (
            <tr key={item.id} className={`hover:bg-slate-50/50 ${selectedIds.includes(item.id) ? 'bg-blue-50/30' : ''}`}>
              <td className="p-6">
                <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => onSelect(item.id)} className="w-4 h-4" />
              </td>
              {columns.map(col => (
                <td key={col.key} className="p-6 font-medium text-slate-800">
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};