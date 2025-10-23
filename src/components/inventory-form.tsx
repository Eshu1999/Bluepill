'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db, auth } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import type { InventoryItemInput } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { format, isValid, parse } from 'date-fns';

const DATE_FORMAT_DISPLAY = 'dd/MM/yyyy';
const DATE_FORMAT_DB = 'yyyy-MM-dd';

const inventorySchema = z.object({
  name: z.string().min(2, { message: 'Medication name must be at least 2 characters.' }),
  boxes: z.coerce.number().int().min(1, 'Must have at least one box.'),
  unitsPerBox: z.coerce.number().int().min(1, 'Must have at least one unit per box.'),
  medicinesPerUnit: z.coerce.number().int().min(1, 'Must have at least one medicine per unit.'),
  expiryDate: z.string()
    .refine((val) => {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return false;
        const date = parse(val, DATE_FORMAT_DISPLAY, new Date());
        return isValid(date);
    }, {
        message: 'Invalid date format. Use DD/MM/YYYY.',
    }),
});

type InventoryFormValues = z.infer<typeof inventorySchema>;

interface InventoryFormProps {
  onFinished: () => void;
}

export function InventoryForm({ onFinished }: InventoryFormProps) {
  const { toast } = useToast();
  
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: '',
      boxes: 1,
      unitsPerBox: 1,
      medicinesPerUnit: 1,
      expiryDate: '',
    },
  });

  const onSubmit = async (data: InventoryFormValues) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
        return;
    }

    const inventoryItemData: InventoryItemInput = {
      name: data.name,
      boxes: data.boxes,
      unitsPerBox: data.unitsPerBox,
      medicinesPerUnit: data.medicinesPerUnit,
      expiryDate: format(parse(data.expiryDate, DATE_FORMAT_DISPLAY, new Date()), DATE_FORMAT_DB),
    };

    try {
      await addDoc(collection(db, 'inventory'), {
          ...inventoryItemData,
          userId: currentUser.uid,
      });
      toast({ title: 'Success', description: `'${data.name}' added to inventory.` });
      onFinished();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save item.' });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name">Medication Name</FormLabel>
              <FormControl>
                <Input id="name" placeholder="e.g., Paracetamol" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <div className="grid grid-cols-3 gap-4">
            <FormField
            control={form.control}
            name="boxes"
            render={({ field }) => (
                <FormItem>
                <FormLabel htmlFor="boxes">Boxes</FormLabel>
                <FormControl>
                    <Input id="boxes" type="number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="unitsPerBox"
            render={({ field }) => (
                <FormItem>
                <FormLabel htmlFor="unitsPerBox">Units/Box</FormLabel>
                <FormControl>
                    <Input id="unitsPerBox" type="number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="medicinesPerUnit"
            render={({ field }) => (
                <FormItem>
                <FormLabel htmlFor="medicinesPerUnit">Meds/Unit</FormLabel>
                <FormControl>
                    <Input id="medicinesPerUnit" type="number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
            {form.formState.isSubmitting ? 'Saving...' : 'Add to Inventory'}
        </Button>
      </form>
    </Form>
  );
}
