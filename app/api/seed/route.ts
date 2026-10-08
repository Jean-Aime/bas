import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, getAuthenticatedUserId, getBearerToken } from '@/lib/supabase/server';
import { getTemplates } from '@/lib/workflow/templates';

export async function POST(req: NextRequest) {
  try {
    // Only ever seeds data for the AUTHENTICATED caller — the body userId is
    // ignored so this cannot be used to populate arbitrary accounts.
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabase = createServerSupabase(getBearerToken(req));

    const { data: existingMemberships } = await supabase
      .from('memberships')
      .select('business_id')
      .eq('user_id', userId);

    if (existingMemberships && existingMemberships.length > 0) {
      return NextResponse.json({ message: 'User already has businesses', skipped: true });
    }

    const businesses = [
      {
        name: 'Urban Threads',
        type: 'clothing_store',
        country: 'Rwanda',
        city: 'Kigali',
        email: 'info@urbanthreads.rw',
        phone: '+250 788 111 222',
        description: 'Premium clothing store offering stylish apparel for men and women. We carry sneakers, shirts, jeans, and accessories.',
        website_url: null,
        currency: 'RWF',
        status: 'active',
      },
      {
        name: 'Beauty Salon Kigali',
        type: 'salon',
        country: 'Rwanda',
        city: 'Kigali',
        email: 'hello@beautysalon.kigali',
        phone: '+250 788 333 444',
        description: 'Full-service beauty salon offering haircuts, braiding, manicures, and beauty treatments. Appointments recommended.',
        website_url: null,
        currency: 'RWF',
        status: 'active',
      },
      {
        name: 'Lakeview Hotel',
        type: 'hotel',
        country: 'Rwanda',
        city: 'Kigali',
        email: 'reservations@lakeviewhotel.rw',
        phone: '+250 788 555 666',
        description: 'Boutique hotel with standard rooms, deluxe rooms, and conference facilities. Located near Lake Kivu with beautiful views.',
        website_url: 'https://example-lakeview.com',
        currency: 'USD',
        status: 'active',
      },
    ];

    const templates = getTemplates();
    const created: string[] = [];

    for (const bizData of businesses) {
      const { data: business, error: bizError } = await supabase
        .from('businesses')
        .insert(bizData)
        .select()
        .single();

      if (bizError) {
        console.error('Business creation error:', bizError);
        continue;
      }

      created.push(business.id);

      await supabase.from('memberships').insert({
        user_id: userId,
        business_id: business.id,
        role: 'business_owner',
      });

      for (const day of [0, 1, 2, 3, 4, 5, 6]) {
        const isWeekend = day === 0;
        await supabase.from('business_hours').insert({
          business_id: business.id,
          day_of_week: day,
          open_time: isWeekend ? null : '08:00',
          close_time: isWeekend ? null : '18:00',
          is_closed: isWeekend,
        });
      }

      if (bizData.type === 'clothing_store') {
        await supabase.from('products').insert([
          { business_id: business.id, name: 'Black Sneakers', description: 'Premium black leather sneakers, sizes 39-44', price: 45000, currency: 'RWF', stock: 12, attributes: { color: 'black', sizes: '39,40,41,42,43,44' }, is_active: true },
          { business_id: business.id, name: 'White Shirt', description: 'Crisp cotton white shirt, slim fit', price: 25000, currency: 'RWF', stock: 20, attributes: { color: 'white', sizes: 'S,M,L,XL' }, is_active: true },
          { business_id: business.id, name: 'Blue Jeans', description: 'Classic blue denim jeans, straight fit', price: 35000, currency: 'RWF', stock: 15, attributes: { color: 'blue', sizes: '30,32,34,36' }, is_active: true },
        ]);
        await supabase.from('faqs').insert([
          { business_id: business.id, question: 'Do you offer delivery?', answer: 'Yes, we offer delivery within Kigali for 2,000 RWF. Orders are delivered within 1-2 business days.', category: 'delivery', is_published: true },
          { business_id: business.id, question: 'What is your return policy?', answer: 'Items can be returned within 14 days if unused and in original packaging.', category: 'returns', is_published: true },
          { business_id: business.id, question: 'Do you have physical stores?', answer: 'Yes, we are located in Kimironko, Kigali. Open Monday to Saturday 8am-6pm.', category: 'general', is_published: true },
        ]);
        await supabase.from('business_policies').insert([
          { business_id: business.id, title: 'Delivery Policy', content: 'Free delivery for orders above 50,000 RWF within Kigali. Standard delivery fee is 2,000 RWF.', category: 'delivery' },
          { business_id: business.id, title: 'Return Policy', content: 'Items can be returned within 14 days of purchase if unused and in original packaging.', category: 'returns' },
        ]);
      } else if (bizData.type === 'salon') {
        await supabase.from('services').insert([
          { business_id: business.id, name: 'Haircut', description: 'Professional haircut with wash and style', price: 5000, currency: 'RWF', duration_minutes: 30, is_active: true },
          { business_id: business.id, name: 'Braiding', description: 'Professional hair braiding service', price: 15000, currency: 'RWF', duration_minutes: 120, is_active: true },
          { business_id: business.id, name: 'Manicure', description: 'Full manicure with polish', price: 7000, currency: 'RWF', duration_minutes: 45, is_active: true },
        ]);
        await supabase.from('faqs').insert([
          { business_id: business.id, question: 'Do I need an appointment?', answer: 'Appointments are recommended but walk-ins are welcome. Call us at +250 788 333 444 to book.', category: 'appointments', is_published: true },
          { business_id: business.id, question: 'What are your hours?', answer: 'We are open Monday to Saturday, 8:00 AM to 6:00 PM. Closed on Sundays.', category: 'hours', is_published: true },
        ]);
        await supabase.from('business_policies').insert([
          { business_id: business.id, title: 'Cancellation Policy', content: 'Please cancel appointments at least 2 hours in advance. Late cancellations may incur a 50% fee.', category: 'cancellation' },
        ]);
      } else if (bizData.type === 'hotel') {
        await supabase.from('services').insert([
          { business_id: business.id, name: 'Standard Room', description: 'Comfortable room with queen bed, WiFi, and breakfast included', price: 80, currency: 'USD', duration_minutes: null, is_active: true },
          { business_id: business.id, name: 'Deluxe Room', description: 'Spacious room with king bed, lake view, mini bar, and breakfast', price: 150, currency: 'USD', duration_minutes: null, is_active: true },
          { business_id: business.id, name: 'Conference Room', description: 'Full-day conference room with AV equipment, seating up to 50', price: 300, currency: 'USD', duration_minutes: null, is_active: true },
        ]);
        await supabase.from('faqs').insert([
          { business_id: business.id, question: 'Is breakfast included?', answer: 'Yes, breakfast is included with all room bookings. We serve a continental breakfast from 6:30 AM to 10:00 AM.', category: 'amenities', is_published: true },
          { business_id: business.id, question: 'Do you have parking?', answer: 'Yes, we offer free parking for all hotel guests.', category: 'amenities', is_published: true },
          { business_id: business.id, question: 'What is the check-in time?', answer: 'Check-in is from 2:00 PM. Check-out is by 11:00 AM. Early check-in is subject to availability.', category: 'general', is_published: true },
        ]);
        await supabase.from('business_policies').insert([
          { business_id: business.id, title: 'Booking Policy', content: 'Reservations can be made online or by phone. A deposit may be required for group bookings.', category: 'booking' },
          { business_id: business.id, title: 'Cancellation Policy', content: 'Free cancellation up to 48 hours before check-in. Within 48 hours, one night will be charged.', category: 'cancellation' },
        ]);
      }

      for (const tpl of templates) {
        await supabase.from('workflows').insert({
          business_id: business.id,
          name: tpl.name,
          description: tpl.description,
          trigger_type: tpl.trigger_type,
          trigger_condition: { intent: tpl.trigger_intent },
          steps: tpl.steps,
          status: 'active',
          version: 1,
          is_template: false,
          template_id: tpl.id,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${created.length} demo businesses with products, services, FAQs, policies, and workflows`,
      businessIds: created,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Seed failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
