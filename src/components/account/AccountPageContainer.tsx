import type { ReactNode } from "react";

type AccountPageContainerProps = {
  children: ReactNode;
  contentClassName?: string;
};

function AccountPageContainer({
  children,
  contentClassName = "max-w-4xl",
}: AccountPageContainerProps) {
  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] px-4 py-6 sm:px-6">
      <div className={contentClassName}>{children}</div>
    </main>
  );
}

export default AccountPageContainer;
