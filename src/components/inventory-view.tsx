
'use client';

import * as React from 'react';
import { collection, onSnapshot, query, where, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { InventoryItem, InventoryItemInput } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertTriangle, Package, PlusCircle, Search, Upload, FileText, Loader2 } from 'lucide-react';
import { InventoryForm } from './inventory-form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { differenceInDays, format, isPast, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { analyzeInventoryDocument } from '@/ai/flows/analyze-inventory-document';
import { useToast } from '@/hooks/use-toast';
import type { AuthUser } from '@/types';

interface InventoryViewProps {
  user: AuthUser;
}

const getExpiryStatus = (expiryDate: string) => {
    const date = parse(expiryDate, 'yyyy-MM-dd', new Date());
    if (isPast(date)) return 'expired';
    if (differenceInDays(date, new Date()) <= 30) return 'expiring-soon';
    return 'ok';
}

const DocumentUploadDialog = ({ user, onFinished }: { user: AuthUser, onFinished: () => void }) => {
    const [file, setFile] = React.useState<File | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [analysisResult, setAnalysisResult] = React.useState<InventoryItemInput[] | null>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    }

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        setAnalysisResult(null);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (e) => {
            const dataUri = e.target?.result as string;
            try {
                const result = await analyzeInventoryDocument({ documentDataUri: dataUri });
                setAnalysisResult(result.inventory);

                // Automatically add to inventory
                for (const item of result.inventory) {
                    await addDoc(collection(db, 'inventory'), {
                        ...item,
                        userId: user.uid,
                    });
                }
                
                toast({
                    title: 'Analysis Complete',
                    description: `${result.inventory.length} items were automatically added to your inventory.`,
                });
                onFinished();

            } catch (error) {
                console.error("Error analyzing document:", error);
                toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not analyze the document.' });
            } finally {
                setLoading(false);
            }
        };
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add from Document</DialogTitle>
                <CardDescription>Upload an image, PDF, or spreadsheet of an inventory list.</CardDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                 <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF, XLS, CSV, PNG, JPG, etc.</p>
                            {file && <p className="mt-4 text-sm font-medium">{file.name}</p>}
                        </div>
                        <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/tab-separated-values,.ods"/>
                    </label>
                </div> 
                <Button onClick={handleAnalyze} disabled={!file || loading} className="w-full">
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Analyzing...</> : 'Analyze and Add to Inventory'}
                </Button>
            </div>
        </DialogContent>
    )
}

export function InventoryView({ user }: InventoryViewProps) {
  const [inventory, setInventory] = React.useState<InventoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDocUploadOpen, setIsDocUploadOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  React.useEffect(() => {
    if (user) {
      const invQuery = query(collection(db, 'inventory'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(invQuery, (querySnapshot) => {
        const items: InventoryItem[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as InventoryItem);
        });
        setInventory(items.sort((a,b) => a.name.localeCompare(b.name)));
        setLoading(false);
      }, (error) => {
          console.error("Inventory snapshot error:", error);
          setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Inventory Management</h1>
            <div className='flex gap-2'>
                <Dialog open={isDocUploadOpen} onOpenChange={setIsDocUploadOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Add from Document
                        </Button>
                    </DialogTrigger>
                    <DocumentUploadDialog user={user} onFinished={() => setIsDocUploadOpen(false)} />
                </Dialog>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsFormOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Medicine
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                        <DialogTitle>Add to Inventory</DialogTitle>
                        </DialogHeader>
                        <InventoryForm onFinished={() => setIsFormOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>How to use "Add from Document"</CardTitle>
                <CardDescription>
                    You can upload a document (like an image, PDF, or spreadsheet) of a stock list. Our AI will analyze it and automatically add the detected medicines to your inventory.
                </CardDescription>
            </CardHeader>
        </Card>
        <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                placeholder="Search inventory..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-6 w-6" />
              Current Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
                <p>Loading inventory...</p>
            ) : filteredInventory.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Medicine Name</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead className="text-right">Boxes</TableHead>
                            <TableHead className="text-right">Units/Box</TableHead>
                            <TableHead className="text-right">Meds/Unit</TableHead>
                            <TableHead className="text-right font-bold">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInventory.map((item) => {
                            const expiryStatus = getExpiryStatus(item.expiryDate);
                            const expiryDate = parse(item.expiryDate, 'yyyy-MM-dd', new Date());
                            const daysUntilExpiry = differenceInDays(expiryDate, new Date());
                            
                            return (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>
                                        <div className={cn('flex items-center gap-2', {
                                            'text-destructive': expiryStatus === 'expired',
                                            'text-yellow-600': expiryStatus === 'expiring-soon'
                                        })}>
                                            {expiryStatus !== 'ok' && <AlertTriangle className="h-4 w-4" />}
                                            {format(expiryDate, 'dd/MM/yyyy')}
                                            {expiryStatus === 'expiring-soon' && 
                                                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                                                    {daysUntilExpiry} days
                                                </Badge>
                                            }
                                            {expiryStatus === 'expired' && 
                                                <Badge variant="destructive">Expired</Badge>
                                            }
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{item.boxes}</TableCell>
                                    <TableCell className="text-right">{item.unitsPerBox}</TableCell>
                                    <TableCell className="text-right">{item.medicinesPerUnit}</TableCell>
                                    <TableCell className="text-right font-bold">
                                        {(item.boxes * item.unitsPerBox * item.medicinesPerUnit).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium text-muted-foreground">{searchTerm ? 'No results found' : 'Your inventory is empty'}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{searchTerm ? 'Try a different search term.' : 'Add your first medicine to get started.'}</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
