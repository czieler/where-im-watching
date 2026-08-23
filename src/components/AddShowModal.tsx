type AddShowModalProps = {
  onClose: () => void;
};

function AddShowModal({ onClose }: AddShowModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-bold">Add Show</h2>

        <button onClick={onClose} className="btn btn-default mt-6">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default AddShowModal;
