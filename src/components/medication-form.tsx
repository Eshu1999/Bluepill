'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db, auth } from '@/lib/firebase';
import { doc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { Medication, MedicationInput } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const medicationSchema = z.object({
  name: z.string().min(2, { message: "Medication name must be at least 2 characters." }),
  dosage: z.string().min(1, { message: 'Dosage is required.' }),
  times: z.array(
      z.object({ 
          value: z.string().regex(/^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i, "Use HH:mm AM/PM format") 
      })
  ).min(1, {message: 'At least one time is required.'}),
  quantity: z.coerce.number().int().min(0, "Quantity can't be negative.").optional(),
});

type MedicationFormValues = z.infer<typeof medicationSchema>;

interface MedicationFormProps {
  medication?: Medication | null;
  onFinished: () => void;
  userId: string; // The ID of the user this medication belongs to
}

const generateTimeOptions = () => {
  const options = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const date = new Date(0,0,0,h,m);
      options.push(format(date, 'hh:mm a'));
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();


export function MedicationForm({ medication, onFinished, userId }: MedicationFormProps) {
  const { toast } = useToast();
  
  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: medication
      ? {
          name: medication.name,
          dosage: medication.dosage,
          times: medication.times.map(t => ({ value: t })),
          quantity: medication.quantity,
        }
      : {
          name: '',
          dosage: '',
          times: [{ value: '09:00 AM' }],
          quantity: 0,
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "times",
  });

  const onSubmit = async (data: MedicationFormValues) => {
    const medicationData: Omit<Medication, 'id'> = {
      name: data.name,
      dosage: data.dosage,
      times: data.times.map(t => t.value),
      userId: userId,
      quantity: data.quantity,
    };

    try {
      if (medication) {
        // Update existing medication
        await updateDoc(doc(db, 'medications', medication.id), medicationData);
        toast({ title: 'Success', description: 'Medication updated successfully.' });
      } else {
        // Add new medication
        await addDoc(collection(db, 'medications'), { ...medicationData });
        toast({ title: 'Success', description: 'Medication added successfully.' });
      }
      onFinished();
    } catch (error) {
      console.error('Error saving medication:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save medication.' });
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
              <FormLabel htmlFor="name">Medication Name(s)</FormLabel>
              <FormControl>
                <Input id="name" placeholder="e.g., Paracetamol, Cetirizine" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel htmlFor="dosage">Dosage(s)</FormLabel>
                    <FormControl>
                        <Input id="dosage" placeholder="e.g., 500mg" {...field} />
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

        <div>
            <FormLabel>Times to Take</FormLabel>
            <div className="space-y-2 mt-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-2">
                        <FormField
                            control={form.control}
                            name={`times.${index}.value`}
                            render={({ field }) => (
                                <FormItem className='flex-1'>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a time" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {timeOptions.map(time => (
                                                <SelectItem key={time} value={time}>{time}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        {fields.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ value: '09:00 AM' })}
            >
                <PlusCircle className="mr-2 h-4 w-4"/> Add Time
            </Button>
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
            {form.formState.isSubmitting ? 'Saving...' : 'Save Medication'}
        </Button>
      </form>
    </Form>
  );
}
