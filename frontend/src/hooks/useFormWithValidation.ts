import { useForm, UseFormProps, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema } from "zod";

interface UseFormWithValidationProps<T extends FieldValues> extends Omit<
  UseFormProps<T>,
  "resolver"
> {
  schema: ZodSchema<T>;
}

export function useFormWithValidation<T extends FieldValues>({
  schema,
  ...options
}: UseFormWithValidationProps<T>) {
  return useForm<T>({
    resolver: zodResolver(schema as any),
    mode: "onBlur",
    ...options,
  });
}
