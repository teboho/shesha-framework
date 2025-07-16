# Chart Components Configuration

Shesha provides powerful chart components that can visualize data in multiple formats including bar charts, line charts, pie charts, and polar area charts. This documentation covers the complete configuration options available for chart components.

## Overview

Chart components in Shesha support two primary data modes:
- **Entity Type**: Fetch data directly from configured entities with automatic aggregation
- **URL**: Fetch data from custom API endpoints

### Supported Chart Types

| Chart Type | Description | Use Case |
|------------|-------------|----------|
| `bar` | Vertical bar chart | Comparing categories or showing values over time |
| `line` | Line chart with optional curves | Tracking trends and changes over time |
| `pie` | Circular pie chart (can be configured as doughnut) | Showing proportions and percentages |
| `polarArea` | Polar area chart | Displaying multivariate data |

## Basic Configuration

### Chart Type Selection

```typescript
interface IChartProps {
  chartType?: 'bar' | 'line' | 'pie' | 'polarArea';
  isDoughnut?: boolean; // For pie charts only
}
```

**Example:**
```json
{
  "chartType": "bar",
  "isDoughnut": false
}
```

### Data Source Configuration

#### Entity Type Mode

When using `dataMode: 'entityType'`, configure data fetching from entities:

```typescript
interface IEntityDataConfig {
  dataMode: 'entityType';
  entityType: string;
  axisProperty: string;
  valueProperty: string;
  groupingProperty?: string;
  simpleOrPivot: 'simple' | 'pivot';
  aggregationMethod: 'count' | 'sum' | 'average' | 'min' | 'max';
  maxResultCount?: number;
  filters?: FilterExpression;
}
```

**Example:**
```json
{
  "dataMode": "entityType",
  "entityType": "Shesha.Domain.Person",
  "axisProperty": "creationTime",
  "valueProperty": "id",
  "aggregationMethod": "count",
  "simpleOrPivot": "simple",
  "maxResultCount": 250
}
```

#### URL Mode

When using `dataMode: 'url'`, fetch data from custom endpoints:

```typescript
interface IUrlDataConfig {
  dataMode: 'url';
  url: string;
  additionalProperties?: Array<{ key: string; value: string }>;
}
```

**Example:**
```json
{
  "dataMode": "url",
  "url": "/api/services/app/Dashboard/GetChartData",
  "additionalProperties": [
    { "key": "period", "value": "monthly" },
    { "key": "year", "value": "{{moment().year()}}" }
  ]
}
```

## Advanced Data Configuration

### Simple vs Pivot Charts

#### Simple Charts
Single data series with one axis and one value property.

```json
{
  "simpleOrPivot": "simple",
  "axisProperty": "department",
  "valueProperty": "salary",
  "aggregationMethod": "average"
}
```

#### Pivot Charts
Multiple data series grouped by a third property.

```json
{
  "simpleOrPivot": "pivot",
  "axisProperty": "month",
  "valueProperty": "amount",
  "groupingProperty": "category",
  "aggregationMethod": "sum",
  "stacked": true
}
```

### Time Series Configuration

For time-based data, enable time series formatting:

```typescript
interface ITimeSeriesConfig {
  isAxisTimeSeries: boolean;
  timeSeriesFormat: 'day' | 'month' | 'year' | 'day-month' | 'day-month-year' | 'month-year';
  isGroupingTimeSeries?: boolean;
  groupingTimeSeriesFormat?: 'day' | 'month' | 'year' | 'day-month' | 'day-month-year' | 'month-year';
}
```

**Example:**
```json
{
  "isAxisTimeSeries": true,
  "timeSeriesFormat": "month-year",
  "isGroupingTimeSeries": false
}
```

### Data Filtering

Apply filters to chart data using the FilterExpression format:

```json
{
  "filters": {
    "and": [
      {
        "property": "isActive",
        "operator": "equals",
        "value": true
      },
      {
        "property": "creationTime",
        "operator": "is_greater_than",
        "value": "{{moment().subtract(1, 'year').toISOString()}}"
      }
    ]
  }
}
```

### Sorting and Ordering

```typescript
interface ISortingConfig {
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}
```

## Display Configuration

### Title and Labels

```typescript
interface IDisplayConfig {
  showTitle: boolean;
  title?: string;
  showLegend: boolean;
  legendPosition: 'top' | 'bottom' | 'left' | 'right';
  axisPropertyLabel?: string;
  valuePropertyLabel?: string;
}
```

**Example:**
```json
{
  "showTitle": true,
  "title": "Monthly Sales Report",
  "showLegend": true,
  "legendPosition": "top",
  "axisPropertyLabel": "Month",
  "valuePropertyLabel": "Revenue ($)"
}
```

### Axis Configuration

For bar and line charts, configure axis display:

```typescript
interface IAxisConfig {
  showXAxisScale: boolean;
  showXAxisTitle: boolean;
  showYAxisScale: boolean;
  showYAxisTitle: boolean;
}
```

## Styling and Appearance

### Font Configuration

Customize fonts for different chart elements:

```typescript
interface IFontConfig {
  titleFont?: {
    family?: string;
    size?: number;
    weight?: string;
    color?: string;
  };
  axisLabelFont?: {
    family?: string;
    size?: number;
    weight?: string;
    color?: string;
  };
  legendFont?: {
    family?: string;
    size?: number;
    weight?: string;
    color?: string;
  };
  tickFont?: {
    family?: string;
    size?: number;
    weight?: string;
    color?: string;
  };
}
```

