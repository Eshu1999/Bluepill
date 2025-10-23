
'use client';

import * as React from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { QrCode } from 'lucide-react';
import { UserProfile } from '@/types';
import QRCode from 'qrcode.react';

interface ScannerViewProps {
  user: FirebaseUser;
  profile: UserProfile | null;
}

export function ScannerView({ user, profile }: ScannerViewProps) {
    const getQrCodeData = () => {
        if (!profile) return JSON.stringify({ error: "Profile not loaded" });
        const data = {
            chemistId: user.uid,
            chemistName: profile.name,
        };
        return JSON.stringify(data);
    }
    
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline mb-6">Your QR Code</h1>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <QrCode className="mr-2" />
                        Chemist QR Code
                    </CardTitle>
                    <CardDescription>Have the customer scan this code with their Medisure app to send you a medication request.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
                     <Card className="p-4 bg-white">
                        <QRCode
                            value={getQrCodeData()}
                            size={256}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="Q"
                            includeMargin={false}
                            renderAs="svg"
                        />
                    </Card>
                </CardContent>
            </Card>
        </div>
    );
}
