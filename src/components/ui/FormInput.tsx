import { useId, type InputHTMLAttributes } from "react";
interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  containerClassName?: string;
}
export function FormInput({
  label,
  error,
  containerClassName = "",
  id,
  ...props
}: Props) {
  const unique = useId();
  const fieldId = id || unique;
  return (
    <div className={`form-field ${containerClassName}`}>
      <label htmlFor={fieldId}>{label}</label>
      <input
        {...props}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={error ? fieldId + "-error" : undefined}
      />
      {error && (
        <p className="field-error" id={fieldId + "-error"}>
          {error}
        </p>
      )}
    </div>
  );
}
