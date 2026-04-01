/** Props for a Button component */
export interface ButtonProps {
  /** Button label text */
  label: string;
  /** Visual variant of the button */
  variant: 'primary' | 'secondary' | 'danger';
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Column definition for a generic data table.
 * @template T - Row data type
 */
export type TableColumn<T> = {
  /** Unique key matching a property in the row data */
  key: keyof T;
  /** Column header title */
  title: string;
  /** Column width (number for px, string for CSS value) */
  width?: number | string;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Custom cell renderer */
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

/**
 * Discriminated union for form field configuration.
 * Each field type has its own set of validation options.
 */
export type FormFieldConfig = {
  /** Field name used as form key */
  name: string;
  /** Human-readable label */
  label: string;
  /** Whether the field is required */
  required?: boolean;
} & (
  | { type: 'text'; maxLength?: number; placeholder?: string }
  | { type: 'number'; min?: number; max?: number; step?: number }
  | { type: 'select'; options: readonly string[]; multiple?: boolean }
);

/** Read-only version of ButtonProps without the click handler */
export type ReadonlyButtonProps = Readonly<Omit<ButtonProps, 'onClick'>>;
