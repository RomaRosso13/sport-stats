import PillDropdown from "../common/PillDropdown"
import "./CategorySelector.css"

const CATEGORY_LABELS = {
  Mixto: "Mixto",
  Femenil: "Femenil",
  Varonil: "Varonil"
};

function CategorySelector({ categories, active, onChange }) {
  if (!categories || categories.length === 0) return null;

  const options = categories.map(category => ({
    id: category.id,
    label: CATEGORY_LABELS[category.type] || category.type,
    original: category
  }))

  return (
    <div className="category-selector">
      <PillDropdown
        options={options}
        activeId={active?.id}
        onChange={option => onChange(option.original)}
      />
    </div>
  );
}

export default CategorySelector;
