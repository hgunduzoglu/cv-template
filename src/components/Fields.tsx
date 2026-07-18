import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

interface FieldProps {
  label: string;
  hint?: string;
  wide?: boolean;
}

export function Field({
  label,
  hint,
  wide,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`field${wide ? " field--wide" : ""}`}>
      <span className="field__label">{label}</span>
      <input {...props} />
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  hint,
  wide,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={`field${wide ? " field--wide" : ""}`}>
      <span className="field__label">{label}</span>
      <textarea {...props} />
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

interface RepeaterCardProps {
  title: string;
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  children: ReactNode;
}

export function RepeaterCard({
  title,
  index,
  total,
  onMove,
  onRemove,
  children,
}: RepeaterCardProps) {
  return (
    <article className="repeater-card">
      <header className="repeater-card__header">
        <span>{title}</span>
        <div className="card-actions">
          <button
            type="button"
            className="icon-button"
            aria-label={`Move ${title} up`}
            disabled={index === 0}
            onClick={() => onMove(-1)}
          >
            <ArrowUp size={15} />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label={`Move ${title} down`}
            disabled={index === total - 1}
            onClick={() => onMove(1)}
          >
            <ArrowDown size={15} />
          </button>
          <button
            type="button"
            className="icon-button icon-button--danger"
            aria-label={`Remove ${title}`}
            onClick={onRemove}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </header>
      {children}
    </article>
  );
}

interface StringListProps {
  label: string;
  values: string[];
  placeholder: string;
  addLabel: string;
  onChange: (values: string[]) => void;
}

export function StringList({
  label,
  values,
  placeholder,
  addLabel,
  onChange,
}: StringListProps) {
  return (
    <div className="string-list field--wide">
      <span className="field__label">{label}</span>
      {values.map((value, index) => (
        <div className="string-list__row" key={index}>
          <textarea
            value={value}
            rows={2}
            placeholder={placeholder}
            onChange={(event) => {
              const next = [...values];
              next[index] = event.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            className="icon-button icon-button--danger"
            aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
            onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="inline-add"
        onClick={() => onChange([...values, ""])}
      >
        <Plus size={15} />
        {addLabel}
      </button>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>;
}
