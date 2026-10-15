import { toast } from "sonner";

// Single shared toast slot: legacy cleared any visible toast before showing the
// next one, and hid it after 3200ms.
const TOAST_ID = "relaunch-toast";

function toastOk(message: string): void {
  toast(message, {
    id: TOAST_ID,
    duration: 3200,
    classNames: { toast: "toast-ok" },
  });
}

function toastBad(message: string): void {
  toast(message, {
    id: TOAST_ID,
    duration: 3200,
    classNames: { toast: "toast-bad" },
  });
}

export { toastOk, toastBad };
