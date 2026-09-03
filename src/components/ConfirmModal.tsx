import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

type ConfirmModalProps = {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Dialog open onClose={onCancel} className="relative z-50">
      <DialogBackdrop className="modal-overlay fixed inset-0" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="modal w-full max-w-sm rounded-xl p-6 shadow-lg">
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>

          <p className="mt-4">{message}</p>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button type="button" onClick={onCancel} className="btn btn-default">
              Cancel
            </button>

            <button type="button" onClick={onConfirm} className="btn btn-primary">
              Remove
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export default ConfirmModal;
