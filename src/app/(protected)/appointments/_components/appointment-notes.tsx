"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, FileText, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { addAppointmentNote } from "@/actions/add-appointment-note";

interface AppointmentNote {
  id: string;
  note: string;
  createdAt: Date;
  createdBy: string;
}

interface AppointmentNotesProps {
  appointmentId: string;
  notes: AppointmentNote[];
  legacyNotes?: string; // Observações antigas do campo notes
}

export function AppointmentNotes({
  appointmentId,
  notes,
  legacyNotes,
}: AppointmentNotesProps) {
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const addNoteAction = useAction(addAppointmentNote, {
    onSuccess: () => {
      toast.success("Observação adicionada com sucesso!");
      setNewNote("");
      setIsAddingNote(false);
      // Recarregar a página para mostrar a nova observação
      window.location.reload();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao adicionar observação.");
    },
  });

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error("Digite uma observação antes de salvar.");
      return;
    }

    addNoteAction.execute({
      appointmentId,
      note: newNote.trim(),
    });
  };

  const allNotes = [
    // Incluir observações antigas se existirem
    ...(legacyNotes
      ? [
          {
            id: "legacy",
            note: legacyNotes,
            createdAt: new Date(), // Não temos data das observações antigas
            createdBy: "Sistema",
          },
        ]
      : []),
    // Incluir observações novas
    ...notes,
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Observações</span>
            {allNotes.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {allNotes.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingNote(!isAddingNote)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Observação
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulário para nova observação */}
        {isAddingNote && (
          <div className="space-y-3 rounded-lg border bg-blue-50 p-4">
            <Label htmlFor="newNote">Nova Observação</Label>
            <Textarea
              id="newNote"
              placeholder="Digite sua observação aqui..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={
                  addNoteAction.status === "executing" || !newNote.trim()
                }
              >
                {addNoteAction.status === "executing"
                  ? "Salvando..."
                  : "Salvar"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNote("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de observações */}
        {allNotes.length > 0 ? (
          <div className="space-y-3">
            {allNotes.map((note, index) => (
              <div key={note.id} className="space-y-2">
                <div className="rounded-lg border bg-gray-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">
                        {note.id === "legacy"
                          ? "Observação anterior"
                          : format(
                              new Date(note.createdAt),
                              "dd/MM/yyyy 'às' HH:mm",
                              { locale: ptBR },
                            )}
                      </span>
                    </div>
                    {note.note.startsWith("[CANCELAMENTO]") && (
                      <Badge variant="destructive" className="text-xs">
                        Cancelamento
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-gray-800">
                    {note.note}
                  </p>
                </div>
                {index < allNotes.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-sm">Nenhuma observação registrada</p>
            <p className="mt-1 text-xs text-gray-400">
              Clique em "Nova Observação" para adicionar a primeira
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
