
"use client";

import { useState, useRef, useTransition } from "react";
import { getSuggestions, finalizeServices, type Service } from "@/services/api";
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

export function VendorForm() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const [services, setServices] = useState<Service[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const clientInterest = formData.get("clientInterest") as string;
    const vendorCapability = formData.get("vendorCapability") as string;

    if (clientInterest.length < 10) {
        toast({ variant: "destructive", title: "Error", description: "Please describe client interests in at least 10 characters." });
        return;
    }
    if (vendorCapability.length < 10) {
        toast({ variant: "destructive", title: "Error", description: "Please describe vendor capabilities in at least 10 characters." });
        return;
    }

    startTransition(async () => {
        try {
            const data = await getSuggestions({ clientInterest, vendorCapability });
            setServices(data.services);
            setSelectedServices([]);
            setDialogOpen(true);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.error || "Failed to get suggestions.",
            });
        }
    });
  };
  
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
    try {
        const result = await finalizeServices(selectedServices);
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
    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Error",
            description: error.response?.data?.error || "Failed to finalize services.",
        });
    } finally {
        setIsFinalizing(false);
    }
  };

  return (
    <>
      <Card className="shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <CardContent className="p-6">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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
            <div className="pt-4">
               <Button 
                type="submit" 
                size="lg" 
                className="w-full text-lg shadow-md transition-all hover:shadow-lg hover:-translate-y-px" 
                disabled={isPending}
                >
                {isPending ? (
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
            </div>
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
            {services?.map((service) => (
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
