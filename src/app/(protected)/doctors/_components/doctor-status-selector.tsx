"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

import { updateDoctorStatus } from "@/actions/update-doctor-status";
import {
  getDoctorStatusConfig,
  getAllDoctorStatuses,
  type DoctorStatus,
} from "@/lib/doctor-status";

interface DoctorStatusSelectorProps {
  doctorId: string;
  currentStatus: DoctorStatus;
}

export function DoctorStatusSelector({
  doctorId,
  currentStatus,
}: DoctorStatusSelectorProps) {
  const updateStatusAction = useAction(updateDoctorStatus, {
    onSuccess: () => {
      toast.success("Status do médico atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(
        error.error.serverError || "Erro ao atualizar status do médico.",
      );
    },
  });

  const currentConfig = getDoctorStatusConfig(currentStatus);
  const allStatuses = getAllDoctorStatuses();

  const handleStatusChange = (newStatus: DoctorStatus) => {
    if (newStatus === currentStatus) return;

    updateStatusAction.execute({
      doctorId,
      status: newStatus,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2"
          disabled={updateStatusAction.isExecuting}
        >
          <Badge className={currentConfig.className}>
            <span className="mr-1">{currentConfig.icon}</span>
            {currentConfig.label}
          </Badge>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {allStatuses.map((status) => {
          const config = getDoctorStatusConfig(status.value);
          return (
            <DropdownMenuItem
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              className="gap-2"
            >
              <span>{config.icon}</span>
              {config.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
