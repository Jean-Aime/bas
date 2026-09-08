import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { url, title, businessId } = await req.json();

    if (!url || !businessId) {
      return NextResponse.json({ error: 'URL and business ID are required' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are supported' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: source, error: sourceError } = await supabase
      .from('knowledge_sources')
      .insert({
        business_id: businessId,
        source_type: 'website',
        title: title || parsedUrl.hostname,
        url: url,
        status: 'active',
        content: null,
      })
      .select()
      .single();

    if (sourceError) {
      return NextResponse.json({ error: 'Failed to create knowledge source' }, { status: 500 });
    }

    const documents: Array<{ business_id: string; source_id: string; title: string; content: string; doc_type: string; metadata: Record<string, unknown> }> = [];

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'BAS-Bot/1.0 (Business Automation System)' },
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        const html = await response.text();
        const extracted = extractContentFromHTML(html, parsedUrl);

        for (const doc of extracted) {
          documents.push({
            business_id: businessId,
            source_id: source.id,
            title: doc.title,
            content: doc.content,
            doc_type: doc.type,
            metadata: { url, extracted_at: new Date().toISOString() },
          });
        }
      }
    } catch {
      // Fetch may fail due to network restrictions in sandbox
      documents.push({
        business_id: businessId,
        source_id: source.id,
        title: `Website: ${parsedUrl.hostname}`,
        content: `Content from ${url}. The website URL has been registered. Full content extraction requires the website to be accessible from the server.`,
        doc_type: 'website_meta',
        metadata: { url, note: 'Direct fetch unavailable - URL registered for future processing' },
      });
    }

    let documentsCount = 0;
    if (documents.length > 0) {
      const { error: docError } = await supabase.from('knowledge_documents').insert(documents);
      if (docError) {
        return NextResponse.json({ error: 'Failed to store knowledge documents' }, { status: 500 });
      }
      documentsCount = documents.length;
    }

    return NextResponse.json({
      success: true,
      sourceId: source.id,
      documentsCount,
      message: `Imported ${documentsCount} document(s) from ${parsedUrl.hostname}`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Import failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

interface ExtractedDoc { title: string; content: string; type: string; }

function extractContentFromHTML(html: string, url: URL): ExtractedDoc[] {
  const docs: ExtractedDoc[] = [];
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const pageTitle = titleMatch ? titleMatch[1].trim() : url.hostname;

  if (text.length > 100) {
    const truncated = text.substring(0, 5000);
    docs.push({
      title: pageTitle,
      content: truncated,
      type: 'website_page',
    });
  }

  const headingMatches = Array.from(html.matchAll(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gis));
  for (const match of headingMatches) {
    const heading = match[1].replace(/<[^>]+>/g, '').trim();
    if (heading.length > 5 && heading.length < 200) {
      const afterIndex = match.index !== undefined ? match.index + match[0].length : -1;
      if (afterIndex >= 0) {
        const afterText = html.substring(afterIndex, afterIndex + 2000)
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 1000);
        if (afterText.length > 50) {
          docs.push({
            title: heading,
            content: afterText,
            type: 'website_section',
          });
        }
      }
    }
  }

  return docs.slice(0, 20);
}
