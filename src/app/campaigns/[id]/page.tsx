import AppLayout from "../../../components/Layout/AppLayout";
import CampaignDetailPage from "../../../pages/CampaignDetail";

interface CampaignDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CampaignDetail({ params }: CampaignDetailProps) {
  const { id } = await params;
  
  return (
    <AppLayout>
      <CampaignDetailPage campaignId={id} />
    </AppLayout>
  );
}