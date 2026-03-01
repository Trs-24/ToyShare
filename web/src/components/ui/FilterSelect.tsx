import { memo } from 'react';

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  /** Placeholder shown as the first "all" option */
  placeholder?: string;
}

/** Reusable labeled filter select. Replaces 5 identical select blocks in catalog sidebar. */
const FilterSelect = memo(function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: FilterSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <select className="input-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options
          .filter((o) => o.value)
          .map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
    </div>
  );
});

export default FilterSelect;
