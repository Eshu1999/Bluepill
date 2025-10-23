
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Send, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { sendMedicationRequest, addFamilyMember } from '@/app/actions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Html5Qrcode } from 'html5-qrcode';
import { CameraView } from '@/components/camera-view';
import { Input } from '@/components/ui/input';
import type { AuthUser, UserProfile } from '@/types';
import { auth } from '@/lib/firebase';


export const ScanPageContent = ({ user, profile }: { user: AuthUser, profile: UserProfile }) => {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [scanError, setScanError] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const processQrCode = async (decodedText: string) => {
        setIsSubmitting(true);
        setScanError(null);
        
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
            setScanError("You must be logged in to perform this action.");
            toast({ variant: 'destructive', title: 'Authentication Error', description: "Not logged in." });
            setIsSubmitting(false);
            return;
        }

        try {
            const idToken = await firebaseUser.getIdToken(true);
            const data = JSON.parse(decodedText);

            if (data.userId && data.accountType) {
                 if (data.accountType === 'doctor') {
                    const result = await sendMedicationRequest(idToken, data.userId);
                    if (result.success) {
                        toast({
                            title: "Medication Request Sent!",
                            description: `Your request has been sent.`
                        });
                        router.push('/mymedicine');
                    } else {
                        throw new Error(result.error || "Could not send medication request.");
                    }
                 } else if (data.accountType === 'normal' || data.accountType === 'user') { // Support legacy 'user' type
                    const result = await addFamilyMember(idToken, data.userId);
                     if (result.success) {
                        toast({
                            title: "Family Member Added!",
                            description: result.message
                        });
                        router.push('/family');
                    } else {
                        throw new Error(result.error || "Could not add family member.");
                    }
                 } else {
                     throw new Error("Unknown account type in QR code.");
                 }
            } else {
                throw new Error("QR code is not a valid Bluepill user code.");
            }
        } catch (e) {
            const message = e instanceof Error ? e.message : "Invalid QR Code format.";
            setScanError(message);
            toast({ variant: 'destructive', title: 'Action Failed', description: message });
            setIsSubmitting(false);
        }
    };
    
    const scanQrFromDataUri = async (dataUri: string) => {
        const fetchRes = await fetch(dataUri);
        const blob = await fetchRes.blob();
        const file = new File([blob], "qr-code.jpg", { type: "image/jpeg" });
        await scanQrFromFile(file);
    };
    
    const scanQrFromFile = async (file: File) => {
        const html5QrCode = new Html5Qrcode("qr-code-file-scanner", { verbose: false });
        try {
            const decodedText = await html5QrCode.scanFile(file, false);
            await processQrCode(decodedText);
        } catch (err) {
            let message = "Failed to scan QR code from image.";
            if (err instanceof Error) {
                 if (err.message.includes("No MultiFormat Readers were able to detect the code")) {
                    message = "No readable QR code was found in the image. Please try a clearer photo or a different image.";
                } else {
                    message = `Scan Error: ${err.message}`;
                }
            }
            setScanError(message);
            toast({ variant: 'destructive', title: 'Scan Failed', description: message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setIsSubmitting(true);
            await scanQrFromFile(file);
        }
    };
    
    const handleImageReady = (dataUri: string) => {
        setIsSubmitting(true);
        scanQrFromDataUri(dataUri);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="container py-8">
            <div id="qr-code-file-scanner" className="hidden"></div>
            <div className="flex items-center mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-4">
                    <ArrowLeft />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Scan QR Code</h1>
            </div>
            
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Scan Code</CardTitle>
                    <CardDescription>
                        Use your camera to scan a code, or upload one from your library.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSubmitting ? (
                        <div className='flex flex-col items-center justify-center gap-4 h-64'>
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p>Processing...</p>
                        </div>
                    ) : (
                        <div className="w-full max-w-sm mx-auto space-y-4">
                            <CameraView onImageReady={handleImageReady} />
                            
                            <div className="relative flex items-center">
                                <span className="flex-shrink border-t w-full"></span>
                                <span className="flex-shrink-0 px-2 text-xs uppercase text-muted-foreground">Or</span>
                                <span className="flex-shrink border-t w-full"></span>
                            </div>

                            <Input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            
                            <Button variant="outline" className="w-full" onClick={handleUploadClick}>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload from Library
                            </Button>

                            {scanError && (
                                <Alert variant="destructive" className="mt-4">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>
                                        {scanError}
                                         <Button variant="link" className="p-0 h-auto ml-1" onClick={() => { setScanError(null); setIsSubmitting(false); }}>Try again.</Button>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
