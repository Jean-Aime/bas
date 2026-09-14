import { redirect } from 'next/navigation';

export default function EditWorkflowPage({ params }: { params: { workflowId: string } }) {
  redirect(`/dashboard/automation/${params.workflowId}`);
}