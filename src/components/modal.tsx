import type { ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  containerClass?: string
};

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  className,
  containerClass,
}: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className={`flex max-h-[95vh] w-[85vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${containerClass}`}>
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-stone-900">
            {title ?? "Modal"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
          >
            Close
          </button>
        </div>

        <div className={`flex-1 min-h-0 overflow-hidden p-6 ${className ?? ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
