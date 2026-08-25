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
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center">
      <div className="modal w-full max-w-sm rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold">{title}</h2>

        <p className="mt-4">{message}</p>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn btn-default">
            Cancel
          </button>

          <button type="button" onClick={onConfirm} className="btn btn-primary">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
