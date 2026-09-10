---
title: Exposing Wi-Fi bandwidth hogs using Govee lights
date: "2026-05-12"
summary: We’ve all been there — sitting in a public library with painfully slow Wi-Fi, wondering who’s downloading the entire internet. What if your home could visually tell you which room is responsible for the bandwidth crunch?
---

That was the spark. The original idea involved triangulating usage with smart lighting. We simplified it: map known MAC addresses to rooms, monitor their bandwidth, and let Govee lights react in real time — dimming, changing color, or pulsing based on usage. It’s a fun, nerdy home automation project that turns invisible network traffic into visible ambiance.

I built a proof-of-concept in C# that runs as a simple console service. Here’s the full story and code.

### The Hardware Setup

- **Router**: TP-Link Omada ER605 (great little multi-WAN router, but limited per-client stats in standalone mode).
- **Lights**: Govee smart bulbs / strips (affordable, colorful, and API-friendly).
- **Host**: Any always-on machine (Raspberry Pi, old PC, or server) running the .NET app.

**Note on ER605**: In standalone mode it shows interface-level stats via SNMP, but detailed per-client bandwidth is easier with the Omada Software Controller + its Open API, or by combining DHCP client list with other monitoring. For this demo we use a placeholder you can replace with real polling.

### How It Works (High Level)

1. Map MAC addresses → Rooms.
2. Poll current bandwidth usage per device.
3. Aggregate usage per room.
4. Adjust the corresponding Govee light: higher usage = brighter, redder, or more dramatic effects.

### The C# Implementation

Here’s a clean, self-contained console application.

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;

namespace BandwidthLightVisualizer
{
    public record RoomUsage(string Room, long BytesPerSecond);

    class Program
    {
        private static readonly HttpClient _httpClient = new()
        {
            BaseAddress = new Uri("https://developer-api.govee.com/")
        };

        private const string GoveeApiKey = "YOUR_GOVEE_API_KEY_HERE"; // Get from Govee app

        // MAC address to room mapping (add your devices)
        private static readonly Dictionary<string, string> MacToRoom = new(StringComparer.OrdinalIgnoreCase)
        {
            { "AA:BB:CC:DD:EE:01", "LivingRoom" },
            { "AA:BB:CC:DD:EE:02", "LivingRoom" },
            { "AA:BB:CC:DD:EE:03", "Bedroom" },
            { "AA:BB:CC:DD:EE:04", "Office" },
        };

        private static readonly Dictionary<string, string> RoomToGoveeDevice = new()
        {
            { "LivingRoom", "YOUR_LIVING_ROOM_DEVICE_ID" }, // Usually the MAC or device UUID from Govee
            { "Bedroom",    "YOUR_BEDROOM_DEVICE_ID" },
            { "Office",     "YOUR_OFFICE_DEVICE_ID" }
        };

        static async Task Main(string[] args)
        {
            Console.WriteLine("🚦 Bandwidth Light Visualizer Started (Press Ctrl+C to stop)");

            while (true)
            {
                try
                {
                    var usageData = await GetCurrentBandwidthUsageAsync();
                    var roomUsage = AggregateUsageByRoom(usageData);

                    foreach (var room in roomUsage)
                    {
                        await UpdateRoomLightingAsync(room.Room, room.BytesPerSecond);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error: {ex.Message}");
                }

                await Task.Delay(5000); // Check every 5 seconds
            }
        }

        // TODO: Replace with real polling (SNMP, Omada Controller API, etc.)
        private static async Task<List<(string Mac, long Bps)>> GetCurrentBandwidthUsageAsync()
        {
            // Fake data for demonstration
            await Task.Delay(200);
            return new List<(string, long)>
            {
                ("AA:BB:CC:DD:EE:01", 12_000_000),  // ~12 Mbps
                ("AA:BB:CC:DD:EE:03", 45_000_000)   // ~45 Mbps - heavy streamer!
            };
        }

        private static List<RoomUsage> AggregateUsageByRoom(List<(string Mac, long Bps)> data)
        {
            var dict = new Dictionary<string, long>();

            foreach (var (mac, bps) in data)
            {
                if (MacToRoom.TryGetValue(mac, out var room))
                {
                    dict[room] = dict.GetValueOrDefault(room) + bps;
                }
            }

            return dict.Select(kv => new RoomUsage(kv.Key, kv.Value)).ToList();
        }

        private static async Task UpdateRoomLightingAsync(string room, long bps)
        {
            if (!RoomToGoveeDevice.TryGetValue(room, out var deviceId))
                return;

            int brightness = Math.Clamp((int)(bps / 800_000), 20, 100);
            bool isHighUsage = bps > 25_000_000;

            var color = isHighUsage
                ? new { r = 255, g = 60, b = 60 }   // Red warning
                : new { r = 80, g = 180, b = 255 }; // Cool blue

            var payload = new
            {
                device = deviceId,
                model = "H6159", // Change to your model
                cmd = new
                {
                    name = "color",
                    value = color
                }
            };

            var request = new HttpRequestMessage(HttpMethod.Put, "v1/devices/control")
            {
                Content = JsonContent.Create(payload)
            };
            request.Headers.Add("Govee-API-Key", GoveeApiKey);

            var response = await _httpClient.SendAsync(request);

            Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] {room}: {bps / 1_000_000} Mbps → Brightness {brightness}% {(isHighUsage ? "🔴 HIGH" : "🔵 OK")}");
        }
    }
}
```

### Final Thoughts

This project started as a silly “what if” and turned into a genuinely useful (and entertaining) visualization tool. Your house literally lights up when someone is binge-watching in 4K.

Have you built something similar? What router and lights do you use? Drop your thoughts in the comments — I’d love to see improvements or variations of this idea.

Happy coding and happy lighting! ✨
