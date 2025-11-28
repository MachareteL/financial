import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ArrowDown } from "lucide-react";

interface ReceiptViewerProps {
  selectedReceipt: string | null;
  onClose: () => void;
}

export function ReceiptViewer({
  selectedReceipt,
  onClose,
}: ReceiptViewerProps) {
  return (
    <Dialog
      open={!!selectedReceipt}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none flex justify-center items-center h-[90vh]">
        <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl max-h-full max-w-full flex flex-col w-full h-full md:w-auto md:h-auto">
          <div className="absolute top-2 right-2 z-50">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/90 hover:bg-white shadow-md backdrop-blur-sm"
              onClick={onClose}
            >
              <X className="w-5 h-5 text-slate-700" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto bg-slate-100/50 p-4 flex items-center justify-center min-w-[300px] min-h-[300px]">
            {selectedReceipt &&
              (selectedReceipt.endsWith(".pdf") ? (
                <iframe
                  src={selectedReceipt}
                  className="w-[800px] h-[600px] rounded-lg shadow-inner bg-white"
                />
              ) : (
                <img
                  src={selectedReceipt}
                  alt="Comprovante"
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-sm"
                />
              ))}
          </div>
          <div className="bg-white p-3 border-t border-slate-100 flex justify-between items-center">
            <p className="text-sm font-medium text-slate-600 pl-2">
              Visualização do Anexo
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(selectedReceipt!, "_blank")}
            >
              Abrir Original <ArrowDown className="w-3 h-3 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
