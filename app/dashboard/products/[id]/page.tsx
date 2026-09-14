'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Pencil } from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/ui/page-states';

interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  sku: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentBusiness } = useBusiness();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (currentBusiness) loadProduct();
  }, [currentBusiness, id]);

  const loadProduct = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('products').select('*').eq('id', id).eq('business_id', currentBusiness.id).maybeSingle();
    if (err || !data) {
      setError(true);
      setLoading(false);
      return;
    }
    setProduct(data as ProductDetail);
    setLoading(false);
  };

  if (loading) return <LoadingState label="Loading product…" />;
  if (error || !product) return <ErrorState message="This product does not exist in the current business." onRetry={loadProduct} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="icon" aria-label="Back to products"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-sm text-muted-foreground">Added {new Date(product.created_at).toLocaleDateString()}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={product.is_active ? 'default' : 'secondary'}>{product.is_active ? 'Active' : 'Inactive'}</Badge>
          <Link href={`/dashboard/products/${product.id}/edit`}>
            <Button size="sm" variant="outline"><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span className="font-medium">{product.currency} {product.price.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">SKU</span><span className="font-medium">{product.sku || '—'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Stock</span><span className="font-medium">{product.stock}</span></div>
          {product.description && <div className="flex justify-between"><span className="text-muted-foreground">Description</span><span className="max-w-[60%] text-right">{product.description}</span></div>}
          <div className="flex justify-between"><span className="text-muted-foreground">Last updated</span><span>{new Date(product.updated_at).toLocaleString()}</span></div>
        </CardContent>
      </Card>
    </div>
  );
}