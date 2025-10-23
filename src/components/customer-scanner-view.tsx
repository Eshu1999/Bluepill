
'use client';

import * as React from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { Html5QrcodeScanner, Html5QrcodeError, Html5QrcodeResult } from 'html5-qrcode';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { MedicationRequest, UserProfile } from '@/types';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';

interface CustomerScannerViewProps {
  user: FirebaseUser;
  onFinished: () => void;
}

const QR_CODE_REGION_ID = "qr-code-full-region-customer";

export function CustomerScannerView({ user, onFinished }: CustomerScannerViewProps) {
  const { toast } = useToast();
  const [scanResult, setScanResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const scannerRef = React.useRef<Html5QrcodeScanner | null>(null);
  const [chemistInfo, setChemistInfo] = React.useState<{ id: string; name: string } | null>(null);
  const [medicationName, setMedicationName] = React.useState('');
  const [notes, setNotes] = React.useState('');

  React.useEffect(() => {
    if (!scanResult) {
      const scanner = new Html5QrcodeScanner(
        QR_CODE_REGION_ID,
        {
          qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const qrboxSize = Math.floor(minEdge * 0.8);
              return {
                width: qrboxSize,
                height: qrboxSize,
              };
          },
          fps: 10,
          rememberLastUsedCamera: true,
          // Only support QR Code for better performance.
          supportedScanTypes: [], // Let library decide
        },
        false // verbose
      );

      const onScanSuccess = (decodedText: string, decodedResult: Html5QrcodeResult) => {
        scanner.clear().catch(err => console.error("Failed to clear scanner", err));
        setScanResult(decodedText);
        try {
            const data = JSON.parse(decodedText);
            if (data.chemistId && data.chemistName) {
                setChemistInfo({ id: data.chemistId, name: data.chemistName });
            } else {
                throw new Error("QR code is not a valid chemist code.");
            }
        } catch (e) {
             const message = e instanceof Error ? e.message : "Unknown error";
             setError(`Invalid QR Code: ${message}`);
        }
      };

      const onScanError = (errorMessage: string, error: Html5QrcodeError) => {
        // handle scan error, usually ignored.
      };
      
      if (document.getElementById(QR_CODE_REGION_ID)) {
          scanner.render(onScanSuccess, onScanError);
          scannerRef.current = scanner;
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [scanResult]);

  const handleSendRequest = async () => {
    if (!chemistInfo || !medicationName) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter the medication name.'});
        return;
    }

    try {
        const requestId = uuidv4();
        // This is a simplified request. In a real app, you might have more structured data.
        const requestData: MedicationRequest = {
            id: requestId,
            customerId: user.uid,
            customerName: user.displayName || 'A Customer',
            medicationName,
            notes,
            status: 'pending',
            requestedAt: new Date().toISOString(),
        }

        // Requests are stored under the *chemist's* ID for them to view.
        const requestDocRef = doc(db, 'requests', chemistInfo.id, 'medicationRequests', requestId);
        await setDoc(requestDocRef, requestData);

        toast({
            title: 'Request Sent!',
            description: `Your request for ${medicationName} has been sent to ${chemistInfo.name}.`
        });
        onFinished();

    } catch (e) {
        console.error("Error sending request:", e);
        const message = e instanceof Error ? e.message : "Unknown error";
        setError(`Failed to send request: ${message}`);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: `Could not send the request. Please try again.`
        });
    }
  };

  const handleRescan = () => {
    setScanResult(null);
    setError(null);
    setChemistInfo(null);
    setMedicationName('');
    setNotes('');
  }

  return (
    <div>
        {chemistInfo ? (
            <div className='space-y-6 py-4'>
                <div>
                    <h3 className="text-lg font-semibold">Sending Request to {chemistInfo.name}</h3>
                    <p className="text-muted-foreground text-sm">Enter the medication details you are requesting.</p>
                </div>
                <div className="space-y-4">
                     <div>
                        <Label htmlFor="medication-name">Medication Name</Label>
                        <Input 
                            id="medication-name"
                            value={medicationName}
                            onChange={(e) => setMedicationName(e.target.value)}
                            placeholder="e.g., Paracetamol 500mg"
                        />
                     </div>
                     <div>
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., 2 boxes, 10 tablets each"
                        />
                     </div>
                </div>

                <div className='flex gap-2 justify-end'>
                     <Button onClick={handleRescan} variant="outline">Scan Another</Button>
                     <Button onClick={handleSendRequest} disabled={!medicationName}>Send Request</Button>
                </div>
            </div>
        ) : (
            <>
                <div id={QR_CODE_REGION_ID} className={cn("w-full aspect-square", scanResult && "hidden")} />
                 {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {error}
                            <Button onClick={handleRescan} variant="link" className="p-0 h-auto ml-2">Try again</Button>
                        </AlertDescription>
                    </Alert>
                )}
            </>
        )}
    </div>
  );
}
