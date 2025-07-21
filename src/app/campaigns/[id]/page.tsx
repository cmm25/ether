import AppLayout from "../../../components/Layout/AppLayout";
import CampaignDetailPage from "../../../pages/CampaignDetail";

interface CampaignDetailProps {
  params: {
    id: string;
  };
}

export default function CampaignDetail({ params }: CampaignDetailProps) {
  return (
    <AppLayout>
      <CampaignDetailPage campaignId={params.id} />
    </AppLayout>
  );
}