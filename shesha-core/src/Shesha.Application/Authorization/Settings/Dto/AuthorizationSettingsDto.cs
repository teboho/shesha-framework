﻿namespace Shesha.Authorization.Settings.Dto
{
    /// <summary>
    /// Authorization options
    /// </summary>
    public class AuthorizationSettingsDto
    {
        /// <summary>
        /// Lockout enabled (default value for new users)
        /// </summary>
        public bool IsLockoutEnabled { get; set; }
        
        /// <summary>
        /// Lockout time in seconds
        /// </summary>
        public int DefaultAccountLockoutSeconds { get; set; }

        /// <summary>
        /// Max failed logon attempts before lockout
        /// </summary>
        public int MaxFailedAccessAttemptsBeforeLockout { get; set; }


        /// <summary>
        /// Passwords: require digits
        /// </summary>
        public bool RequireDigit { get; set; }

        /// <summary>
        /// Passwords: require lower case character
        /// </summary>
        public bool RequireLowercase { get; set; }

        /// <summary>
        /// Passwords: non alphanumeric character
        /// </summary>
        public bool RequireNonAlphanumeric { get; set; }
        /// <summary>
        /// Passwords: require upper case character
        /// </summary>
        public bool RequireUppercase { get; set; }
        
        /// <summary>
        /// Passwords: min length
        /// </summary>
        public int RequiredLength { get; set; }

        /// <summary>
        /// Auto logoff timeout (in case of user inactivity). Set to 0 to disable
        /// </summary>
        public int AutoLogoffTimeout { get; set; }

        /// <summary>
        /// Logout when the browser is closed
        /// </summary>
        public bool LogoutOnBrowserClose { get; set; }

        /// <summary>
        /// Logout timeout when browser is closed (in minutes)
        /// </summary>
        public int LogoutOnBrowserCloseTimeout { get; set; }

        /// <summary>
        /// Logout when the user is inactive
        /// </summary>
        public bool LogoutOnUserInactive { get; set; }

        /// <summary>
        /// Logout timeout when user is inactive (in minutes)
        /// </summary>
        public int LogoutOnUserInactiveTimeout { get; set; }

        /// <summary>
        /// Allow users to reset passwords with reset link sent to their emails.
        /// </summary>
        public bool ResetPasswordWithEmailLinkIsSupported { get; set; }

        /// <summary>
        /// Email link expiry delay
        /// </summary>
        public int ResetPasswordWithEmailLinkExpiryDelay { get; set; }

        /// <summary>
        /// Allow users to reset passwords using OTPs sent to their phone numbers.
        /// </summary>
        public bool ResetPasswordWithSmsOtpIsSupported { get; set; }

        /// <summary>
        /// OTP expiry delay
        /// </summary>
        public int ResetPasswordWithSmsOtpExpiryDelay { get; set; }

        /// <summary>
        /// Allow users to reset passwords using predefined security questions and answers.
        /// </summary>
        public bool ResetPasswordWithSecurityQuestionsIsSupported { get; set; }

        /// <summary>
        /// TODO: Decide whether to use this property or not
        /// </summary>
        public int ResetPasswordWithSecurityQuestionsNumQuestionsAllowed { get; set; }
    }
}
