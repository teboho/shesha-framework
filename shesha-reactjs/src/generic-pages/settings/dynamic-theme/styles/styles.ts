import { createStyles, sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const themeParameters = cx(
    'theme-parameters',
    css`

      &::-webkit-scrollbar {
        display: none;
      }

      .ant-card {
        .ant-card-head {
          min-height: 40px;
          padding: 0 16px;
          
          .ant-card-head-title {
            font-size: 14px;
            font-weight: 600;
          }
        }

        .ant-card-body {
          padding: 16px;
        }
      }

      .ant-form-item {
        margin-bottom: 16px;
        
        &:last-child {
          margin-bottom: 0;
        }

        .properties-label  {
          top: 0px !important;
        }
      }

      .ant-slider {
        margin: 8px;
        max-width: 300px;
      }
    `,
  );

  const themeHeader = cx(
    'theme-parameters',
    css`
      font-size: 18px;
      font-weight: 700;
    `,
  );

  const previewSection = cx(
    'preview-section',
    css`
      padding: 16px;
      background: #fafafa;
      border-radius: 8px;
      border: 1px solid #f0f0f0;
    `,
  );

  const themeCard = cx(
    'theme-card',
    css`
      margin-bottom: 16px;
      
      .ant-card-head {
        background: #fafafa;
      }
    `,
  );

  const themeColorPicker = cx(
    'theme-color-picker',
    css`
      > .ant-color-picker-color-block {
       border-radius: 50% !important;
      }
    `,
  );

  const themeColorSpace = cx(
    'theme-color-space',
    css`
     align-items: center;
    `,
  );
  const space = cx(
    'theme-space',
    css`
    width: 100%;
      > .ant-space-item {
        width: 100%;
      }
    `,
  );

  const contentContainer = cx(
    'theme-content-container',
    css`
      height: calc(100vh - 205px);
    `,
  );
  const contentColumn = cx(
    'theme-content-container',
    css`
      height: 100%;
      overflow-y: auto;  
      ${sheshaStyles.thinScrollbars}
    `,
  );

  return {
    themeParameters,
    themeHeader,
    previewSection,
    themeCard,
    themeColorPicker,
    themeColorSpace,
    space,
    contentContainer,
    contentColumn,
  };
});
