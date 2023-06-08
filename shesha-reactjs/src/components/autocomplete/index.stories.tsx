import React from 'react';
import { Story, Meta } from '@storybook/react';
import StoryApp from '../../components/storyBookApp';
import DesignerPage, { IDesignerPageProps } from '../../pages/forms-designer';
import { addStory } from '../../stories/utils';

export default {
  title: 'Components/Basic/AutoComplete',
} as Meta;

//#region Default
// Create a master template for mapping args to render the Button component
const Template: Story<IDesignerPageProps> = (args) => (
  <StoryApp>
    <DesignerPage {...args} />
  </StoryApp>
);

export const Playground = addStory(Template, {
  formId: '1d87d5af-d448-4981-bc36-bc36186fe7ad',
});

//export const Basic = Template.bind({});
//#endregion
