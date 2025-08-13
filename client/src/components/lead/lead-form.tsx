import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { VA } from "@shared/schema";
import { TrendingUp } from "lucide-react";

const formSchema = z.object({
  vaName: z.string().min(1, "VA name is required"),
  newVaName: z.string().optional(),
  make: z.string().min(1, "Car make is required"),
  model: z.string().min(1, "Car model is required"),
  year: z.number().min(2010, "Year must be 2010 or newer"),
  mileage: z.number().min(0, "Mileage must be positive"),
  askingPrice: z.number().min(1, "Asking price is required").max(3000, "Asking price must be £3,000 or less"),
  estimatedSalePrice: z.number().min(1, "Estimated sale price is required"),
  estimatedExpenses: z.number().min(0, "Expenses must be positive"),
  sellerName: z.string().min(1, "Seller name is required"),
  location: z.string().min(1, "Location is required").refine(
    (val) => val.toLowerCase().includes("hereford") || val.toLowerCase().includes("worcester"),
    "Location must include Hereford or Worcester"
  ),
  listingUrl: z.string().url("Must be a valid URL"),
  conditionNotes: z.string().min(1, "Condition notes are required"),
  goodDealReason: z.string().min(1, "Please explain why this is a good deal"),
  conditions: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function LeadForm() {
  const [calculatedProfit, setCalculatedProfit] = useState(0);
  const [calculatedCommission, setCalculatedCommission] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vaName: "",
      newVaName: "",
      make: "",
      model: "",
      year: 2020,
      mileage: 0,
      askingPrice: 0,
      estimatedSalePrice: 0,
      estimatedExpenses: 0,
      sellerName: "",
      location: "",
      listingUrl: "",
      conditionNotes: "",
      goodDealReason: "",
      conditions: [],
    },
  });

  const { data: vas } = useQuery<VA[]>({
    queryKey: ["/api/vas"],
  });

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FormData & { honeypot?: string }) => {
      return apiRequest("POST", "/api/leads", data);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead submitted successfully!",
        description: `Estimated profit: £${response.estimatedProfit}, Commission: £${response.estimatedCommission}`,
      });
      form.reset();
      setCalculatedProfit(0);
      setCalculatedCommission(0);
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit lead",
        variant: "destructive",
      });
    },
  });

  // Live calculation
  useEffect(() => {
    const askingPrice = form.watch("askingPrice") || 0;
    const salePrice = form.watch("estimatedSalePrice") || 0;
    const expenses = form.watch("estimatedExpenses") || 0;

    const profit = Math.max(0, salePrice - askingPrice - expenses);
    setCalculatedProfit(profit);

    if (settings) {
      let commission = 0;
      if (profit < settings.smallMax) {
        commission = settings.flatSmall;
      } else if (profit <= settings.mediumMax) {
        commission = Math.round(profit * settings.percentMedium);
      } else {
        commission = Math.round(profit * settings.percentLarge);
      }
      setCalculatedCommission(commission);
    }
  }, [form.watch("askingPrice"), form.watch("estimatedSalePrice"), form.watch("estimatedExpenses"), settings]);

  const onSubmit = (data: FormData) => {
    // Add honeypot field for spam protection
    submitMutation.mutate({ ...data, honeypot: "" });
  };

  const acceptableConditions = [
    { value: "dead_battery", label: "Dead battery" },
    { value: "flat_tyre", label: "Flat tyre" },
    { value: "small_dents", label: "Small dents" },
    { value: "scratches", label: "Minor scratches" },
    { value: "worn_tyres", label: "Worn tyres" },
    { value: "interior_wear", label: "Minor interior wear" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="gradient-card p-8 rounded-3xl relative overflow-hidden">
        {/* Real-time calculation display */}
        {(calculatedProfit > 0 || calculatedCommission > 0) && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700 mb-1">Live Calculation</p>
                <div className="flex items-center space-x-6">
                  <div>
                    <span className="text-2xl font-bold text-emerald-800">£{calculatedProfit}</span>
                    <p className="text-sm text-emerald-600">Est. Profit</p>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-emerald-800">£{calculatedCommission}</span>
                    <p className="text-sm text-emerald-600">Your Commission</p>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Honeypot field */}
            <input type="text" name="website" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* VA Name */}
              <FormField
                control={form.control}
                name="vaName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VA Name</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value !== "_new") {
                          form.setValue("newVaName", "");
                        }
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="modern-input" data-testid="select-va-name">
                          <SelectValue placeholder="Select VA or choose new" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vas?.map((va) => (
                          <SelectItem key={va.id} value={va.name}>
                            {va.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="_new">+ Add New VA</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New VA Name */}
              {form.watch("vaName") === "_new" && (
                <FormField
                  control={form.control}
                  name="newVaName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New VA Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter new VA name"
                          className="modern-input"
                          data-testid="input-new-va-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Car Make */}
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Car Make</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Ford" className="modern-input" data-testid="input-make" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Car Model */}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Car Model</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Focus" className="modern-input" data-testid="input-model" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Year */}
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="2010"
                        max="2024"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-year"
                      />
                    </FormControl>
                    <p className="text-xs text-slate-500">Must be 2010 or newer</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mileage */}
              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mileage</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-mileage"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Asking Price */}
              <FormField
                control={form.control}
                name="askingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asking Price (£)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        max="3000"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-asking-price"
                      />
                    </FormControl>
                    <p className="text-xs text-slate-500">Maximum £3,000</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estimated Sale Price */}
              <FormField
                control={form.control}
                name="estimatedSalePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Sale Price (£)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-estimated-sale-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estimated Expenses */}
              <FormField
                control={form.control}
                name="estimatedExpenses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Expenses (£)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-estimated-expenses"
                      />
                    </FormControl>
                    <p className="text-xs text-slate-500">Optional - defaults to £0</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Seller Name */}
              <FormField
                control={form.control}
                name="sellerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seller Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Smith" data-testid="input-seller-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Hereford, UK" data-testid="input-location" />
                    </FormControl>
                    <p className="text-xs text-slate-500">Must include Hereford or Worcester</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Facebook Listing Link */}
              <FormField
                control={form.control}
                name="listingUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Facebook Listing Link</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="url"
                        placeholder="https://facebook.com/marketplace/item/..."
                        data-testid="input-listing-url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Condition Notes */}
            <FormField
              control={form.control}
              name="conditionNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Describe the car's condition, any issues, etc."
                      data-testid="textarea-condition-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Condition Checklist */}
            <FormField
              control={form.control}
              name="conditions"
              render={() => (
                <FormItem>
                  <FormLabel>Condition Checklist</FormLabel>
                  <p className="text-sm text-slate-600 mb-3">Select any issues that apply (minor issues are acceptable):</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {acceptableConditions.map((condition) => (
                      <FormField
                        key={condition.value}
                        control={form.control}
                        name="conditions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={condition.value}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(condition.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), condition.value])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== condition.value)
                                        );
                                  }}
                                  data-testid={`checkbox-${condition.value}`}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {condition.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700 font-medium mb-2">Major issues (these will be rejected):</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-red-600">
                      <div>• Engine knock</div>
                      <div>• Gearbox failure</div>
                      <div>• Severe rust</div>
                      <div>• Unrepaired accident damage</div>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Good Deal Reason */}
            <FormField
              control={form.control}
              name="goodDealReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why is this a good deal?</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Explain what makes this car a profitable opportunity..."
                      data-testid="textarea-good-deal-reason"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Live Calculation Display */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Live Calculation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700 mb-1">Estimated Profit</p>
                  <p className="text-2xl font-bold text-blue-900" data-testid="text-calculated-profit">
                    £{calculatedProfit.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Sale Price - Asking Price - Expenses</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700 mb-1">Your Commission</p>
                  <p className="text-2xl font-bold text-blue-900" data-testid="text-calculated-commission">
                    £{calculatedCommission.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Based on current commission rules</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setCalculatedProfit(0);
                  setCalculatedCommission(0);
                }}
                className="modern-button flex-1 sm:flex-none"
                data-testid="button-clear-form"
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="gradient-button modern-button flex-1"
                data-testid="button-submit-lead"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Lead"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
