import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, cx }) => {
  const themeParameters = cx(
    'theme-parameters',
    css`
      height: 100%;
      overflow-y: auto;
      scrollbar-width: none;

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
      }

      .ant-slider {
        margin: 8px 0;
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
    `
  )
  const space = cx(
    'theme-space',
    css`
     > .ant-space-item: {
      width: 100%;
      background: red;
     }
    `
  )

  return {
    themeParameters,
    themeHeader,
    previewSection,
    themeCard,
    themeColorPicker,
    themeColorSpace,
    space,
  };
});
