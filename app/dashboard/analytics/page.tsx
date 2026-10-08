'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Loader2, MessageSquare, Bot, User, TrendingUp } from 'lucide-react';

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#a855f7'];

export default function AnalyticsPage() {
  const { currentBusiness } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [intentData, setIntentData] = useState<{ name: string; value: number }[]>([]);
  const [channelData, setChannelData] = useState<{ name: string; value: number }[]>([]);
  const [dailyData, setDailyData] = useState<{ date: string; messages: number }[]>([]);
  const [stats, setStats] = useState({ totalMessages: 0, aiMessages: 0, customerMessages: 0, conversations: 0 });

  useEffect(() => { if (currentBusiness) loadAnalytics(); }, [currentBusiness]);

  const loadAnalytics = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const bid = currentBusiness.id;

    const [msgs, convs] = await Promise.all([
      supabase.from('messages').select('sender_type, intent, created_at').eq('business_id', bid),
      supabase.from('conversations').select('channel, detected_intent').eq('business_id', bid),
    ]);

    const allMsgs = (msgs.data || []) as Array<Record<string, string>>;
    const allConvs = (convs.data || []) as Array<Record<string, string>>;

    const intentMap: Record<string, number> = {};
    allConvs.forEach((c) => {
      const intent = c.detected_intent || 'general';
      intentMap[intent] = (intentMap[intent] || 0) + 1;
    });
    setIntentData(Object.entries(intentMap).map(([name, value]) => ({ name, value })));

    const channelMap: Record<string, number> = {};
    allConvs.forEach((c) => {
      const ch = c.channel || 'web_chat';
      channelMap[ch] = (channelMap[ch] || 0) + 1;
    });
    setChannelData(Object.entries(channelMap).map(([name, value]) => ({ name, value })));

    const dailyMap: Record<string, number> = {};
    allMsgs.forEach((m) => {
      const d = new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap[d] = (dailyMap[d] || 0) + 1;
    });
    setDailyData(Object.entries(dailyMap).slice(-7).map(([date, messages]) => ({ date, messages })));

    setStats({
      totalMessages: allMsgs.length,
      aiMessages: allMsgs.filter((m) => m.sender_type === 'assistant').length,
      customerMessages: allMsgs.filter((m) => m.sender_type === 'customer').length,
      conversations: allConvs.length,
    });
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Conversation insights and automation performance</p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50"><MessageSquare className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-sm text-muted-foreground">Total Messages</p><p className="text-2xl font-bold">{stats.totalMessages}</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Bot className="h-5 w-5 text-primary" /></div>
            <div><p className="text-sm text-muted-foreground">AI Responses</p><p className="text-2xl font-bold">{stats.aiMessages}</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10"><User className="h-5 w-5 text-warning" /></div>
            <div><p className="text-sm text-muted-foreground">Customer Messages</p><p className="text-2xl font-bold">{stats.customerMessages}</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50"><TrendingUp className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-sm text-muted-foreground">Conversations</p><p className="text-2xl font-bold">{stats.conversations}</p></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Messages Over Time</CardTitle></CardHeader>
          <CardContent>
            {dailyData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="messages" stroke="#0ea5e9" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Intent Distribution</CardTitle></CardHeader>
          <CardContent>
            {intentData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={intentData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name }) => name}>
                    {intentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Channel Distribution</CardTitle></CardHeader>
          <CardContent>
            {channelData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={channelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
