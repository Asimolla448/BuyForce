type Stat = {
  value: string;
  label: string;
};

const stats: Stat[] = [
  { value: "₪2.5M", label: "חסכון כולל" },
  { value: "15,000+", label: "משתתפים פעילים" },
  { value: "850+", label: "עסקאות הושלמו" },
  { value: "45%", label: "הנחה ממוצעת" },
];

export default function StatsSection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((stat, i) => (
          <div key={i}>
            <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
            <div className="text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
