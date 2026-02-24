import { Card } from 'antd';
import React, { FC } from 'react';
import { IConfigurableTheme, pickStyleFromModel, StyleBoxValue } from '@/index';
import { jsonSafeParse } from '@/utils/object';

interface LayoutExampleProps {
    theme?: IConfigurableTheme;
  }
  
const LayoutExample: FC<LayoutExampleProps> = ({theme}) => {
  
  const layoutStylingBoxParsed = jsonSafeParse<StyleBoxValue>(theme?.layoutComponents?.stylingBox || '{}');
  const layoutStylingBoxAsCSS = pickStyleFromModel(layoutStylingBoxParsed);

  return (
   <Card style={layoutStylingBoxAsCSS} title="Card"/>
  );
};

export default LayoutExample;
