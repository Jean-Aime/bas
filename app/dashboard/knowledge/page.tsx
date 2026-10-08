'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase, authHeaders } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, Trash2, Loader2, Globe, FileText, HelpCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import type { BusinessPolicy, FAQ, KnowledgeSource } from '@/lib/types';

export default function KnowledgePage() {
  const { currentBusiness } = useBusiness();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [policies, setPolicies] = useState<BusinessPolicy[]>([]);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [faqDialog, setFaqDialog] = useState(false);
  const [policyDialog, setPolicyDialog] = useState(false);
  const [urlDialog, setUrlDialog] = useState(false);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'general' });
  const [policyForm, setPolicyForm] = useState({ title: '', content: '', category: 'general' });
  const [urlForm, setUrlForm] = useState({ url: '', title: '' });
  const [importing, setImporting] = useState(false);

  useEffect(() => { if (currentBusiness) loadAll(); }, [currentBusiness]);

  const loadAll = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const bid = currentBusiness.id;
    const [f, p, s] = await Promise.all([
      supabase.from('faqs').select('*').eq('business_id', bid).order('created_at', { ascending: false }),
      supabase.from('business_policies').select('*').eq('business_id', bid).order('created_at', { ascending: false }),
      supabase.from('knowledge_sources').select('*').eq('business_id', bid).order('created_at', { ascending: false }),
    ]);
    setFaqs((f.data || []) as FAQ[]);
    setPolicies((p.data || []) as BusinessPolicy[]);
    setSources((s.data || []) as KnowledgeSource[]);
    setLoading(false);
  };

  const saveFaq = async () => {
    if (!currentBusiness || !faqForm.question || !faqForm.answer) return;
    const { error } = await supabase.from('faqs').insert({ business_id: currentBusiness.id, ...faqForm, is_published: true });
    if (error) { toast.error(error.message); return; }
    toast.success('FAQ added');
    setFaqDialog(false);
    setFaqForm({ question: '', answer: '', category: 'general' });
    loadAll();
  };

  const savePolicy = async () => {
    if (!currentBusiness || !policyForm.title || !policyForm.content) return;
    const { error } = await supabase.from('business_policies').insert({ business_id: currentBusiness.id, ...policyForm });
    if (error) { toast.error(error.message); return; }
    toast.success('Policy added');
    setPolicyDialog(false);
    setPolicyForm({ title: '', content: '', category: 'general' });
    loadAll();
  };

  const importWebsite = async () => {
    if (!currentBusiness || !urlForm.url) return;
    setImporting(true);
    try {
      const response = await fetch('/api/knowledge/import-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ url: urlForm.url, title: urlForm.title || urlForm.url, businessId: currentBusiness.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Import failed');
      toast.success(`Imported ${result.documentsCount || 0} knowledge documents`);
      setUrlDialog(false);
      setUrlForm({ url: '', title: '' });
      loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const deleteFaq = async (id: string) => { await supabase.from('faqs').delete().eq('id', id); toast.success('FAQ deleted'); loadAll(); };
  const deletePolicy = async (id: string) => { await supabase.from('business_policies').delete().eq('id', id); toast.success('Policy deleted'); loadAll(); };
  const deleteSource = async (id: string) => { await supabase.from('knowledge_sources').delete().eq('id', id); toast.success('Source deleted'); loadAll(); };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground">Manage FAQs, policies, and knowledge sources for your AI assistant</p>
      </div>

      <Tabs defaultValue="faqs">
        <TabsList>
          <TabsTrigger value="faqs" className="gap-2"><HelpCircle className="h-4 w-4" /> FAQs</TabsTrigger>
          <TabsTrigger value="policies" className="gap-2"><Shield className="h-4 w-4" /> Policies</TabsTrigger>
          <TabsTrigger value="sources" className="gap-2"><Globe className="h-4 w-4" /> Sources</TabsTrigger>
        </TabsList>

        {/* FAQs */}
        <TabsContent value="faqs" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={faqDialog} onOpenChange={setFaqDialog}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add FAQ</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add FAQ</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Question</Label><Input value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} placeholder="What are your opening hours?" /></div>
                  <div className="space-y-2"><Label>Answer</Label><Textarea value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} rows={4} placeholder="We're open Monday to Saturday, 8am to 6pm." /></div>
                  <div className="space-y-2"><Label>Category</Label><Input value={faqForm.category} onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })} placeholder="general" /></div>
                  <Button onClick={saveFaq} className="w-full">Add FAQ</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {faqs.length === 0 ? (
            <Card><CardContent className="flex flex-col items-center py-12 text-center">
              <HelpCircle className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No FAQs yet. Add questions your customers frequently ask.</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-3">{faqs.map((f) => (
              <Card key={f.id}><CardContent className="flex items-start justify-between p-4">
                <div className="flex-1">
                  <p className="font-medium">{f.question}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.answer}</p>
                  <Badge variant="outline" className="mt-2">{f.category}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteFaq(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </CardContent></Card>
            ))}</div>
          )}
        </TabsContent>

        {/* Policies */}
        <TabsContent value="policies" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={policyDialog} onOpenChange={setPolicyDialog}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Policy</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Policy</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Title</Label><Input value={policyForm.title} onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })} placeholder="Return Policy" /></div>
                  <div className="space-y-2"><Label>Content</Label><Textarea value={policyForm.content} onChange={(e) => setPolicyForm({ ...policyForm, content: e.target.value })} rows={4} placeholder="Items can be returned within 30 days..." /></div>
                  <div className="space-y-2"><Label>Category</Label><Input value={policyForm.category} onChange={(e) => setPolicyForm({ ...policyForm, category: e.target.value })} placeholder="returns" /></div>
                  <Button onClick={savePolicy} className="w-full">Add Policy</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {policies.length === 0 ? (
            <Card><CardContent className="flex flex-col items-center py-12 text-center">
              <Shield className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No policies yet. Add your business policies for the AI to reference.</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-3">{policies.map((p) => (
              <Card key={p.id}><CardContent className="flex items-start justify-between p-4">
                <div className="flex-1">
                  <p className="font-medium">{p.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.content}</p>
                  <Badge variant="outline" className="mt-2">{p.category}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deletePolicy(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </CardContent></Card>
            ))}</div>
          )}
        </TabsContent>

        {/* Knowledge Sources */}
        <TabsContent value="sources" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={urlDialog} onOpenChange={setUrlDialog}>
              <DialogTrigger asChild><Button size="sm"><Globe className="mr-2 h-4 w-4" /> Import Website</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Import Website Content</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Website URL</Label><Input value={urlForm.url} onChange={(e) => setUrlForm({ ...urlForm, url: e.target.value })} placeholder="https://example.com" /></div>
                  <div className="space-y-2"><Label>Title (optional)</Label><Input value={urlForm.title} onChange={(e) => setUrlForm({ ...urlForm, title: e.target.value })} placeholder="My Business Website" /></div>
                  <p className="text-xs text-muted-foreground">BAS will fetch publicly accessible content from this URL and convert it into structured knowledge for your AI assistant.</p>
                  <Button onClick={importWebsite} disabled={importing} className="w-full">
                    {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
                    {importing ? 'Importing...' : 'Import'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {sources.length === 0 ? (
            <Card><CardContent className="flex flex-col items-center py-12 text-center">
              <Globe className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No knowledge sources yet. Import content from your website URL.</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-3">{sources.map((s) => (
              <Card key={s.id}><CardContent className="flex items-start justify-between p-4">
                <div className="flex items-start gap-3 flex-1">
                  {s.source_type === 'website' ? <Globe className="h-5 w-5 text-primary mt-0.5" /> : <FileText className="h-5 w-5 text-primary mt-0.5" />}
                  <div className="flex-1">
                    <p className="font-medium">{s.title}</p>
                    {s.url && <p className="text-xs text-muted-foreground truncate">{s.url}</p>}
                    <Badge variant="outline" className="mt-2">{s.source_type}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteSource(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </CardContent></Card>
            ))}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
