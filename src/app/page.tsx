import { VendorForm } from "@/components/vendor-form";

export default function Home() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl font-headline">
            VendorVerse
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Bridging Client Needs with Vendor Solutions.
          </p>
          <p className="mt-2 text-sm text-muted-foreground/80">
            Describe your project interests and vendor capabilities to receive curated service suggestions.
          </p>
        </div>
        <VendorForm />
      </div>
    </main>
  );
}
