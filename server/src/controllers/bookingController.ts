import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const createBooking = async (req: Request, res: Response) => {
    try {
        const { venue_id, start_time, end_time } = req.body;
        const userId = (req as any).user.userId;

        const start = new Date(start_time);
        const end = new Date(end_time);
        const venueId = Number(venue_id);

        // 1. Fetch Venue Config
        const { data: venue, error: venueError } = await supabase
            .from('Venue')
            .select('*')
            .eq('id', venueId)
            .single();

        if (venueError || !venue) return res.status(404).json({ error: 'Venue not found' });

        // 2. Validate Advance Time
        const now = new Date();
        const hoursUntilStart = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursUntilStart < venue.min_advance_hours) {
            return res.status(400).json({ error: `Reserva deve ser feita com ${venue.min_advance_hours}h de antecedência.` });
        }

        // 3. Validate Future Limit
        const daysUntilStart = hoursUntilStart / 24;
        if (daysUntilStart > venue.max_future_days) {
            return res.status(400).json({ error: `Reserva permitida apenas para os próximos ${venue.max_future_days} dias.` });
        }

        // 4. Validate User Active Bookings Limit
        // Supabase doesn't support complex OR/AND in count easily, but we can use filter
        const { count: activeBookings, error: countError } = await supabase
            .from('Booking')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .in('status', ['PENDING', 'CONFIRMED'])
            .gt('start_time', now.toISOString());

        if (countError) throw countError;

        if ((activeBookings || 0) >= venue.max_active_bookings_per_user) {
            return res.status(400).json({ error: `Você atingiu o limite de ${venue.max_active_bookings_per_user} reservas ativas.` });
        }

        // 5. Check Availability (Overlap)
        // Overlap logic: (StartA < EndB) AND (EndA > StartB)
        // PostgREST syntax: start_time.lt.end, end_time.gt.start
        // But we need to check against existing bookings.
        // Existing booking: StartB, EndB. New booking: StartA, EndA.
        // Overlap if: StartB < EndA AND EndB > StartA
        // So we search for bookings where: start_time < EndA AND end_time > StartA
        const { data: overlap, error: overlapError } = await supabase
            .from('Booking')
            .select('id')
            .eq('venue_id', venueId)
            .neq('status', 'CANCELED')
            .lt('start_time', end.toISOString())
            .gt('end_time', start.toISOString())
            .limit(1);

        if (overlapError) throw overlapError;

        if (overlap && overlap.length > 0) {
            return res.status(409).json({ error: 'Horário indisponível.' });
        }

        // 6. Calculate Price
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        const totalPrice = (venue.price_per_hour || 0) * durationHours;

        // 7. Create Booking
        const { data: booking, error: createError } = await supabase
            .from('Booking')
            .insert([{
                venue_id: venueId,
                user_id: userId,
                start_time: start.toISOString(),
                end_time: end.toISOString(),
                status: 'CONFIRMED',
                total_price: totalPrice
            }])
            .select()
            .single();

        if (createError) throw createError;

        res.status(201).json(booking);

    } catch (error: any) {
        console.error('Create Booking Error:', error.message);
        res.status(500).json({ error: 'Error creating booking' });
    }
};

export const listMyBookings = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { data: bookings, error } = await supabase
            .from('Booking')
            .select('*, venue:Venue(*)')
            .eq('user_id', userId)
            .order('start_time', { ascending: false });

        if (error) throw error;
        res.json(bookings);
    } catch (error: any) {
        console.error('List My Bookings Error:', error.message);
        res.status(500).json({ error: 'Error fetching bookings' });
    }
};

export const getVenueAvailability = async (req: Request, res: Response) => {
    try {
        const { venueId } = req.params;
        const { date } = req.query; // YYYY-MM-DD

        if (!date) return res.status(400).json({ error: 'Date is required' });

        const startOfDay = new Date(`${date}T00:00:00.000Z`).toISOString();
        const endOfDay = new Date(`${date}T23:59:59.999Z`).toISOString();

        const { data: bookings, error } = await supabase
            .from('Booking')
            .select('start_time, end_time')
            .eq('venue_id', Number(venueId))
            .neq('status', 'CANCELED')
            .gte('start_time', startOfDay)
            .lte('start_time', endOfDay); // Simplified check, ideally check overlap with day

        if (error) throw error;

        res.json(bookings);
    } catch (error: any) {
        console.error('Get Availability Error:', error.message);
        res.status(500).json({ error: 'Error checking availability' });
    }
};
