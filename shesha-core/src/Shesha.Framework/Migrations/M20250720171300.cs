using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20250720171300)]
    public class M20250720171300 : OneWayMigration
    {
        public override void Up()
        {
            // Initialize auto logout settings in SecuritySettings with default values
            // The settings will be automatically picked up by the generic settings UI
            // since the SecuritySettings class already has the EditorFormName = "security-settings"
            this.Shesha().SettingUpdate("Shesha.Security")
                .OnModule("Shesha")
                .SetValue(@"{
                    ""autoLogoffTimeout"": 0,
                    ""useResetPasswordViaEmailLink"": false,
                    ""resetPasswordEmailLinkLifetime"": 1440,
                    ""useResetPasswordViaSmsOtp"": false,
                    ""resetPasswordSmsOtpLifetime"": 5,
                    ""mobileLoginPinLifetime"": 5,
                    ""useResetPasswordViaSecurityQuestions"": false,
                    ""resetPasswordViaSecurityQuestionsNumQuestionsAllowed"": 3,
                    ""defaultEndpointAccess"": 1,
                    ""logoutWhenBrowserClosed"": false,
                    ""logoutTimeoutSecondsBrowserClose"": 30,
                    ""logoutWhenUserInactive"": false,
                    ""logoutTimeoutMinutesUserInactive"": 5
                }");
        }
    }
}