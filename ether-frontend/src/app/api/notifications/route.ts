import { NextRequest, NextResponse } from 'next/server';
// Use server-side client (service role) so we can safely enforce filtering
// and not rely on client JWT claims for RLS.
import { supabaseServer as supabase } from '@/lib/supabase/serverClient';
import NotificationService from '@/lib/blockchain/notificationService';
import { Notification } from '@/types/notifications';

// Ensure table exists (id text pk, user_address text, payload jsonb, timestamp timestamptz, read boolean)
async function ensureTable() {
    try {
        await supabase.rpc('noop');
    } catch {
        // ignore
    }
}

export async function GET(req: NextRequest) {
    try {
        await ensureTable();
        const { searchParams } = new URL(req.url);
        const user = searchParams.get('user');
        if (!user) {
            return NextResponse.json({ error: 'Missing user parameter' }, { status: 400 });
        }

        // Generate latest notifications from chain/services
        const live: Notification[] = await NotificationService.getUserNotifications(user);

        // Load stored read state
        const { data: stored, error } = await supabase
            .from('notifications')
            .select('id, read')
            .eq('user_address', user);

        if (error) {
            console.warn('Supabase load error:', error.message);
        }

        const readMap = new Map<string, boolean>((stored || []).map((n: { id: string; read: boolean }) => [n.id, n.read]));

        // Upsert current notifications with preserved read flags
        const toUpsert: Array<{ id: string; user_address: string; payload: Notification; read: boolean; timestamp: string }> = live.map((n) => ({
            id: n.id,
            user_address: user,
            payload: n,
            read: readMap.get(n.id) ?? false,
            timestamp: n.timestamp,
        }));

        if (toUpsert.length) {
            const { error: upErr } = await supabase.from('notifications').upsert(toUpsert, { onConflict: 'id,user_address' });
            if (upErr) console.warn('Supabase upsert error:', upErr.message);
        }

        // Return merged list
        const merged: Notification[] = toUpsert.map((r) => ({
            ...r.payload,
            read: r.read,
        }));

        return NextResponse.json({ notifications: merged }, { status: 200 });
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to fetch notifications';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await ensureTable();
        const body = await req.json();
        const { user, id, all } = body as { user: string; id?: string; all?: boolean };
        if (!user) return NextResponse.json({ error: 'Missing user' }, { status: 400 });

        if (all) {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_address', user);
            if (error) throw new Error(error.message);
            return NextResponse.json({ ok: true });
        }

        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_address', user)
            .eq('id', id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to update notifications';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}


