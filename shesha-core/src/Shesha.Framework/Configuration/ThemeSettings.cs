using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Shesha.Configuration
{
    public class ThemeSettings
    {
        private const string DefaultComponentStylingBox = "{\"marginBottom\":\"5\"}";
        private const string DefaultLayoutBorderJson = "{\"borderType\":\"all\",\"border\":{\"all\":{\"width\":\"1\",\"style\":\"solid\",\"color\":\"#d9d9d9\"}},\"radius\":{\"all\":8},\"radiusType\":\"all\"}";
        private const string DefaultLayoutShadowJson = "{\"offsetX\":2,\"offsetY\":2,\"blurRadius\":2,\"spreadRadius\":2,\"color\":\"#585757\"}";
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
                        ComponentBackground = "#fafafa",
                        InputComponents = new InputComponentSettings()
                        {
                            LabelColon = true,
                            LabelSpan = 6,
                            ContentSpan = 18,
                            StylingBox = DefaultComponentStylingBox,
                        },
                        LayoutComponents = new LayoutComponentSettings()
                        {
                            StylingBox = DefaultComponentStylingBox,
                            GridGapHorizontal = 8,
                            GridGapVertical = 8,
                            Border = CreateDefaultLayoutBorder(),
                            Shadow = CreateDefaultLayoutShadow(),
                        },
                        StandardComponents = new StandardComponentSettings()
                        {
                            StylingBox = DefaultComponentStylingBox,
                        },
                        InlineComponents = new InlineComponentSettings()
                        {
                            StylingBox = DefaultComponentStylingBox,
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
                    }.Normalize();
            }
        }

        public ThemeSettings Normalize()
        {
            ComponentBackground ??= LayoutBackground ?? "#fafafa";

            InputComponents ??= new InputComponentSettings();
            InputComponents.LabelColon ??= true;
            InputComponents.LabelSpan ??= LabelSpan ?? 6;
            InputComponents.ContentSpan ??= ComponentSpan ?? 18;
            if (string.IsNullOrWhiteSpace(InputComponents.StylingBox))
            {
                InputComponents.StylingBox = DefaultComponentStylingBox;
            }

            LayoutComponents ??= new LayoutComponentSettings();
            LayoutComponents.GridGapHorizontal ??= LayoutComponents.GridGap ?? 8;
            LayoutComponents.GridGapVertical ??= LayoutComponents.GridGap ?? 8;
            if (string.IsNullOrWhiteSpace(LayoutComponents.StylingBox))
            {
                LayoutComponents.StylingBox = DefaultComponentStylingBox;
            }
            LayoutComponents.Border ??= CreateDefaultLayoutBorder();
            LayoutComponents.Shadow ??= CreateDefaultLayoutShadow();

            StandardComponents ??= new StandardComponentSettings();
            if (string.IsNullOrWhiteSpace(StandardComponents.StylingBox))
            {
                StandardComponents.StylingBox = DefaultComponentStylingBox;
            }

            InlineComponents ??= new InlineComponentSettings();
            if (string.IsNullOrWhiteSpace(InlineComponents.StylingBox))
            {
                InlineComponents.StylingBox = DefaultComponentStylingBox;
            }

            return this;
        }

        [OnDeserialized]
        internal void OnDeserialized(StreamingContext context)
        {
            Normalize();
        }

        private static object CreateDefaultLayoutBorder()
        {
            return JsonConvert.DeserializeObject<object>(DefaultLayoutBorderJson)!;
        }

        private static object CreateDefaultLayoutShadow()
        {
            return JsonConvert.DeserializeObject<object>(DefaultLayoutShadowJson)!;
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
        [JsonIgnore]
        public string? PageBackground { get; set; }
        public string? ComponentBackground { get; set; }
        public ThemeSettings.InputComponentSettings? InputComponents { get; set; }
        public ThemeSettings.LayoutComponentSettings? LayoutComponents { get; set; }
        public ThemeSettings.StandardComponentSettings? StandardComponents { get; set; }
        public ThemeSettings.InlineComponentSettings? InlineComponents { get; set; }
        [JsonIgnore]
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
