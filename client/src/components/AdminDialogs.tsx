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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import type { Category } from "@shared/schema";

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddCategoryDialog({ open, onOpenChange, onSuccess }: AddCategoryDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!name || !slug) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });

      if (res.ok) {
        toast({ title: "Category created successfully" });
        setName("");
        setSlug("");
        onOpenChange(false);
        onSuccess();
      } else {
        toast({ title: "Error creating category", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error creating category", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription>Create a new hosting category</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Category Name</label>
            <Input
              placeholder="e.g., VPS Hosting"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-category-name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">URL Slug</label>
            <Input
              placeholder="e.g., vps"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              data-testid="input-category-slug"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} data-testid="button-submit-category">
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AddSubcategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onSuccess: () => void;
}

export function AddSubcategoryDialog({
  open,
  onOpenChange,
  categories,
  onSuccess,
}: AddSubcategoryDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!name || !slug || !categoryId) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, categoryId }),
      });

      if (res.ok) {
        toast({ title: "Subcategory created successfully" });
        setName("");
        setSlug("");
        setCategoryId("");
        onOpenChange(false);
        onSuccess();
      } else {
        toast({ title: "Error creating subcategory", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error creating subcategory", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Subcategory</DialogTitle>
          <DialogDescription>Create a new hosting subcategory</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Category</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Subcategory Name</label>
            <Input
              placeholder="e.g., Linux VPS"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-subcategory-name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">URL Slug</label>
            <Input
              placeholder="e.g., linux"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              data-testid="input-subcategory-slug"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} data-testid="button-submit-subcategory">
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AddPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  subcategories: any[];
  onSuccess: () => void;
}

export function AddPlanDialog({
  open,
  onOpenChange,
  categories,
  subcategories,
  onSuccess,
}: AddPlanDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [period, setPeriod] = useState("month");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [features, setFeatures] = useState("");
  const [popular, setPopular] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const filteredSubcategories = categoryId
    ? subcategories.filter((s) => s.categoryId === categoryId)
    : [];

  const handleSubmit = async () => {
    if (!name || !description || !price || !categoryId || !subcategoryId || !features) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price,
          period,
          features: features.split("\n").filter((f) => f.trim()),
          categoryId,
          subcategoryId,
          popular,
        }),
      });

      if (res.ok) {
        toast({ title: "Plan created successfully" });
        setName("");
        setDescription("");
        setPrice("");
        setPeriod("month");
        setCategoryId("");
        setSubcategoryId("");
        setFeatures("");
        setPopular(false);
        onOpenChange(false);
        onSuccess();
      } else {
        toast({ title: "Error creating plan", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error creating plan", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Plan</DialogTitle>
          <DialogDescription>Create a new hosting plan</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Category</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger data-testid="select-plan-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Subcategory</label>
            <Select value={subcategoryId} onValueChange={setSubcategoryId} disabled={!categoryId}>
              <SelectTrigger data-testid="select-plan-subcategory">
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {filteredSubcategories.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Plan Name</label>
            <Input
              placeholder="e.g., Starter VPS"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-plan-name"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              placeholder="Brief description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="input-plan-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium">Price</label>
              <Input
                placeholder="e.g., $9.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                data-testid="input-plan-price"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger data-testid="select-plan-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Features (one per line)</label>
            <Textarea
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              className="h-24"
              data-testid="textarea-plan-features"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="popular"
              checked={popular}
              onCheckedChange={(checked) => setPopular(checked === true)}
              data-testid="checkbox-popular"
            />
            <label htmlFor="popular" className="text-sm font-medium cursor-pointer">
              Mark as most popular
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} data-testid="button-submit-plan">
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
