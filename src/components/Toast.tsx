interface ToastProps {
  message: string | null;
}

export default function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="animate-pop-in fixed left-1/2 top-16 z-[60] -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-lg"
    >
      {message}
    </div>
  );
}
