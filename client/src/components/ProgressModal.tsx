import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

interface ProgressModalProps {
  open: boolean;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export default function ProgressModal({
  open,
  onCancel,
  title = "Generating PDF",
  description = "Please wait while we convert your document to PDF. This may take a few moments...",
}: ProgressModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent 
        className="sm:max-w-md"
        data-testid="dialog-progress-modal"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" data-testid="text-progress-title">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription data-testid="text-progress-description">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-primary" data-testid="spinner-progress" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-primary/10" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground" data-testid="text-progress-status">
              Converting your document...
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            className="gap-2"
            data-testid="button-cancel-conversion"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
