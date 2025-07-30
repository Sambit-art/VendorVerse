
"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { getSuggestions, finalizeServices, type Service } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Users, Briefcase, Loader2, Send } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const initialState: { services?: Service[]; error?: string } = {
  services: undefined,
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full text-lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Getting Suggestions...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-5 w-5" />
          Get Suggestions
        </>
      )}
    </Button>
  );
}

export function VendorForm() {
  const [state, formAction] = useActionState(getSuggestions, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.error,
      });
    }
    if (state.services) {
      setDialogOpen(true);
      setSelectedServices([]);
    }
  }, [state, toast]);

  const handleCheckboxChange = (serviceTitle: string, checked: boolean) => {
    setSelectedServices(prev => 
      checked ? [...prev, serviceTitle] : prev.filter(s => s !== serviceTitle)
    );
  };

  const handleFinalize = async () => {
    if (selectedServices.length === 0) {
        toast({
            variant: "destructive",
            title: "No services selected",
            description: "Please select at least one service to finalize.",
        });
        return;
    }
    setIsFinalizing(true);
    const result = await finalizeServices(selectedServices);
    setIsFinalizing(false);
    if (result.success) {
        toast({
            title: "Success!",
            description: result.message,
            className: "bg-green-100 dark:bg-green-900",
        });
        setDialogOpen(false);
        formRef.current?.reset();
    } else {
        toast({
            variant: "destructive",
            title: "Finalization Failed",
            description: result.message,
        });
    }
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <form ref={formRef} action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="clientInterest" className="flex items-center text-base">
                <Users className="mr-2 h-5 w-5 text-primary" />
                Client Interests
              </Label>
              <Textarea
                id="clientInterest"
                name="clientInterest"
                placeholder="e.g., 'A startup needs a modern e-commerce website with a blog and payment integration...'"
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendorCapability" className="flex items-center text-base">
                <Briefcase className="mr-2 h-5 w-5 text-primary" />
                Vendor Capabilities
              </Label>
              <Textarea
                id="vendorCapability"
                name="vendorCapability"
                placeholder="e.g., 'We specialize in React, Node.js, and have extensive experience with Shopify APIs...'"
                rows={4}
                required
              />
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Suggested Services</DialogTitle>
            <DialogDescription>
              Based on your input, here are some recommended services. Select the ones you'd like to finalize.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-4 my-4">
            {state.services?.map((service) => (
              <div key={service.title} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                 <Checkbox 
                  id={service.title} 
                  onCheckedChange={(checked) => handleCheckboxChange(service.title, !!checked)}
                  checked={selectedServices.includes(service.title)}
                  className="mt-1"
                />
                <label htmlFor={service.title} className="flex-1 cursor-pointer">
                  <p className="font-semibold">{service.title}</p>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleFinalize} disabled={isFinalizing || selectedServices.length === 0}>
              {isFinalizing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Finalizing...
                </>
              ) : (
                <>
                 <Send className="mr-2 h-5 w-5" />
                  Finalize {selectedServices.length > 0 ? `(${selectedServices.length})` : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
