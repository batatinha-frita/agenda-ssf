import { AlertCircle, Crown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TrialBannerProps {
  daysLeft: number;
}

export function TrialBanner({ daysLeft }: TrialBannerProps) {
  const isUrgent = daysLeft <= 3;

  return (
    <div
      className={`fixed top-0 right-0 left-0 z-50 w-full px-4 py-3 text-center text-sm font-medium ${
        isUrgent
          ? "border-b border-red-200 bg-red-50 text-red-800"
          : "border-b border-amber-200 bg-amber-50 text-amber-800"
      } `}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-2">
        {isUrgent ? (
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
        ) : (
          <Crown className="h-4 w-4 flex-shrink-0" />
        )}

        <span className="flex-1">
          {isUrgent ? (
            <>
              ⏰ <strong>Atenção!</strong> Seu trial termina em{" "}
              <strong>
                {daysLeft} dia{daysLeft !== 1 ? "s" : ""}
              </strong>
            </>
          ) : (
            <>
              ✨ Você está no <strong>trial gratuito</strong>! Restam{" "}
              <strong>{daysLeft} dias</strong>
            </>
          )}
        </span>

        <Button
          asChild
          size="sm"
          variant={isUrgent ? "destructive" : "default"}
          className="flex-shrink-0"
        >
          <Link href="/subscription">
            {isUrgent ? "Assinar Agora!" : "Ver Planos"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
