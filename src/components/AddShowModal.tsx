type AddShowModalProps = {
  onClose: () => void;
};

function AddShowModal({ onClose }: AddShowModalProps) {
  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center">
      <div className="modal w-full max-w-md rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold">Add Show</h2>

        <button onClick={onClose} className="btn btn-default mt-6">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default AddShowModal;
