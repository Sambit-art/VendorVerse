import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { services } = await request.json();

        if (!services || !Array.isArray(services) || services.length === 0) {
            return NextResponse.json({ message: 'No services provided.' }, { status: 400 });
        }
        
        console.log("Finalized services:", services);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return NextResponse.json({ 
            success: true, 
            message: `Successfully finalized ${services.length} services. Check the server console for details.` 
        });
    } catch (error) {
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}