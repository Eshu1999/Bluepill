
'use client';

import * as React from 'react';
import { auth, db } from '@/lib/firebase';
import { Loader2, Package, PlusCircle, AlertTriangle, Pill, Search, Settings, LifeBuoy, MessageSquare, Heart, Edit, FileText, Upload, Bell, Users, Home } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { User, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { collection, onSnapshot, query, where, addDoc } from 'firebase/firestore';
import type { StoredMedicine, Medication, UserProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { differenceInDays, format, isPast, parse } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { StorageForm } from '@/components/storage-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { analyzeUserMedicineDocument } from '@/ai/flows/analyze-user-medicine-document';
import { useRouter } from 'next/navigation';
import { signOut } from '@/app/actions';
import type { AuthUser } from '@/types';


const getExpiryStatus = (expiryDate: string) => {
    const date = parse(expiryDate, 'yyyy-MM-dd', new Date());
    if (isPast(date)) return 'expired';
    if (differenceInDays(date, new Date()) <= 30) return 'expiring-soon';
    return 'ok';
}

const DocumentUploadDialog = ({ user, onFinished }: { user: AuthUser, onFinished: () => void }) => {
    const [file, setFile] = React.useState<File | null>(null);
    const [loading, setLoading] = React.useState(false);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    }

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (e) => {
            const dataUri = e.target?.result as string;
            try {
                const result = await analyzeUserMedicineDocument({ documentDataUri: dataUri });
                
                for (const item of result.medicines) {
                    await addDoc(collection(db, 'medicine-storage'), {
                        ...item,
                        userId: user.uid,
                    });
                }
                
                toast({
                    title: 'Analysis Complete',
                    description: `${result.medicines.length} items were automatically added to your storage.`,
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
                <CardDescription>Upload an image or PDF of your prescription or medicine list.</CardDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                 <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">Image or PDF of your medicines</p>
                            {file && <p className="mt-4 text-sm font-medium">{file.name}</p>}
                        </div>
                        <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf"/>
                    </label>
                </div> 
                <Button onClick={handleAnalyze} disabled={!file || loading} className="w-full">
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Analyzing...</> : 'Analyze and Add to Storage'}
                </Button>
            </div>
        </DialogContent>
    )
}

export const MedicineStoragePageContent = ({ user, profile }: { user: AuthUser, profile: UserProfile }) => {
    const [storedMedicines, setStoredMedicines] = React.useState<StoredMedicine[]>([]);
    const [medications, setMedications] = React.useState<Medication[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [isDocUploadOpen, setIsDocUploadOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [editingItem, setEditingItem] = React.useState<StoredMedicine | null>(null);
    const router = useRouter();

     React.useEffect(() => {
        if (!user) return;
        
        let unsubStorage: () => void;
        let unsubMeds: () => void;

        const setupListeners = async () => {
            const storageQuery = query(collection(db, 'medicine-storage'), where('userId', '==', user.uid));
            unsubStorage = onSnapshot(storageQuery, (querySnapshot) => {
                const items: StoredMedicine[] = [];
                querySnapshot.forEach((doc) => {
                    items.push({ id: doc.id, ...doc.data() } as StoredMedicine);
                });
                setStoredMedicines(items.sort((a, b) => a.name.localeCompare(b.name)));
            }, (error) => {
                console.error("Storage snapshot error:", error);
            });

            const medsQuery = query(collection(db, 'medications'), where('userId', '==', user.uid));
            unsubMeds = onSnapshot(medsQuery, (querySnapshot) => {
                const items: Medication[] = [];
                querySnapshot.forEach((doc) => {
                    items.push({ id: doc.id, ...doc.data() } as Medication);
                });
                setMedications(items);
            }, (error) => {
                console.error("Medication snapshot error:", error);
            });

            setLoading(false);
        };

        setupListeners();
    
        return () => {
          unsubStorage?.();
          unsubMeds?.();
        };
      }, [user]);

    const handleSignOut = async () => {
        await auth.signOut();
        await signOut();
        router.replace('/');
    }
    
    const handleEdit = (item: StoredMedicine) => {
        setEditingItem(item);
        setIsFormOpen(true);
    }

    const handleAddNew = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    }
    
    const onFormFinished = () => {
        setIsFormOpen(false);
        setEditingItem(null);
    }

    const calculateDaysRemaining = (medicineName: string, quantity: number | undefined): number | null => {
        if(quantity === undefined || quantity <= 0) return 0;
        
        const matchingMeds = medications.filter(m => m.name.toLowerCase().includes(medicineName.toLowerCase()));
        if(matchingMeds.length === 0) return null; // Cannot calculate if not in schedule

        let dosesPerDay = 0;
        matchingMeds.forEach(m => {
            dosesPerDay += m.times.length;
        });

        if (dosesPerDay === 0) return null;

        return Math.floor(quantity / dosesPerDay);
    }

    const filteredMedicines = storedMedicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isChemist = profile.accountType === 'chemist';

    return (
         <div className="flex min-h-screen w-full flex-col bg-background">
            <Sidebar>
                <SidebarContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                             <a href="/profile">
                                <SidebarMenuButton>
                                    <User /> 
                                    <span>Profile</span>
                                </SidebarMenuButton>
                            </a>
                             {!isChemist ? (
                                <>
                                    <a href="/mymedicine">
                                        <SidebarMenuButton>
                                            <Pill />
                                            <span>My Medication</span>
                                        </SidebarMenuButton>
                                    </a>
                                    <a href="/health-summary">
                                        <SidebarMenuButton>
                                            <Heart />
                                            <span>Health Summary</span>
                                        </SidebarMenuButton>
                                    </a>
                                    <a href="/medicine-storage">
                                        <SidebarMenuButton isActive={true}>
                                            <Package />
                                            <span>Medicine Storage</span>
                                        </SidebarMenuButton>
                                    </a>
                                </>
                            ) : (
                                <>
                                    <a href="/chemist/home">
                                        <SidebarMenuButton>
                                            <Home />
                                            <span>Home</span>
                                        </SidebarMenuButton>
                                    </a>
                                    <a href="/chemist/inventory">
                                        <SidebarMenuButton>
                                            <Package />
                                            <span>Inventory</span>
                                        </SidebarMenuButton>
                                    </a>
                                </>
                            )}
                             <a href="/family">
                                <SidebarMenuButton>
                                    <Users />
                                    <span>Family</span>
                                </SidebarMenuButton>
                            </a>
                             <a href="/notifications">
                                <SidebarMenuButton>
                                    <Bell />
                                    <span>Notifications</span>
                                </SidebarMenuButton>
                            </a>
                             <a href="/messages">
                                <SidebarMenuButton>
                                    <MessageSquare />
                                    <span>Messages</span>
                                </SidebarMenuButton>
                            </a>
                             <a href="/settings">
                                <SidebarMenuButton>
                                    <Settings />
                                    <span>Settings</span>
                                </SidebarMenuButton>
                            </a>
                            <a href="/support">
                                <SidebarMenuButton>
                                    <LifeBuoy />
                                    <span>Support</span>
                                </SidebarMenuButton>
                            </a>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleSignOut}>
                               <LogOut /> 
                               <span>Sign Out</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                 <header className="sticky top-0 z-40 w-full border-b bg-card">
                    <div className="container flex h-16 items-center justify-between">
                         <div className="md:hidden">
                           <SidebarTrigger>
                               <Menu />
                           </SidebarTrigger>
                         </div>
                         <div className={cn('hidden md:block')}></div>
                        <div className="flex items-center space-x-2">
                           {/* Action buttons can go here */}
                        </div>
                    </div>
                 </header>
                 <main className="flex-1">
                     <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <div className="container py-8">
                             <div className="flex justify-between items-center mb-6">
                                <h1 className="text-3xl font-bold tracking-tight font-headline">Medicine Storage</h1>
                                <div className="flex gap-2">
                                    <Dialog open={isDocUploadOpen} onOpenChange={setIsDocUploadOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">
                                                <FileText className="mr-2 h-4 w-4" />
                                                Add from Document
                                            </Button>
                                        </DialogTrigger>
                                        <DocumentUploadDialog user={user} onFinished={() => setIsDocUploadOpen(false)} />
                                    </Dialog>
                                    <DialogTrigger asChild>
                                        <Button onClick={handleAddNew}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Add Manually
                                        </Button>
                                    </DialogTrigger>
                                </div>
                            </div>
                            <div className="mb-6 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search for a medicine..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Card>
                                <CardContent className="pt-6">
                                    {loading ? (
                                        <p>Loading your storage...</p>
                                    ) : filteredMedicines.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Medicine</TableHead>
                                                    <TableHead>Expires</TableHead>
                                                    <TableHead className="text-center">Quantity</TableHead>
                                                    <TableHead className="text-right">Days Left</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredMedicines.map((item) => {
                                                    const expiryStatus = item.expiryDate ? getExpiryStatus(item.expiryDate) : 'ok';
                                                    const expiryDate = item.expiryDate ? parse(item.expiryDate, 'yyyy-MM-dd', new Date()) : null;
                                                    const daysUntilExpiry = expiryDate ? differenceInDays(expiryDate, new Date()) : null;
                                                    const daysRemaining = calculateDaysRemaining(item.name, item.quantity);
                                                    
                                                    return (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="font-medium flex items-center gap-3">
                                                                <Avatar>
                                                                    <AvatarImage src={item.photoUrl} alt={item.name} />
                                                                    <AvatarFallback>
                                                                        <Pill />
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                {item.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                {expiryDate ? (
                                                                    <div className={cn('flex items-center gap-2', {
                                                                        'text-destructive': expiryStatus === 'expired',
                                                                        'text-yellow-600': expiryStatus === 'expiring-soon'
                                                                    })}>
                                                                        {expiryStatus !== 'ok' && <AlertTriangle className="h-4 w-4" />}
                                                                        {format(expiryDate, 'dd/MM/yyyy')}
                                                                    </div>
                                                                ) : <span>-</span>}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {item.quantity ?? '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {daysRemaining !== null ? (
                                                                    <Badge variant={daysRemaining <= 7 ? "destructive" : "outline"}>
                                                                        {daysRemaining} days
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="secondary">N/A</Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                                            <h3 className="mt-4 text-lg font-medium text-muted-foreground">{searchTerm ? 'No results found' : 'Your storage is empty'}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">{searchTerm ? 'Try a different search term.' : 'Add your first medicine to get started.'}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>{editingItem ? "Edit Item" : "Add to Storage"}</DialogTitle>
                            </DialogHeader>
                            <StorageForm onFinished={onFormFinished} item={editingItem} />
                        </DialogContent>
                    </Dialog>
                </main>
            </SidebarInset>
        </div>
    )
}

    