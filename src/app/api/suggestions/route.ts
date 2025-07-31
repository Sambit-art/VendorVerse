import { NextResponse } from 'next/server';
import { z } from 'zod';

export interface Service {
  title: string;
  description: string;
}

const suggestionSchema = z.object({
  clientInterest: z.string().min(10, "Please describe client interests in at least 10 characters."),
  vendorCapability: z.string().min(10, "Please describe vendor capabilities in at least 10 characters."),
});

const mockServices: Service[] = [
    { title: "Custom Website Development", description: "Building responsive and performant websites tailored to your brand." },
    { title: "Mobile App Development", description: "Creating native or cross-platform mobile applications for iOS and Android." },
    { title: "UI/UX Design Services", description: "Designing intuitive and beautiful user interfaces and experiences." },
    { title: "Cloud Infrastructure Setup", description: "Configuring and managing scalable cloud solutions on AWS, GCP, or Azure." },
    { title: "SEO & Digital Marketing", description: "Improving online visibility and driving traffic through strategic marketing." },
    { title: "E-commerce Platform Integration", description: "Setting up online stores with platforms like Shopify or WooCommerce." },
    { title: "API Development & Integration", description: "Building and connecting robust APIs to power your applications." },
    { title: "Data Analytics & Visualization", description: "Turning raw data into actionable insights with powerful dashboards." },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedFields = suggestionSchema.safeParse(body);

    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      const errorMessage = fieldErrors.clientInterest?.[0] || fieldErrors.vendorCapability?.[0]
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const shuffled = [...mockServices].sort(() => 0.5 - Math.random());
    const randomSlice = Math.floor(Math.random() * (shuffled.length - 3)) + 3;
    
    return NextResponse.json({ services: shuffled.slice(0, randomSlice) });
  } catch (error) {
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}