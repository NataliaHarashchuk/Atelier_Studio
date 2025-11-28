import { forwardRef, InputHTMLAttributes } from "react";
import { FormError } from "./FormError";

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="flex items-center">
          <input
            ref={ref}
            type="checkbox"
            className={`w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 ${className}`}
            {...props}
          />
          {label && (
            <label className="ml-2 text-sm font-medium text-gray-700">
              {label}
            </label>
          )}
        </div>
        <FormError message={error} />
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
