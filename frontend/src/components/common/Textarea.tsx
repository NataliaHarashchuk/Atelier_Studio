import { forwardRef, TextareaHTMLAttributes } from "react";
import { FormError } from "./FormError";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`input resize-none ${error ? "border-red-500 focus:ring-red-500" : ""} ${className}`}
          {...props}
        />
        <FormError message={error} />
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
