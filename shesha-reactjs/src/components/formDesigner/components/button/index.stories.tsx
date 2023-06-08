import React from 'react';
import { Story, Meta } from '@storybook/react';
import { addStory } from 'stories/utils';
import StoryApp from 'components/storyBookApp';
import DesignerPage, { IDesignerPageProps } from 'pages/forms-designer';

export default {
  title: 'Components/Basic/Buttons/Basic',
} as Meta;

//#region Default
// Create a master template for mapping args to render the Button component
const Template: Story<IDesignerPageProps> = (args) => (
  <StoryApp>
    <DesignerPage {...args} />
  </StoryApp>
);

export const Playground = addStory(Template, {
  formId: '266680a3-e1d8-4f8d-964d-4f1f03fe8586',
});

//#endregion
