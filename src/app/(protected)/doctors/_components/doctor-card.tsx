"use client";

import { CalendarIcon, ClockIcon, DollarSignIcon, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteDoctor } from "@/actions/delete-doctor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { doctorsTable } from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/currency";

import { getAvailability } from "../_helpers/availability";
import UpsertDoctorForm from "./upsert-doctor-form";

interface DoctorCardProps {
  doctor: typeof doctorsTable.$inferSelect;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  const [isUpsertDoctorDialogOpen, setIsUpsertDoctorDialogOpen] =
    useState(false);
  const deleteDoctorAction = useAction(deleteDoctor, {
    onSuccess: () => {
      toast.success("Médico deletado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar médico.");
    },
  });
  const handleDeleteDoctorClick = () => {
    if (!doctor) return;
    deleteDoctorAction.execute({ id: doctor.id });
  };

  const doctorInitials = doctor.name
    .split(" ")
    .map((name) => name[0])
    .join("");

  const availability = getAvailability(doctor);

  // Gerar cor do avatar baseada no nome
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };
  return (
    <Card className="flex h-96 flex-col transition-all duration-200 hover:shadow-md">
      {" "}
      <CardHeader className="pb-8">
        <div className="flex items-start gap-3">
          <Avatar className={`h-12 w-12 ${getAvatarColor(doctor.name)}`}>
            <AvatarFallback className="font-semibold text-black">
              {doctorInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold">{doctor.name}</h3>
            <p className="text-muted-foreground text-sm">{doctor.specialty}</p>
          </div>
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 text-xs text-green-700"
          >
            <div className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></div>
            Disponível
          </Badge>{" "}
        </div>
      </CardHeader>
      <CardContent className="flex-1 py-6">
        <div className="space-y-5">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <CalendarIcon className="h-3 w-3" />
            <span>
              {availability.from.format("dddd")} a{" "}
              {availability.to.format("dddd")}
            </span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <ClockIcon className="h-3 w-3" />
            <span>
              {availability.from.format("HH:mm")} às{" "}
              {availability.to.format("HH:mm")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <DollarSignIcon className="h-4 w-4 text-green-600" />
              <span className="text-base font-semibold text-green-600">
                {formatCurrencyInCents(doctor.appointmentPriceInCents)}
              </span>
            </div>
            <span className="text-muted-foreground text-xs">por consulta</span>
          </div>{" "}
        </div>
      </CardContent>
      <CardFooter className="pt-4 pb-6">
        <div className="flex w-full gap-2">
          <Dialog
            open={isUpsertDoctorDialogOpen}
            onOpenChange={setIsUpsertDoctorDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="h-10 flex-1">Ver detalhes</Button>
            </DialogTrigger>
            <UpsertDoctorForm
              doctor={{
                ...doctor,
                availableFromTime: availability.from.format("HH:mm:ss"),
                availableToTime: availability.to.format("HH:mm:ss"),
              }}
              onSuccess={() => setIsUpsertDoctorDialogOpen(false)}
            />
          </Dialog>

          <TooltipProvider>
            <Tooltip>
              <AlertDialog>
                {" "}
                <AlertDialogTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 border-red-200 hover:border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TooltipTrigger>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Tem certeza que deseja deletar esse médico?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Essa ação não pode ser revertida. Isso irá deletar o
                      médico e todas as consultas agendadas.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteDoctorClick}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Deletar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <TooltipContent>
                <p>Deletar médico</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DoctorCard;
