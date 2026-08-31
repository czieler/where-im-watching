import wiwLogo from "../assets/wiw_logo.png";
import PasswordUpdateForm from "./PasswordUpdateForm";

type ResetPasswordScreenProps = {
  onComplete: () => void;
};

function ResetPasswordScreen({ onComplete }: ResetPasswordScreenProps) {
  return (
    <div className="auth-page flex min-h-screen items-center justify-center px-4 py-8">
      <div className="auth-card w-full max-w-lg rounded-2xl border p-8 shadow-lg md:p-10">
        <img
          src={wiwLogo}
          alt="Where I'm Watching"
          className="mb-6 h-20 w-20 object-contain"
        />

        <h1 className="text-2xl font-bold">Choose a new password</h1>
        <p className="text-muted mt-2 mb-6">
          Enter the new password you want to use for Where I&apos;m Watching.
        </p>

        <PasswordUpdateForm onSuccess={onComplete} />
      </div>
    </div>
  );
}

export default ResetPasswordScreen;
