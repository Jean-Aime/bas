import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

const VALID_ROLES = ['business_owner', 'business_admin', 'staff', 'automation_manager'];

export async function GET(req: NextRequest) {
  try {
    const businessId = req.nextUrl.searchParams.get('businessId');
    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: memberships, error } = await supabase
      .from('memberships')
      .select('id, user_id, business_id, role, created_at')
      .eq('business_id', businessId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const emails: Record<string, string> = {};
    const userIds = (memberships || []).map((m) => m.user_id);
    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: Math.max(userIds.length, 1),
      });
      if (!usersError) {
        for (const u of users.users) emails[u.id] = u.email || 'Unknown';
      }
    }

    return NextResponse.json({
      members: (memberships || []).map((m) => ({
        id: m.id,
        user_id: m.user_id,
        business_id: m.business_id,
        role: m.role,
        created_at: m.created_at,
        email: emails[m.user_id] || 'Unknown',
      })),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to list members';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessId, email, role } = await req.json();

    if (!businessId || !email || !role) {
      return NextResponse.json({ error: 'businessId, email, and role are required' }, { status: 400 });
    }
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: users, error: usersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    const user = users.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      return NextResponse.json({ error: 'No BAS account found for this email. The user must sign up first.' }, { status: 404 });
    }

    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({ user_id: user.id, business_id: businessId, role });

    if (membershipError) {
      if (membershipError.code === '23505') {
        return NextResponse.json({ error: 'This user is already a member of the business' }, { status: 409 });
      }
      return NextResponse.json({ error: membershipError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to add member';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, role } = await req.json();

    if (!id || !role) {
      return NextResponse.json({ error: 'id and role are required' }, { status: 400 });
    }
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { error } = await supabase.from('memberships').update({ role }).eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to update member';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: member } = await supabase
      .from('memberships')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 });
    }

    if (member.role === 'business_owner') {
      return NextResponse.json({ error: 'Business owners cannot be removed. Transfer ownership first.' }, { status: 400 });
    }

    const { error } = await supabase.from('memberships').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to remove member';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}