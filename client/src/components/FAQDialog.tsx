import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface FAQDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingFAQ?: { id: string; question: string; answer: string } | null;
}

export function FAQDialog({ open, onOpenChange, onSuccess, editingFAQ }: FAQDialogProps) {
  const [question, setQuestion] = useState(editingFAQ?.question || "");
  const [answer, setAnswer] = useState(editingFAQ?.answer || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!question || !answer) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const method = editingFAQ ? "PATCH" : "POST";
      const url = editingFAQ ? `/api/faqs/${editingFAQ.id}` : "/api/faqs";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });

      if (res.ok) {
        toast({ title: `FAQ ${editingFAQ ? "updated" : "created"} successfully` });
        setQuestion("");
        setAnswer("");
        onOpenChange(false);
        onSuccess();
      } else {
        toast({ title: `Error ${editingFAQ ? "updating" : "creating"} FAQ`, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: `Error ${editingFAQ ? "updating" : "creating"} FAQ`, variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingFAQ ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          <DialogDescription>{editingFAQ ? "Update FAQ item" : "Create a new FAQ"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Question</label>
            <Input
              placeholder="e.g., What is your uptime guarantee?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              data-testid="input-faq-question"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Answer</label>
            <Textarea
              placeholder="Enter the answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="h-24"
              data-testid="textarea-faq-answer"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} data-testid="button-submit-faq">
            {isLoading ? (editingFAQ ? "Updating..." : "Creating...") : (editingFAQ ? "Update" : "Create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
