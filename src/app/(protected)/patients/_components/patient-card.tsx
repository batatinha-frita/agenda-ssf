import { Mail, Phone, User, Eye } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PatientCardProps {
  patient: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    sex: "male" | "female";
  };
}

const PatientCard = ({ patient }: PatientCardProps) => {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <User className="text-muted-foreground h-5 w-5" />
            <div>
              <CardTitle className="text-lg">{patient.name}</CardTitle>
              <CardDescription>
                <Badge variant="secondary" className="mt-1">
                  {patient.sex === "male" ? "Masculino" : "Feminino"}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>{" "}
      <CardContent className="space-y-3">
        <div className="text-muted-foreground flex items-center space-x-2 text-sm">
          <Mail className="h-4 w-4" />
          <span>{patient.email}</span>
        </div>
        <div className="text-muted-foreground flex items-center space-x-2 text-sm">
          <Phone className="h-4 w-4" />
          <span>{patient.phoneNumber}</span>
        </div>
        <div className="pt-2">
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link href={`/patients/${patient.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalhes
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientCard;
