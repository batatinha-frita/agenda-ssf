import { Stethoscope } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TopDoctorsProps {
  doctors: {
    id: string;
    name: string;
    avatarImageUrl: string | null;
    specialty: string;
    appointments: number;
  }[];
}

export default function TopDoctors({ doctors }: TopDoctorsProps) {
  return (
    <Card className="mx-auto w-full">
      <CardContent className="p-4">
        {" "}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="text-muted-foreground h-4 w-4" />
            <CardTitle className="text-base">Top Médicos</CardTitle>
          </div>
          <Link href="/doctors">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary text-xs"
            >
              Ver todos
            </Button>
          </Link>
        </div>{" "}
        {/* Lista vertical de médicos */}
        <div className="space-y-2">
          {doctors.slice(0, 5).map((doctor) => (
            <div key={doctor.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gray-100 text-sm font-medium text-gray-600">
                    {doctor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xs font-medium">{doctor.name}</h3>
                  <p className="text-muted-foreground text-xs">
                    {doctor.specialty}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground text-xs font-medium">
                  {doctor.appointments} agend.
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
