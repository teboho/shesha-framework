/**
 * Babel Plugin: antd-tree-shaking
 * Automatically transforms antd imports for better tree-shaking
 * 
 * Transforms:
 *   import { Button, Form } from 'antd'
 * Into:
 *   import Button from 'antd/es/button'
 *   import Form from 'antd/es/form'
 */

const ANTD_COMPONENT_MAP = {
  // Basic Components
  Button: 'button',
  Icon: 'icon',
  Typography: 'typography',
  
  // Layout
  Divider: 'divider',
  Grid: 'grid',
  Layout: 'layout',
  Space: 'space',
  Row: 'row',
  Col: 'col',
  
  // Navigation
  Affix: 'affix',
  Breadcrumb: 'breadcrumb',
  Dropdown: 'dropdown',
  Menu: 'menu',
  Pagination: 'pagination',
  Steps: 'steps',
  
  // Data Entry
  AutoComplete: 'auto-complete',
  Cascader: 'cascader',
  Checkbox: 'checkbox',
  DatePicker: 'date-picker',
  Form: 'form',
  Input: 'input',
  InputNumber: 'input-number',
  Mentions: 'mentions',
  Radio: 'radio',
  Rate: 'rate',
  Select: 'select',
  Slider: 'slider',
  Switch: 'switch',
  TimePicker: 'time-picker',
  Transfer: 'transfer',
  TreeSelect: 'tree-select',
  Upload: 'upload',
  
  // Data Display
  Avatar: 'avatar',
  Badge: 'badge',
  Calendar: 'calendar',
  Card: 'card',
  Carousel: 'carousel',
  Collapse: 'collapse',
  Comment: 'comment',
  Descriptions: 'descriptions',
  Empty: 'empty',
  Image: 'image',
  List: 'list',
  Popover: 'popover',
  Segmented: 'segmented',
  Statistic: 'statistic',
  Table: 'table',
  Tabs: 'tabs',
  Tag: 'tag',
  Timeline: 'timeline',
  Tooltip: 'tooltip',
  Tree: 'tree',
  
  // Feedback
  Alert: 'alert',
  Drawer: 'drawer',
  Message: 'message',
  Modal: 'modal',
  Notification: 'notification',
  Popconfirm: 'popconfirm',
  Progress: 'progress',
  Result: 'result',
  Skeleton: 'skeleton',
  Spin: 'spin',
  
  // Other
  Anchor: 'anchor',
  BackTop: 'back-top',
  ConfigProvider: 'config-provider',
  App: 'app',
};

module.exports = function({ types: t }) {
  return {
    name: 'antd-tree-shaking',
    visitor: {
      ImportDeclaration(path) {
        const { node } = path;
        
        // Only process antd imports
        if (node.source.value !== 'antd') {
          return;
        }
        
        // Only process named imports
        const namedImports = node.specifiers.filter(spec => 
          t.isImportSpecifier(spec) && ANTD_COMPONENT_MAP[spec.imported.name]
        );
        
        if (namedImports.length === 0) {
          return;
        }
        
        // Create individual import statements
        const newImports = namedImports.map(spec => {
          const componentName = spec.imported.name;
          const modulePath = ANTD_COMPONENT_MAP[componentName];
          
          return t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier(spec.local.name))],
            t.stringLiteral(`antd/es/${modulePath}`)
          );
        });
        
        // Remove the processed specifiers from the original import
        node.specifiers = node.specifiers.filter(spec => 
          !t.isImportSpecifier(spec) || !ANTD_COMPONENT_MAP[spec.imported.name]
        );
        
        // If no specifiers left, remove the original import
        if (node.specifiers.length === 0) {
          path.replaceWithMultiple(newImports);
        } else {
          // Insert new imports after the original
          path.insertAfter(newImports);
        }
      }
    }
  };
};