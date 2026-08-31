import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/ui/kit/alert";

export function ImageComparisonError({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <Alert className={className} variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
