import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { StatusUpdateData } from "@/lib/types";

interface StatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string | null;
  status: string | null;
}

export function StatusModal({ open, onOpenChange, leadId, status }: StatusModalProps) {
  const [actualSalePrice, setActualSalePrice] = useState("");
  const [actualExpenses, setActualExpenses] = useState("0");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (data: StatusUpdateData) => {
      return apiRequest("PATCH", `/api/leads/${leadId}/status`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/kpis"] });
      toast({
        title: "Status updated",
        description: "Lead status has been updated successfully",
      });
      onOpenChange(false);
      setActualSalePrice("");
      setActualExpenses("0");
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update lead status",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!leadId || !status) return;

    const updateData: StatusUpdateData = { status };

    if (status === "SOLD") {
      if (!actualSalePrice) {
        toast({
          title: "Missing required field",
          description: "Actual sale price is required when marking as sold",
          variant: "destructive",
        });
        return;
      }
      updateData.actualSalePrice = parseInt(actualSalePrice);
      updateData.actualExpenses = parseInt(actualExpenses) || 0;
    }

    updateStatusMutation.mutate(updateData);
  };

  const isSoldStatus = status === "SOLD";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Lead Status</DialogTitle>
        </DialogHeader>

        {isSoldStatus && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 mb-4">
              Enter the actual sale details to calculate final profit and commission.
            </p>

            <div>
              <Label htmlFor="actualSalePrice">Actual Sale Price (£)</Label>
              <Input
                id="actualSalePrice"
                type="number"
                min="0"
                value={actualSalePrice}
                onChange={(e) => setActualSalePrice(e.target.value)}
                placeholder="3500"
                data-testid="input-actual-sale-price"
              />
            </div>

            <div>
              <Label htmlFor="actualExpenses">Actual Expenses (£)</Label>
              <Input
                id="actualExpenses"
                type="number"
                min="0"
                value={actualExpenses}
                onChange={(e) => setActualExpenses(e.target.value)}
                placeholder="250"
                data-testid="input-actual-expenses"
              />
              <p className="text-xs text-slate-500 mt-1">Optional - actual repair/transport costs</p>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-status"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateStatusMutation.isPending}
            data-testid="button-confirm-status"
          >
            {updateStatusMutation.isPending ? "Updating..." : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
