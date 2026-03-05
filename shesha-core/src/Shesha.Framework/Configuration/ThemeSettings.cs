using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;

namespace Shesha.Configuration
{
    public class ThemeSettings
    {
        private static ThemeSettings? defaultInstance;

        public static ThemeSettings Default
        {
            get
            {
                return defaultInstance = defaultInstance ??
                    new ThemeSettings()
                    {
                        Application = new ApplicationSettings()
                        {
                            PrimaryColor = "#2197dc",
                            ErrorColor = "#ff4d4f",
                            WarningColor = "#ff6f00",
                            InfoColor = "#faad14",
                            SuccessColor = "#25b864",
                        },
                        Text = new TextSettings()
                        {
                            Default = "#000000",
                            Secondary = "#8c8c8c",
                            Link = string.Empty,
                        },
                        Sidebar = "dark",
                        SidebarBackground = "#4d192b",

                        // New shape
                        PageBackground = "#fafafa",
                        ComponentBackground = "#ffffff",
                        InputComponents = new InputComponentSettings()
                        {
                            LabelAlign = "right",
                            LabelColon = true,
                            LabelSpan = 6,
                            ContentSpan = 18,
                            StylingBox = "",
                        },
                        LayoutComponents = new LayoutComponentSettings()
                        {
                            StylingBox = "",
                            GridGapHorizontal = 16,
                            GridGapVertical = 16,
                        },
                        StandardComponents = new StandardComponentSettings()
                        {
                            StylingBox = "",
                        },
                        InlineComponents = new InlineComponentSettings()
                        {
                            StylingBox = "",
                        },
                        FormLayout = new FormLayoutSettings()
                        {
                            Span = 24,
                            Layout = "horizontal",
                            LabelAlign = "right",
                        },

                        // Legacy shape (kept for backwards compatibility)
                        LayoutBackground = "#fafafa",
                        LabelSpan = 6,
                        ComponentSpan = 18,
                        MarginPadding = new MarginPaddingSettings()
                        {
                            FormFields = "",
                            Layout = "",
                            Grid = "",
                            Standard = "",
                            Inline = "",
                        },
                    };
            }
        }

        public class ApplicationSettings
        {
            public string? PrimaryColor { get; set; }
            public string? ErrorColor { get; set; }
            public string? WarningColor { get; set; }
            public string? SuccessColor { get; set; }
            public string? InfoColor { get; set; }

            [JsonExtensionData]
            public IDictionary<string, JToken>? ExtraProperties { get; set; }
        }

        public class TextSettings
        {
            public string? Default { get; set; }
            public string? Secondary { get; set; }
            public string? Link { get; set; }

            [JsonExtensionData]
            public IDictionary<string, JToken>? ExtraProperties { get; set; }
        }

        public class InputComponentSettings
        {
            public string? LabelAlign { get; set; }
            public bool? LabelColon { get; set; }
            public int? LabelSpan { get; set; }
            public object? LabelHeight { get; set; }
            public int? ContentSpan { get; set; }
            public string? StylingBox { get; set; }

            [JsonExtensionData]
            public IDictionary<string, JToken>? ExtraProperties { get; set; }
        }

        public class LayoutComponentSettings
        {
            public string? StylingBox { get; set; }
            public object? GridGapVertical { get; set; }
            public object? GridGapHorizontal { get; set; }

            // Legacy layoutComponents property from older frontend versions
            public object? GridGap { get; set; }

            public object? Background { get; set; }
            public object? Border { get; set; }
            public object? Shadow { get; set; }

            [JsonExtensionData]
            public IDictionary<string, JToken>? ExtraProperties { get; set; }
        }

        public class StandardComponentSettings
        {
            public string? StylingBox { get; set; }

            [JsonExtensionData]
            public IDictionary<string, JToken>? ExtraProperties { get; set; }
        }

        public class InlineComponentSettings
        {
            public string? StylingBox { get; set; }

            [JsonExtensionData]
            public IDictionary<string, JToken>? ExtraProperties { get; set; }
        }

        public class FormLayoutSettings
        {
            public int? Span { get; set; }
            public string? Layout { get; set; }
            public string? LabelAlign { get; set; }

            [JsonExtensionData]
            public IDictionary<string, JToken>? ExtraProperties { get; set; }
        }

        public class MarginPaddingSettings
        {
            public string? FormFields { get; set; }
            public string? Layout { get; set; }
            public string? Grid { get; set; }
            public string? Standard { get; set; }
            public string? Inline { get; set; }

            [JsonExtensionData]
            public IDictionary<string, JToken>? ExtraProperties { get; set; }
        }

        public ThemeSettings.ApplicationSettings? Application { get; set; }
        public string? Sidebar { get; set; }
        public string? SidebarBackground { get; set; }
        public ThemeSettings.TextSettings? Text { get; set; }

        // New theme interface
        public string? PageBackground { get; set; }
        public string? ComponentBackground { get; set; }
        public ThemeSettings.InputComponentSettings? InputComponents { get; set; }
        public ThemeSettings.LayoutComponentSettings? LayoutComponents { get; set; }
        public ThemeSettings.StandardComponentSettings? StandardComponents { get; set; }
        public ThemeSettings.InlineComponentSettings? InlineComponents { get; set; }
        public ThemeSettings.FormLayoutSettings? FormLayout { get; set; }

        // Legacy properties kept for backwards compatibility
        public string? LayoutBackground { get; set; }
        public int? LabelSpan { get; set; }
        public int? ComponentSpan { get; set; }
        public ThemeSettings.MarginPaddingSettings? MarginPadding { get; set; }

        [JsonExtensionData]
        public IDictionary<string, JToken>? ExtraProperties { get; set; }
    }
}
