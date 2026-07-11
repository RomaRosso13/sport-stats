import "./CategorySelector.css";

const CATEGORY_LABELS = {
  Mixto: "Mixto",
  Femenil: "Femenil",
  Varonil: "Varonil"
};

function CategorySelector({ categories, active, onChange }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="category-selector">
      {categories.map((category) => {
        const isActive = active?.id === category.id;

        return (
          <button
            key={category.id}
            className={`category-tab ${isActive ? "active" : ""}`}
            onClick={() => onChange(category)}
          >
            {CATEGORY_LABELS[category.type] || category.type}
          </button>
        );
      })}
    </div>
  );
}

export default CategorySelector;
