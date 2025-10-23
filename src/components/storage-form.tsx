
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db, auth } from '@/lib/firebase';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import type { StoredMedicine, StoredMedicineInput } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { format, isValid, parse } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Camera, Pill } from 'lucide-react';

const DATE_FORMAT_DISPLAY = 'dd/MM/yyyy';
const DATE_FORMAT_DB = 'yyyy-MM-dd';

const storageSchema = z.object({
  name: z.string().min(2, { message: 'Medication name must be at least 2 characters.' }),
  expiryDate: z.string()
    .refine((val) => {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return false;
        const date = parse(val, DATE_FORMAT_DISPLAY, new Date());
        return isValid(date);
    }, {
        message: 'Invalid date format. Use DD/MM/YYYY.',
    }),
  photoUrl: z.string().optional().or(z.literal('')),
  quantity: z.coerce.number().int().min(0, "Quantity can't be negative").optional(),
});

type StorageFormValues = z.infer<typeof storageSchema>;

interface StorageFormProps {
  onFinished: () => void;
  item?: StoredMedicine | null;
}

export function StorageForm({ onFinished, item }: StorageFormProps) {
  const { toast } = useToast();
  
  const form = useForm<StorageFormValues>({
    resolver: zodResolver(storageSchema),
    defaultValues: item ? {
        name: item.name,
        expiryDate: format(parse(item.expiryDate, DATE_FORMAT_DB, new Date()), DATE_FORMAT_DISPLAY),
        photoUrl: item.photoUrl || '',
        quantity: item.quantity || 0,
    } : {
      name: '',
      expiryDate: '',
      photoUrl: '',
      quantity: 0,
    },
  });

  const photoUrl = form.watch('photoUrl');

  const onSubmit = async (data: StorageFormValues) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
        return;
    }

    const storedItemData: StoredMedicineInput = {
      name: data.name,
      expiryDate: format(parse(data.expiryDate, DATE_FORMAT_DISPLAY, new Date()), DATE_FORMAT_DB),
      photoUrl: data.photoUrl,
      quantity: data.quantity,
    };

    try {
        if (item) {
            const itemRef = doc(db, 'medicine-storage', item.id);
            await updateDoc(itemRef, storedItemData);
            toast({ title: 'Success', description: `'${data.name}' has been updated.`});
        } else {
            await addDoc(collection(db, 'medicine-storage'), {
                ...storedItemData,
                userId: currentUser.uid,
            });
            toast({ title: 'Success', description: `'${data.name}' added to your storage.` });
        }
      onFinished();
    } catch (error) {
      console.error('Error saving stored item:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save item.' });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center space-x-4">
            <div className="relative">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={photoUrl} alt="Medicine photo preview" />
                    <AvatarFallback className="bg-muted">
                        <Pill className="h-10 w-10 text-muted-foreground" />
                    </AvatarFallback>
                </Avatar>
                <Controller
                    control={form.control}
                    name="photoUrl"
                    render={({ field }) => (
                        <FormItem>
                             <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-primary/90 border-2 border-card">
                                <Camera className="h-4 w-4"/>
                                <FormControl>
                                    <Input
                                        id="photo-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    field.onChange(event.target?.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </FormControl>
                             </label>
                        </FormItem>
                    )}
                />

            </div>
            <div className="flex-1 space-y-2">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel htmlFor="name">Medication Name</FormLabel>
                        <FormControl>
                            <Input id="name" placeholder="e.g., Ibuprofen" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-2">
                     <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="expiryDate">Expiry Date</FormLabel>
                                <FormControl>
                                    <Input id="expiryDate" placeholder="DD/MM/YYYY" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="quantity">Quantity</FormLabel>
                                <FormControl>
                                    <Input id="quantity" type="number" placeholder="e.g., 30" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
            {form.formState.isSubmitting ? 'Saving...' : (item ? 'Update Item' : 'Add to Storage')}
        </Button>
      </form>
    </Form>
  );
}
