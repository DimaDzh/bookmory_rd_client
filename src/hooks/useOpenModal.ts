import { useState, useEffect, useCallback } from "react";

interface UseOpenModalOptions {
  eventName?: string;
  defaultOpen?: boolean;
}

interface UseOpenModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * A reusable hook for managing modal open/close state with optional event listener support
 * @param options - Configuration options for the modal
 * @param options.eventName - Custom event name to listen for to open the modal
 * @param options.defaultOpen - Initial open state (default: false)
 * @returns Object with modal state and control functions
 */
export function useOpenModal(
  options: UseOpenModalOptions = {}
): UseOpenModalReturn {
  const { eventName, defaultOpen = false } = options;

  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    if (!eventName) return;

    const handleOpenModal = () => setIsOpen(true);

    window.addEventListener(eventName, handleOpenModal);
    return () => window.removeEventListener(eventName, handleOpenModal);
  }, [eventName]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
