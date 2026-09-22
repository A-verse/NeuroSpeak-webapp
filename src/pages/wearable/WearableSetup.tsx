import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Bluetooth,
  Check,
  Footprints,
  HeartPulse,
  ShieldCheck,
  Smartphone,
  Watch,
} from "lucide-react";

const WearableSetup = () => {
  const navigate = useNavigate();

  const isBluetoothAvailable =
    typeof navigator !== "undefined" && "bluetooth" in navigator;

  return (
    <main className="min-h-[100dvh] w-full bg-background">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between py-3 sm:py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <span className="text-xs font-medium text-muted-foreground">
            Device setup
          </span>

          <div className="w-9" />
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          {/* Hero */}
          <section className="flex flex-col items-center justify-center py-5 sm:py-8">
            <div className="relative shrink-0">
              <div className="absolute inset-0 scale-125 rounded-full bg-primary/5" />

              <div className="relative flex h-24 w-24 items-center justify-center rounded-[28px] border border-primary/15 bg-primary/10 shadow-sm sm:h-28 sm:w-28">
                <Watch className="h-11 w-11 text-primary sm:h-12 sm:w-12" />
              </div>

              <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-background bg-card shadow-sm">
                <Bluetooth
                  className={`h-4 w-4 ${isBluetoothAvailable
                      ? "text-primary"
                      : "text-muted-foreground"
                    }`}
                />
              </div>
            </div>

            <div className="mt-5 w-full text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary sm:text-xs">
                Health data
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Connect your device
              </h1>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Connect a supported wearable or mobile health platform to bring
                relevant activity data into NeuroSpeak.
              </p>
            </div>

            {/* Bluetooth status */}
            <div className="mt-5 w-full max-w-md">
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm sm:p-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isBluetoothAvailable ? "bg-primary/10" : "bg-muted"
                    }`}
                >
                  <Bluetooth
                    className={`h-4 w-4 ${isBluetoothAvailable
                        ? "text-primary"
                        : "text-muted-foreground"
                      }`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {isBluetoothAvailable
                        ? "Bluetooth available"
                        : "Bluetooth unavailable"}
                    </p>

                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${isBluetoothAvailable
                          ? "bg-primary"
                          : "bg-muted-foreground/40"
                        }`}
                    />
                  </div>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {isBluetoothAvailable
                      ? "No supported device is connected."
                      : "Use a supported browser or the native mobile app."}
                  </p>
                </div>
              </div>
            </div>

            {/* Connect button */}
            <div className="mt-3 w-full max-w-md">
              <button
                type="button"
                disabled
                className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground opacity-50"
              >
                <Bluetooth className="h-4 w-4" />
                Connect device
              </button>

              <p className="mt-1.5 text-center text-[10px] leading-4 text-muted-foreground">
                Device connection will be available with native integration.
              </p>
            </div>
          </section>

          {/* Bottom content */}
          <section className="pb-4 pt-2 sm:pb-6 sm:pt-4">
            {/* Supported data */}
            <div className="flex flex-wrap items-center justify-between gap-1">
              <h2 className="text-sm font-semibold text-foreground">
                Supported data
              </h2>

              <span className="text-[10px] text-muted-foreground">
                Platform dependent
              </span>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <DataCard
                icon={HeartPulse}
                label="Heart rate"
              />

              <DataCard
                icon={Footprints}
                label="Steps & activity"
              />

              <DataCard
                icon={Activity}
                label="Health signals"
              />
            </div>

            {/* Privacy */}
            <div className="mt-2.5 flex items-start gap-2.5 rounded-xl bg-muted/50 px-3 py-2.5 sm:p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">
                  Your data stays under your control
                </p>

                <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground sm:text-xs sm:leading-5">
                  Health information will only be accessed through platform
                  permissions when supported integration is available.
                </p>
              </div>
            </div>

            {/* Platforms */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
              <PlatformChip label="Android" />
              <PlatformChip label="iOS" />

              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[9px] text-muted-foreground sm:text-[10px]">
                <Check className="h-3 w-3 text-primary" />
                Native support planned
              </span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

function DataCard({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 sm:flex-col sm:items-start sm:gap-1.5 sm:p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>

      <span className="min-w-0 text-xs font-medium text-foreground">
        {label}
      </span>
    </div>
  );
}

function PlatformChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[9px] text-muted-foreground sm:text-[10px]">
      <Smartphone className="h-3 w-3" />
      {label}
    </span>
  );
}

export default WearableSetup;