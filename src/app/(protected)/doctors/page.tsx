import {
  PageContainer,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageActions,
  PageContent,
} from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const DoctorsPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Médicos</PageTitle>
          <PageDescription>
            Gerencie os profissionais da sua empresa
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Button>
            <Plus />
            Novo médico
          </Button>
        </PageActions>
      </PageHeader>
      <PageContent>
        <h1>Profissionais</h1>
      </PageContent>
    </PageContainer>
  );
};

export default DoctorsPage;
