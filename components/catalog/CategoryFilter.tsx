import Link from 'next/link';

type CategoryOption = {
  id: string;
  name: string;
};

type CategoryFilterProps = {
  categories: CategoryOption[];
  activeCategoryId?: string;
};

export function CategoryFilter({ categories, activeCategoryId }: CategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/catalog"
        className={!activeCategoryId
          ? 'rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white transition'
          : 'rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50'}
      >
        Todas
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/catalog?categoryId=${category.id}`}
          className={activeCategoryId === category.id
            ? 'rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white transition'
            : 'rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50'}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
