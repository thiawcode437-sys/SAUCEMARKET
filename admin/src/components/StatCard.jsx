export default function StatCard({ icon: Icon, label, value, trend, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary-light text-primary-dark',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    rose: 'bg-rose-100 text-rose-700',
  };
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
          {trend != null && (
            <div className={`text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-lg grid place-items-center ${colorMap[color]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
