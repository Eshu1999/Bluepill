
'use client';

import * as React from 'react';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

export function InstallPwaButton() {
  const { prompt, isReady } = usePwaInstall();
  const { toast } = useToast();

  React.useEffect(() => {
    if (isReady && prompt) {
        toast({
            title: "Install Bluepill App",
            description: "Add Bluepill to your home screen for a better experience.",
            duration: 10000, // Keep it open for 10 seconds
            action: (
                <Button onClick={prompt}>
                    <Download className="mr-2 h-4 w-4" />
                    Install
                </Button>
            ),
        });
    }
  }, [isReady, prompt, toast]);

  return null; // This component only renders a toast, not an element in the DOM.
}