**Example:**
```json
{
  "titleFont": {
    "family": "Arial",
    "size": 18,
    "weight": "bold",
    "color": "#333333"
  },
  "axisLabelFont": {
    "family": "Arial",
    "size": 14,
    "weight": "normal",
    "color": "#666666"
  }
}
```

### Visual Styling

Configure borders, backgrounds, and shadows:

```typescript
interface IVisualStyling {
  border?: IBorderValue;
  background?: IBackgroundValue;
  shadow?: IShadowValue;
  width?: number;
  height?: number;
}
```

### Chart-Specific Styling

#### Line Charts
```typescript
interface ILineChartStyling {
  tension?: number; // 0-1, curve smoothness
  strokeWidth?: number;
  strokeColor?: string;
}
```

#### Bar Charts
```typescript
interface IBarChartStyling {
  stacked?: boolean; // For pivot charts
}
```

## Performance Configuration

### Data Limits and Timeouts

```typescript
interface IPerformanceConfig {
  maxResultCount?: number; // Default: 250, -1 for no limit
  requestTimeout?: number; // Default: 5000ms
}
```

**Best Practices:**
- Keep `maxResultCount` under 1000 for optimal performance
- Use server-side aggregation for large datasets
- Set appropriate timeouts based on data complexity

## Complete Configuration Example

Here's a comprehensive example showing all major configuration options:

```json
{
  "propertyName": "salesChart",
  "chartType": "bar",
  "hidden": false,
  
  "dataMode": "entityType",
  "entityType": "MyApp.Domain.Sale",
  "simpleOrPivot": "pivot",
  
  "axisProperty": "saleDate",
  "isAxisTimeSeries": true,
  "timeSeriesFormat": "month-year",
  "axisPropertyLabel": "Sales Period",
  
  "valueProperty": "amount",
  "valuePropertyLabel": "Revenue ($)",
  "aggregationMethod": "sum",
  
  "groupingProperty": "category",
  "isGroupingTimeSeries": false,
  "stacked": true,
  
  "orderBy": "saleDate",
  "orderDirection": "asc",
  "maxResultCount": 500,
  
  "showTitle": true,
  "title": "Sales Revenue by Category and Month",
  "showLegend": true,
  "legendPosition": "top",
  
  "showXAxisScale": true,
  "showXAxisTitle": true,
  "showYAxisScale": true,
  "showYAxisTitle": true,
  
  "filters": {
    "and": [
      {
        "property": "isActive",
        "operator": "equals",
        "value": true
      },
      {
        "property": "saleDate",
        "operator": "is_greater_than",
        "value": "{{moment().subtract(12, 'months').toISOString()}}"
      }
    ]
  },
  
  "titleFont": {
    "family": "Arial",
    "size": 18,
    "weight": "bold",
    "color": "#2c3e50"
  },
  
  "requestTimeout": 10000
}
```

## Common Use Cases

### 1. Simple Count Chart
Count records by category:

```json
{
  "chartType": "pie",
  "dataMode": "entityType",
  "entityType": "MyApp.Domain.Product",
  "axisProperty": "category",
  "valueProperty": "id",
  "aggregationMethod": "count",
  "simpleOrPivot": "simple"
}
```

### 2. Time Series Revenue Chart
Track revenue over time:

```json
{
  "chartType": "line",
  "dataMode": "entityType",
  "entityType": "MyApp.Domain.Order",
  "axisProperty": "orderDate",
  "isAxisTimeSeries": true,
  "timeSeriesFormat": "month-year",
  "valueProperty": "totalAmount",
  "aggregationMethod": "sum",
  "simpleOrPivot": "simple"
}
```

### 3. Multi-Series Comparison
Compare metrics across categories:

```json
{
  "chartType": "bar",
  "dataMode": "entityType",
  "entityType": "MyApp.Domain.SalesRecord",
  "axisProperty": "region",
  "valueProperty": "amount",
  "groupingProperty": "quarter",
  "aggregationMethod": "sum",
  "simpleOrPivot": "pivot",
  "stacked": false
}
```

### 4. Custom API Data
Use external API for chart data:

```json
{
  "chartType": "line",
  "dataMode": "url",
  "url": "/api/services/app/Analytics/GetTrendData",
  "additionalProperties": [
    { "key": "metric", "value": "pageViews" },
    { "key": "period", "value": "7d" }
  ]
}
```

## Troubleshooting

### Common Issues

1. **No Data Displayed**
   - Verify entity type and properties exist
   - Check filter conditions
   - Ensure proper permissions

2. **Performance Issues**
   - Reduce `maxResultCount`
   - Use server-side aggregation
   - Optimize database queries

3. **Styling Problems**
   - Check CSS conflicts
   - Verify font availability
   - Validate color formats

### Validation

The chart component validates:
- Required properties are present
- Entity properties exist in metadata
- Data types match expected formats
- Filter expressions are valid

## API Integration

When using URL mode, ensure your API returns data in the expected format:

```typescript
interface IChartApiResponse {
  labels: (string | number)[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    [key: string]: any;
  }>;
}
```

This comprehensive configuration guide covers all aspects of Shesha chart components, from basic setup to advanced customization options.