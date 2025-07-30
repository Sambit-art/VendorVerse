
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState, useRef } from "react";
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
  const [state, formAction] = useFormState(getSuggestions, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    if (state?.services) {
      setDialogOpen(true);
      setSelectedServices([]);
    }
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: state.error,
      });
    }
  }, [state, toast]);

  const handleCheckboxChange = (checked: boolean, serviceTitle: string) => {
    setSelectedServices(prev =>
      checked ? [...prev, serviceTitle] : prev.filter(title => title !== serviceTitle)
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
    setDialogOpen(false);

    if (result.success) {
      toast({
        title: "Success!",
        description: result.message,
      });
      formRef.current?.reset();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <form ref={formRef} action={formAction} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="clientInterest" className="flex items-center text-md font-semibold">
                <Users className="mr-2 h-5 w-5 text-primary" />
                Client's Interests
              </Label>
              <Textarea
                id="clientInterest"
                name="clientInterest"
                placeholder="e.g., 'Looking for a complete e-commerce solution with a modern design, mobile-first approach, and integrated payment gateways...'"
                rows={5}
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendorCapability" className="flex items-center text-md font-semibold">
                <Briefcase className="mr-2 h-5 w-5 text-primary" />
                Vendor's Capabilities
              </Label>
              <Textarea
                id="vendorCapability"
                name="vendorCapability"
                placeholder="e.g., 'We are a web development agency specializing in React, Next.js, and Shopify. We have extensive experience in building custom themes...'"
                rows={5}
                required
                className="text-base"
              />
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] grid-rows-[auto,1fr,auto] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-2xl flex items-center">
              <Wand2 className="mr-3 h-6 w-6 text-primary" />
              Suggested Services
            </DialogTitle>
            <DialogDescription>
              Based on your input, here are some recommendations. Select the ones that fit your project needs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto max-h-[50vh] px-6">
            {state.services?.map(service => (
              <div key={service.title} className="flex items-start space-x-4 rounded-lg border bg-card p-4 transition-all has-[:checked]:bg-secondary has-[:checked]:border-primary/50">
                <Checkbox
                  id={service.title}
                  onCheckedChange={(checked) => handleCheckboxChange(Boolean(checked), service.title)}
                  checked={selectedServices.includes(service.title)}
                  className="mt-1 h-5 w-5"
                />
                <div className="grid gap-1.5 leading-snug">
                  <label
                    htmlFor={service.title}
                    className="font-semibold text-card-foreground cursor-pointer"
                  >
                    {service.title}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="p-6 bg-secondary/40 border-t">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleFinalize} disabled={isFinalizing || selectedServices.length === 0} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isFinalizing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finalizing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Finalize ({selectedServices.length})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
