import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface AdminUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  user?: { id: string; username: string };
  onSuccess: () => void;
}

export function AdminUserDialog({
  open,
  onOpenChange,
  mode,
  user,
  onSuccess,
}: AdminUserDialogProps) {
  const [username, setUsername] = useState(user?.username || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (mode === "create" && (!username || !password)) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    if (mode === "edit" && !password) {
      toast({ title: "Please enter a password", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      let endpoint = "/api/admin/users";
      let method = "POST";
      let body: any = {};

      if (mode === "create") {
        body = { username, password };
      } else {
        endpoint = `/api/admin/users/${user?.id}`;
        method = "PATCH";
        body = { password };
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast({
          title: mode === "create" ? "User created successfully" : "Password updated successfully",
        });
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        onOpenChange(false);
        onSuccess();
      } else {
        toast({ title: "Error", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Admin User" : "Update Password"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new admin account"
              : `Update password for ${user?.username}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {mode === "create" && (
            <div>
              <label className="text-sm font-medium">Username</label>
              <Input
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-new-username"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="input-new-password"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Confirm Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              data-testid="input-confirm-password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} data-testid="button-submit-user">
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
