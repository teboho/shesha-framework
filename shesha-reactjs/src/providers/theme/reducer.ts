import { handleActions } from 'redux-actions';
import { ThemeActionEnums } from './actions';
import { IConfigurableTheme, IThemeStateContext, THEME_CONTEXT_INITIAL_STATE } from './contexts';

/**
 * Migrates old theme structure to new grouped structure
 * Handles backwards compatibility for themes saved before the restructuring
 */
const migrateTheme = (theme: IConfigurableTheme): IConfigurableTheme => {
  if (!theme) return theme;

  const migratedTheme = { ...theme } as any;

  // Migrate legacy labelSpan and componentSpan to inputComponents if they exist at root level
  // and inputComponents doesn't have these values set
  if ((theme.labelSpan !== undefined || theme.componentSpan !== undefined)) {
    migratedTheme.inputComponents = {
      ...theme.inputComponents,
      // Only migrate if the new structure doesn't already have these values
      labelSpan: theme.inputComponents?.labelSpan ?? theme.labelSpan,
      contentSpan: theme.inputComponents?.contentSpan ?? theme.componentSpan,
    };

    // Keep legacy properties for backwards compatibility
    // but they should not be used in new code
  }

  // Migrate legacy layoutBackground to pageBackground
  if (migratedTheme.layoutBackground !== undefined && !migratedTheme.pageBackground) {
    migratedTheme.pageBackground = migratedTheme.layoutBackground;
  }

  // Migrate legacy gridGap to gridGapHorizontal and gridGapVertical
  const layoutComponents = theme.layoutComponents as any;
  if (layoutComponents?.gridGap !== undefined) {
    migratedTheme.layoutComponents = {
      ...theme.layoutComponents,
      // Only migrate if the new structure doesn't already have these values
      gridGapHorizontal: theme.layoutComponents?.gridGapHorizontal ?? layoutComponents.gridGap,
      gridGapVertical: theme.layoutComponents?.gridGapVertical ?? layoutComponents.gridGap,
    };
  }

  // Migrate legacy marginPadding structure to individual stylingBox properties
  if (migratedTheme.marginPadding) {
    const { formFields, layout, standard, inline } = migratedTheme.marginPadding;

    if (formFields && !migratedTheme.inputComponents?.stylingBox) {
      migratedTheme.inputComponents = {
        ...migratedTheme.inputComponents,
        stylingBox: formFields,
      };
    }

    if (layout && !migratedTheme.layoutComponents?.stylingBox) {
      migratedTheme.layoutComponents = {
        ...migratedTheme.layoutComponents,
        stylingBox: layout,
      };
    }

    if (standard && !migratedTheme.standardComponents?.stylingBox) {
      migratedTheme.standardComponents = {
        ...migratedTheme.standardComponents,
        stylingBox: standard,
      };
    }

    if (inline && !migratedTheme.inlineComponents?.stylingBox) {
      migratedTheme.inlineComponents = {
        ...migratedTheme.inlineComponents,
        stylingBox: inline,
      };
    }
  }

  return migratedTheme;
};

export const uiReducer = handleActions<IThemeStateContext, any>(
  {
    [ThemeActionEnums.SetTheme]: (
      state: IThemeStateContext,
      action: ReduxActions.Action<IConfigurableTheme>,
    ) => {
      const { payload } = action;
      const migratedTheme = migrateTheme(payload);

      // Compute labelSpan and componentSpan for backwards compatibility
      const labelSpan = migratedTheme?.inputComponents?.labelSpan ?? THEME_CONTEXT_INITIAL_STATE.labelSpan;
      const componentSpan = migratedTheme?.inputComponents?.contentSpan ?? THEME_CONTEXT_INITIAL_STATE.componentSpan;

      return {
        ...state,
        theme: migratedTheme,
        labelSpan,
        componentSpan,
      };
    },
  },

  THEME_CONTEXT_INITIAL_STATE,
);
