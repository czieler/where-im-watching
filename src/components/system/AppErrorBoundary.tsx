import { Component, type ErrorInfo, type ReactNode } from "react";
import ErrorPage from "./ErrorPage";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Where I'm Watching encountered an unexpected error:", error, info);
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return <ErrorPage status={500} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
