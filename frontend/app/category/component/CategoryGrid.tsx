import { Category } from "../types/category";
import CategoryCard from "./CategoryCard";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-6">
      {categories.map((cat) => (
        <CategoryCard key={cat.id} category={cat} />
      ))}
    </div>
  );
}
