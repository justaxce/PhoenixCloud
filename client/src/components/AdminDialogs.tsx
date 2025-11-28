import { useState, useEffect } from "react";
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingCategory?: { id: string; name: string; slug: string } | null;
}

export function AddCategoryDialog({ open, onOpenChange, onSuccess, editingCategory }: AddCategoryDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && editingCategory) {
      setName(editingCategory.name || "");
      setSlug(editingCategory.slug || "");
    } else if (open) {
      setName("");
      setSlug("");
    }
  }, [open, editingCategory]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!editingCategory) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async () => {
    if (!name || !slug) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const method = editingCategory ? "PATCH" : "POST";
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });

      if (res.ok) {
        toast({ title: `Category ${editingCategory ? "updated" : "created"} successfully` });
        setName("");
        setSlug("");
        onOpenChange(false);
        onSuccess();
      } else {
        toast({ title: `Error ${editingCategory ? "updating" : "creating"} category`, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: `Error ${editingCategory ? "updating" : "creating"} category`, variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogDescription>{editingCategory ? "Update hosting category" : "Create a new hosting category"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Category Name</label>
            <Input
              placeholder="e.g., Premium Plans"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              data-testid="input-category-name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">URL Slug</label>
            <Input
              placeholder="e.g., premium-plans"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              data-testid="input-category-slug"
            />
            <p className="text-xs text-muted-foreground mt-1">Auto-generated from name, but you can edit it</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} data-testid="button-submit-category">
            {isLoading ? (editingCategory ? "Updating..." : "Creating...") : (editingCategory ? "Update" : "Create")}
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
  editingSubcategory?: { id: string; name: string; slug: string; categoryId: string } | null;
}

export function AddSubcategoryDialog({
  open,
  onOpenChange,
  categories,
  onSuccess,
  editingSubcategory,
}: AddSubcategoryDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && editingSubcategory) {
      setName(editingSubcategory.name || "");
      setSlug(editingSubcategory.slug || "");
      setCategoryId(editingSubcategory.categoryId || "");
    } else if (open) {
      setName("");
      setSlug("");
      setCategoryId("");
    }
  }, [open, editingSubcategory]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!editingSubcategory) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async () => {
    if (!name || !slug || !categoryId) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const method = editingSubcategory ? "PATCH" : "POST";
      const url = editingSubcategory ? `/api/subcategories/${editingSubcategory.id}` : "/api/subcategories";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, categoryId }),
      });

      if (res.ok) {
        toast({ title: `Subcategory ${editingSubcategory ? "updated" : "created"} successfully` });
        setName("");
        setSlug("");
        setCategoryId("");
        onOpenChange(false);
        onSuccess();
      } else {
        toast({ title: `Error ${editingSubcategory ? "updating" : "creating"} subcategory`, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: `Error ${editingSubcategory ? "updating" : "creating"} subcategory`, variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}</DialogTitle>
          <DialogDescription>{editingSubcategory ? "Update hosting subcategory" : "Create a new hosting subcategory"}</DialogDescription>
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
              onChange={(e) => handleNameChange(e.target.value)}
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
            <p className="text-xs text-muted-foreground mt-1">Auto-generated from name, but you can edit it</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} data-testid="button-submit-subcategory">
            {isLoading ? (editingSubcategory ? "Updating..." : "Creating...") : (editingSubcategory ? "Update" : "Create")}
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
  editingPlan?: any | null;
}

export function AddPlanDialog({
  open,
  onOpenChange,
  categories,
  subcategories,
  onSuccess,
  editingPlan,
}: AddPlanDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [priceInr, setPriceInr] = useState("");
  const [period, setPeriod] = useState("month");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [features, setFeatures] = useState("");
  const [popular, setPopular] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && editingPlan) {
      setName(editingPlan.name || "");
      setDescription(editingPlan.description || "");
      setPriceUsd(String(editingPlan.priceUsd || ""));
      setPriceInr(String(editingPlan.priceInr || ""));
      setPeriod(editingPlan.period || "month");
      setCategoryId(editingPlan.categoryId || "");
      setSubcategoryId(editingPlan.subcategoryId || "");
      setFeatures(Array.isArray(editingPlan.features) ? editingPlan.features.join("\n") : "");
      setPopular(Boolean(editingPlan.popular));
    } else if (open) {
      setName("");
      setDescription("");
      setPriceUsd("");
      setPriceInr("");
      setPeriod("month");
      setCategoryId("");
      setSubcategoryId("");
      setFeatures("");
      setPopular(false);
    }
  }, [open, editingPlan]);

  const filteredSubcategories = categoryId
    ? subcategories.filter((s) => s.categoryId === categoryId)
    : [];

  const handleSubmit = async () => {
    if (!name || !description || !priceUsd || !priceInr || !categoryId || !subcategoryId || !features) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const method = editingPlan ? "PATCH" : "POST";
      const url = editingPlan ? `/api/plans/${editingPlan.id}` : "/api/plans";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          priceUsd,
          priceInr,
          period,
          features: features.split("\n").filter((f) => f.trim()),
          categoryId,
          subcategoryId,
          popular,
        }),
      });

      if (res.ok) {
        toast({ title: `Plan ${editingPlan ? "updated" : "created"} successfully` });
        setName("");
        setDescription("");
        setPriceUsd("");
        setPriceInr("");
        setPeriod("month");
        setCategoryId("");
        setSubcategoryId("");
        setFeatures("");
        setPopular(false);
        onOpenChange(false);
        onSuccess();
      } else {
        toast({ title: `Error ${editingPlan ? "updating" : "creating"} plan`, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: `Error ${editingPlan ? "updating" : "creating"} plan`, variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingPlan ? "Edit Plan" : "Add Plan"}</DialogTitle>
          <DialogDescription>{editingPlan ? "Update hosting plan" : "Create a new hosting plan"}</DialogDescription>
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
              <label className="text-sm font-medium">Price (USD)</label>
              <Input
                placeholder="e.g., 9.99"
                value={priceUsd}
                onChange={(e) => setPriceUsd(e.target.value)}
                data-testid="input-plan-price-usd"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Price (INR)</label>
              <Input
                placeholder="e.g., 849"
                value={priceInr}
                onChange={(e) => setPriceInr(e.target.value)}
                data-testid="input-plan-price-inr"
              />
            </div>
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
            {isLoading ? (editingPlan ? "Updating..." : "Creating...") : (editingPlan ? "Update" : "Create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
