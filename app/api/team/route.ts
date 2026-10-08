import { NextRequest, NextResponse } from 'next/server';
import {
  createAdminSupabase,
  getAuthenticatedUserId,
  getBearerToken,
  callerRoleInBusiness,
} from '@/lib/supabase/server';

const VALID_ROLES = ['business_owner', 'business_admin', 'staff', 'automation_manager'];
const ADMIN_ROLES = ['business_owner', 'business_admin'];

/**
 * Every handler follows the same pattern:
 *  1. Verify WHO is calling (Supabase JWT; 401 when missing/invalid).
 *  2. Check their role in the target business with a USER-scoped client so
 *     RLS decides — the request body cannot spoof membership.
 *  3. Only then use the service-role client for operations RLS legitimately
 *     blocks for users (managing OTHER people's membership rows, listing
 *     emails via the Auth admin API).
 */

async function emailByIds(ids: string[]): Promise<Record<string, string>> {
  const emails: Record<string, string> = {};
  if (ids.length === 0) return emails;

  const admin = createAdminSupabase();
  let page = 1;
  // Paginate until every user id is resolved or a safety bound is hit.
  for (let i = 0; i < 20; i++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data) break;
    for (const u of data.users) {
      if (ids.includes(u.id)) emails[u.id] = u.email || 'Unknown';
    }
    if (data.users.length < 1000) break;
    page += 1;
  }
  return emails;
}

export async function GET(req: NextRequest) {
  try {
    // Auth first — an unauthenticated caller never gets past this point,
    // regardless of what else the request contains.
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const businessId = req.nextUrl.searchParams.get('businessId');
    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    // Any member may view the team roster.
    const role = await callerRoleInBusiness(getBearerToken(req), userId, businessId);
    if (!role) {
      return NextResponse.json({ error: 'You are not a member of this business' }, { status: 403 });
    }

    const admin = createAdminSupabase();
    const { data: memberships, error } = await admin
      .from('memberships')
      .select('id, user_id, business_id, role, created_at')
      .eq('business_id', businessId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const emails = await emailByIds((memberships || []).map((m) => m.user_id));

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

    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!businessId || !email || !role) {
      return NextResponse.json({ error: 'businessId, email, and role are required' }, { status: 400 });
    }
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Only owners/admins may add members.
    const callerRole = await callerRoleInBusiness(getBearerToken(req), userId, businessId, ADMIN_ROLES);
    if (!callerRole) {
      return NextResponse.json({ error: 'Only business owners and admins can add team members' }, { status: 403 });
    }

    const admin = createAdminSupabase();
    const { data: users, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    const target = users.users.find((u) => u.email?.toLowerCase() === String(email).toLowerCase());
    if (!target) {
      return NextResponse.json({ error: 'No BAS account found for this email. The user must sign up first.' }, { status: 404 });
    }

    const { error: membershipError } = await admin
      .from('memberships')
      .insert({ user_id: target.id, business_id: businessId, role });

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

    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!id || !role) {
      return NextResponse.json({ error: 'id and role are required' }, { status: 400 });
    }
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const admin = createAdminSupabase();
    const { data: member } = await admin
      .from('memberships')
      .select('business_id')
      .eq('id', id)
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 });
    }

    const callerRole = await callerRoleInBusiness(getBearerToken(req), userId, member.business_id, ADMIN_ROLES);
    if (!callerRole) {
      return NextResponse.json({ error: 'Only business owners and admins can change roles' }, { status: 403 });
    }

    const { error } = await admin.from('memberships').update({ role }).eq('id', id);
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
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const admin = createAdminSupabase();
    const { data: member } = await admin
      .from('memberships')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 });
    }

    const callerRole = await callerRoleInBusiness(getBearerToken(req), userId, member.business_id, ADMIN_ROLES);
    if (!callerRole) {
      return NextResponse.json({ error: 'Only business owners and admins can remove members' }, { status: 403 });
    }

    if (member.role === 'business_owner') {
      return NextResponse.json({ error: 'Business owners cannot be removed. Transfer ownership first.' }, { status: 400 });
    }

    const { error } = await admin.from('memberships').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to remove member';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
