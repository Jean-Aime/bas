'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { authHeaders } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NewKnowledgeSourcePage() {
  const router = useRouter();
  const { currentBusiness } = useBusiness();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleImport = async () => {
    if (!currentBusiness || !url.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/knowledge/import-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ businessId: currentBusiness.id, url: url.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Import failed');
      toast.success(data.message || 'Website content imported');
      setDone(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New knowledge source</h1>
        <p className="text-muted-foreground">Import public content from a website URL as structured business knowledge.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Website import</CardTitle>
          <CardDescription>
            BAS fetches the URL, extracts accessible public content, and stores it as knowledge you can review.
            This grants knowledge access only — never transactional access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              required
              placeholder="https://example-business.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={done}
            />
          </div>
          {done ? (
            <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 p-3 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" /> Import complete — review it in the Knowledge page.
              <Button size="sm" variant="link" className="ml-auto" onClick={() => router.push('/dashboard/knowledge')}>Go to Knowledge</Button>
            </div>
          ) : (
            <Button onClick={handleImport} disabled={loading || !url.trim()}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
              {loading ? 'Importing…' : 'Start import'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}