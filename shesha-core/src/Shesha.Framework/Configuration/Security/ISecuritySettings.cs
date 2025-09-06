using Abp.Zero.Configuration;
using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Configuration.Security
{
    [Category("Security")]
    public interface ISecuritySettings: ISettingAccessors
    {
        /// <summary>
        /// Is user lockout enabled
        /// </summary>
        [Display(Name = "Is user lockout enabled")]
        [Setting(AbpZeroSettingNames.UserManagement.UserLockOut.IsEnabled, IsClientSpecific = true)]
        ISettingAccessor<bool> UserLockOutEnabled { get; }

        /// <summary>
        /// Max failed login attempts before lockout
        /// </summary>
        [Display(Name = "Max failed login attempts before lockout")]
        [Setting(AbpZeroSettingNames.UserManagement.UserLockOut.MaxFailedAccessAttemptsBeforeLockout, IsClientSpecific = true)]
        ISettingAccessor<int> MaxFailedAccessAttemptsBeforeLockout { get; }

        /// <summary>
        /// User lockout in seconds
        /// </summary>
        [Display(Name = "User lockout (sec)")]
        [Setting(AbpZeroSettingNames.UserManagement.UserLockOut.DefaultAccountLockoutSeconds, IsClientSpecific = true)]
        ISettingAccessor<int> DefaultAccountLockoutSeconds { get; }

        /// <summary>
        /// Security Settings
        /// </summary>
        [Display(Name = "Security Settings")]
        [Setting(SheshaSettingNames.SecuritySettings, EditorFormName = "security-settings")]
        ISettingAccessor<SecuritySettings> SecuritySettings { get; set; }

        /// <summary>
        /// Logout when the browser is closed
        /// </summary>
        [Display(Name = "Logout on Browser Close", Description = "Enable automatic logout when browser is closed or tab is hidden for a specified duration")]
        [Setting(SheshaSettingNames.LogoutOnBrowserClose, IsClientSpecific = true)]
        ISettingAccessor<bool> LogoutOnBrowserClose { get; }

        /// <summary>
        /// Logout timeout when browser is closed (in minutes)
        /// </summary>
        [Display(Name = "Browser Close Timeout (minutes)", Description = "Time in minutes after which user will be logged out when browser is closed or hidden")]
        [Setting(SheshaSettingNames.LogoutOnBrowserCloseTimeout, IsClientSpecific = true)]
        ISettingAccessor<int> LogoutOnBrowserCloseTimeout { get; }

        /// <summary>
        /// Logout when the user is inactive
        /// </summary>
        [Display(Name = "Logout on User Inactive", Description = "Enable automatic logout when user is inactive for a specified duration")]
        [Setting(SheshaSettingNames.LogoutOnUserInactive, IsClientSpecific = true)]
        ISettingAccessor<bool> LogoutOnUserInactive { get; }

        /// <summary>
        /// Logout timeout when user is inactive (in minutes)
        /// </summary>
        [Display(Name = "User Inactive Timeout (minutes)", Description = "Time in minutes after which user will be logged out due to inactivity")]
        [Setting(SheshaSettingNames.LogoutOnUserInactiveTimeout, IsClientSpecific = true)]
        ISettingAccessor<int> LogoutOnUserInactiveTimeout { get; }
    }
}
