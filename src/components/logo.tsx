import { Pill } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <Pill className="h-7 w-7 text-primary" />
      <span className="font-bold text-xl font-headline tracking-tighter">
        Bluepill
      </span>
    </div>
  );
}
