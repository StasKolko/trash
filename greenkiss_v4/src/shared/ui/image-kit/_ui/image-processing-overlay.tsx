import { Button } from "@/shared/ui/kit/button";
import { Spinner } from "@/shared/ui/kit/spinner";

export const ImageProcessingOverlay = ({ text }: { text: string }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
      <Button variant="inverted">
        <Spinner />
        {text}
      </Button>
    </div>
  );
};
