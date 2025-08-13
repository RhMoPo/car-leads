import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";

export default function TrainingPage() {
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const videoSections = [
    {
      title: "How to Find Cars",
      url: settings?.videoFindUrl,
      description: "Learn effective search techniques, filters to use, and red flags to avoid when browsing Facebook Marketplace for car leads.",
    },
    {
      title: "How to Price Cars", 
      url: settings?.videoPriceUrl,
      description: "Master the art of accurate vehicle valuation using market research tools and pricing strategies for maximum profit.",
    },
    {
      title: "How to Use This System",
      url: settings?.videoUseUrl,
      description: "Step-by-step guide to submitting leads, understanding calculations, and tracking your submissions through the system.",
    },
    {
      title: "Introduction Video",
      url: settings?.videoIntroUrl,
      description: "Get started with an overview of the entire process, commission structure, and success tips from experienced VAs.",
    },
  ];

  return (
    <AppLayout title="Training Videos">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-slate-600 mt-2">Learn how to find, evaluate, and submit profitable car leads.</p>
        </div>

        {/* Introduction Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-8">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Introduction</h3>
          <div className="prose prose-slate max-w-none">
            <p>Welcome to the Car Lead System training program. This comprehensive guide will teach you how to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>Identify profitable car opportunities on Facebook Marketplace</li>
              <li>Accurately price vehicles for maximum profit potential</li>
              <li>Use this system effectively to submit and track leads</li>
              <li>Understand the commission structure and profit calculations</li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h4 className="font-semibold text-blue-900 mb-2">Quick Tips for Success</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Focus on cars with profit potential above £400 for better commissions</li>
                <li>• Always verify the location includes Hereford or Worcester</li>
                <li>• Take detailed notes about the car's condition and selling points</li>
                <li>• Submit leads quickly as good deals move fast</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Training Videos Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {videoSections.map((video, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">{video.title}</h3>
              <div className="aspect-video bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                {video.url ? (
                  <iframe
                    src={video.url}
                    className="w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    data-testid={`iframe-training-video-${index}`}
                  />
                ) : (
                  <div className="text-center">
                    <i className="fas fa-play-circle text-4xl text-slate-400 mb-2"></i>
                    <p className="text-slate-500">Video not configured</p>
                    <p className="text-xs text-slate-400">Admin: Add video URL in settings</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-600">{video.description}</p>
            </div>
          ))}
        </div>

        {/* Commission Structure Info */}
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200 p-8">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Commission Structure</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-coins text-red-600 text-xl"></i>
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Low Profit (Under £400)</h4>
              <p className="text-2xl font-bold text-red-600 mb-1">£40</p>
              <p className="text-sm text-slate-600">Flat commission</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-coins text-amber-600 text-xl"></i>
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Medium Profit (£400-£800)</h4>
              <p className="text-2xl font-bold text-amber-600 mb-1">10%</p>
              <p className="text-sm text-slate-600">Of profit amount</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-coins text-green-600 text-xl"></i>
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">High Profit (£800+)</h4>
              <p className="text-2xl font-bold text-green-600 mb-1">15%</p>
              <p className="text-sm text-slate-600">Of profit amount</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
