import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const settingsSchema = z.object({
  radiusMiles: z.number().min(1).max(100),
  allowedRegions: z.string().min(1),
  flatSmall: z.number().min(0),
  smallMax: z.number().min(0),
  mediumMax: z.number().min(0),
  percentMedium: z.number().min(0).max(1),
  percentLarge: z.number().min(0).max(1),
  videoIntroUrl: z.string().url().optional().or(z.literal("")),
  videoFindUrl: z.string().url().optional().or(z.literal("")),
  videoPriceUrl: z.string().url().optional().or(z.literal("")),
  videoUseUrl: z.string().url().optional().or(z.literal("")),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      radiusMiles: 30,
      allowedRegions: "Hereford or Worcester, UK",
      flatSmall: 40,
      smallMax: 400,
      mediumMax: 800,
      percentMedium: 0.10,
      percentLarge: 0.15,
      videoIntroUrl: "",
      videoFindUrl: "",
      videoPriceUrl: "",
      videoUseUrl: "",
    },
  });

  // Update form when settings are loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        radiusMiles: settings.radiusMiles,
        allowedRegions: settings.allowedRegions,
        flatSmall: settings.flatSmall,
        smallMax: settings.smallMax,
        mediumMax: settings.mediumMax,
        percentMedium: settings.percentMedium,
        percentLarge: settings.percentLarge,
        videoIntroUrl: settings.videoIntroUrl || "",
        videoFindUrl: settings.videoFindUrl || "",
        videoPriceUrl: settings.videoPriceUrl || "",
        videoUseUrl: settings.videoUseUrl || "",
      });
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      return apiRequest("PATCH", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    updateSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <AppLayout title="Settings">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Commission preview calculations
  const watchedValues = form.watch();
  const previewProfits = [300, 600, 1000];
  const getPreviewCommission = (profit: number) => {
    const { flatSmall, smallMax, mediumMax, percentMedium, percentLarge } = watchedValues;
    if (profit < smallMax) return flatSmall;
    if (profit <= mediumMax) return Math.round(profit * percentMedium);
    return Math.round(profit * percentLarge);
  };

  return (
    <AppLayout title="Settings">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-slate-600 mt-2">Configure commission rules, location settings, and training videos.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Commission Rules */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">💰 Commission Rules</h3>
              <p className="text-sm text-slate-600 mb-6">Configure how VA commissions are calculated based on profit levels.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="flatSmall"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flat Small Commission (£)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-flat-small"
                        />
                      </FormControl>
                      <p className="text-xs text-slate-500">For profits under Small Max</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smallMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Small Max (£)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-small-max"
                        />
                      </FormControl>
                      <p className="text-xs text-slate-500">Threshold for flat commission</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mediumMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medium Max (£)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-medium-max"
                        />
                      </FormControl>
                      <p className="text-xs text-slate-500">Threshold for medium percentage</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="percentMedium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medium Percentage</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          max="1"
                          step="0.01"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          data-testid="input-percent-medium"
                        />
                      </FormControl>
                      <p className="text-xs text-slate-500">Decimal (0.10 = 10%)</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="percentLarge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Large Percentage</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          max="1"
                          step="0.01"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          data-testid="input-percent-large"
                        />
                      </FormControl>
                      <p className="text-xs text-slate-500">For profits above Medium Max</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Commission Preview */}
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-3">Commission Preview</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {previewProfits.map((profit) => (
                    <div key={profit}>
                      <span className="text-slate-600">£{profit} profit:</span>
                      <span className="font-semibold text-slate-800 ml-2">
                        £{getPreviewCommission(profit)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Location Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">📍 Location Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="radiusMiles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Search Radius (miles)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          max="100"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-radius-miles"
                        />
                      </FormControl>
                      <p className="text-xs text-slate-500">Maximum distance for car searches</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowedRegions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allowed Regions</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-allowed-regions" />
                      </FormControl>
                      <p className="text-xs text-slate-500">Locations that leads must include</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Training Video URLs */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">🎥 Training Video URLs</h3>
              <p className="text-sm text-slate-600 mb-6">Configure the embedded training videos shown in the training section.</p>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="videoIntroUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Introduction Video URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          placeholder="https://www.youtube.com/embed/..."
                          data-testid="input-video-intro-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoFindUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How to Find Cars Video URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          placeholder="https://www.youtube.com/embed/..."
                          data-testid="input-video-find-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoPriceUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How to Price Cars Video URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          placeholder="https://www.youtube.com/embed/..."
                          data-testid="input-video-price-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoUseUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How to Use This System Video URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          placeholder="https://www.youtube.com/embed/..."
                          data-testid="input-video-use-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Tip:</strong> Use YouTube embed URLs (youtube.com/embed/VIDEO_ID) for best compatibility. Leave fields empty to hide videos.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                data-testid="button-save-settings"
              >
                {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
