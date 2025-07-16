#!/usr/bin/env node

/**
 * Bundle Analysis Script for Code Splitting Candidates
 * Analyzes components and identifies which ones should be lazy loaded
 */

const fs = require('fs');
const path = require('path');

// Component analysis weights
const ANALYSIS_WEIGHTS = {
  // File size indicators
  largeFile: 100,           // Files > 100KB
  mediumFile: 50,           // Files > 50KB
  
  // Import complexity
  heavyImports: 75,         // Many external dependencies
  antdImports: 25,          // Antd component imports
  
  // Component complexity
  highComplexity: 60,       // High cyclomatic complexity
  mediumComplexity: 30,     // Medium complexity
  
  // Usage patterns
  adminOnly: 80,            // Admin-only components
  designerComponent: 90,    // Form/page designer components
  chartComponent: 70,       // Chart/visualization components
  editorComponent: 85,      // Rich text/code editors
  
  // Frequency indicators
  rarelyUsed: 40,          // Components used rarely
  conditionalRender: 35,    // Conditionally rendered
  
  // Performance impact
  renderHeavy: 65,         // Heavy rendering operations
  largeBundle: 95,         // Known to create large bundles
};

// Heavy dependencies that indicate lazy loading candidates
const HEAVY_DEPENDENCIES = [
  'monaco-editor',
  'chart.js',
  'react-chartjs-2', 
  '@monaco-editor/react',
  'jodit',
  'jodit-react',
  'react-ace',
  'ace-builds',
  'react-beautiful-dnd',
  'react-query-builder',
  '@react-awesome-query-builder',
  'react-syntax-highlighter',
  'd3',
  'plotly.js',
  'codemirror',
  'tinymce'
];

// Component patterns that suggest lazy loading
const LAZY_LOAD_PATTERNS = [
  /designer/i,
  /editor/i,
  /chart/i,
  /kanban/i,
  /configuration/i,
  /admin/i,
  /settings/i,
  /permissions/i,
  /query.*builder/i,
  /form.*builder/i,
  /code.*editor/i,
  /rich.*text/i,
  /file.*upload/i,
  /image.*annotation/i,
  /visualization/i,
  /dashboard/i
];

/**
 * Analyze a single file for lazy loading candidacy
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);
    const fileName = path.basename(filePath);
    const relativePath = path.relative(process.cwd(), filePath);
    
    let score = 0;
    const reasons = [];
    
    // File size analysis
    const fileSizeKB = stats.size / 1024;
    if (fileSizeKB > 100) {
      score += ANALYSIS_WEIGHTS.largeFile;
      reasons.push(`Large file (${fileSizeKB.toFixed(1)}KB)`);
    } else if (fileSizeKB > 50) {
      score += ANALYSIS_WEIGHTS.mediumFile;
      reasons.push(`Medium file (${fileSizeKB.toFixed(1)}KB)`);
    }
    
    // Import analysis
    const imports = content.match(/import.*from.*['"][^'"]+['"]/g) || [];
    const heavyImportCount = imports.filter(imp => 
      HEAVY_DEPENDENCIES.some(dep => imp.includes(dep))
    ).length;
    
    if (heavyImportCount > 2) {
      score += ANALYSIS_WEIGHTS.heavyImports;
      reasons.push(`Heavy dependencies (${heavyImportCount})`);
    } else if (heavyImportCount > 0) {
      score += ANALYSIS_WEIGHTS.heavyImports * 0.5;
      reasons.push(`Some heavy dependencies (${heavyImportCount})`);
    }
    
    // Antd import analysis
    const antdImports = imports.filter(imp => imp.includes('antd')).length;
    if (antdImports > 5) {
      score += ANALYSIS_WEIGHTS.antdImports;
      reasons.push(`Many antd imports (${antdImports})`);
    }
    
    // Pattern matching
    const matchedPatterns = LAZY_LOAD_PATTERNS.filter(pattern => 
      pattern.test(fileName) || pattern.test(relativePath)
    );
    
    if (matchedPatterns.length > 0) {
      score += ANALYSIS_WEIGHTS.designerComponent;
      reasons.push(`Matches lazy load patterns: ${matchedPatterns.map(p => p.toString()).join(', ')}`);
    }
    
    // Complexity analysis (rough estimate)
    const componentCount = (content.match(/const\s+\w+.*=.*React/g) || []).length;
    const functionCount = (content.match(/function\s+\w+/g) || []).length;
    const complexity = componentCount + functionCount;
    
    if (complexity > 10) {
      score += ANALYSIS_WEIGHTS.highComplexity;
      reasons.push(`High complexity (${complexity} components/functions)`);
    } else if (complexity > 5) {
      score += ANALYSIS_WEIGHTS.mediumComplexity;
      reasons.push(`Medium complexity (${complexity} components/functions)`);
    }
    
    // Bundle impact estimation
    const hasMonacoEditor = content.includes('monaco-editor') || content.includes('@monaco-editor');
    const hasCharts = content.includes('chart') || content.includes('Chart');
    const hasRichEditor = content.includes('jodit') || content.includes('rich') || content.includes('editor');
    
    if (hasMonacoEditor) {
      score += ANALYSIS_WEIGHTS.largeBundle;
      reasons.push('Monaco Editor detected (very heavy)');
    }
    
    if (hasCharts) {
      score += ANALYSIS_WEIGHTS.chartComponent;
      reasons.push('Chart component detected');
    }
    
    if (hasRichEditor) {
      score += ANALYSIS_WEIGHTS.editorComponent;
      reasons.push('Rich text editor detected');
    }
    
    // Usage pattern analysis
    const hasConditionalRender = content.includes('useState') && 
      (content.includes('&&') || content.includes('?'));
    if (hasConditionalRender) {
      score += ANALYSIS_WEIGHTS.conditionalRender;
      reasons.push('Conditional rendering detected');
    }
    
    return {
      filePath: relativePath,
      fileName,
      score,
      reasons,
      fileSizeKB: fileSizeKB.toFixed(1),
      complexity,
      heavyDependencies: heavyImportCount,
      recommendation: getRecommendation(score)
    };
  } catch (error) {
    console.warn(`Failed to analyze ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Get recommendation based on score
 */
function getRecommendation(score) {
  if (score >= 150) return 'HIGH_PRIORITY';
  if (score >= 100) return 'MEDIUM_PRIORITY';
  if (score >= 50) return 'LOW_PRIORITY';
  return 'NOT_RECOMMENDED';
}

/**
 * Get color for console output
 */
function getScoreColor(recommendation) {
  switch (recommendation) {
    case 'HIGH_PRIORITY': return '\x1b[31m'; // Red
    case 'MEDIUM_PRIORITY': return '\x1b[33m'; // Yellow
    case 'LOW_PRIORITY': return '\x1b[36m'; // Cyan
    default: return '\x1b[37m'; // White
  }
}

/**
 * Process directory recursively
 */
function processDirectory(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const results = [];
  
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip certain directories
        if (!['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(file)) {
          results.push(...processDirectory(filePath, extensions));
        }
      } else if (extensions.some(ext => file.endsWith(ext))) {
        const analysis = analyzeFile(filePath);
        if (analysis) {
          results.push(analysis);
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to process directory ${dirPath}:`, error.message);
  }
  
  return results;
}

/**
 * Generate report
 */
function generateReport(results) {
  // Sort by score (highest first)
  const sortedResults = results.sort((a, b) => b.score - a.score);
  
  console.log('\n🎯 CODE SPLITTING ANALYSIS REPORT\n');
  console.log('═'.repeat(80));
  
  // Summary statistics
  const highPriority = sortedResults.filter(r => r.recommendation === 'HIGH_PRIORITY');
  const mediumPriority = sortedResults.filter(r => r.recommendation === 'MEDIUM_PRIORITY');
  const lowPriority = sortedResults.filter(r => r.recommendation === 'LOW_PRIORITY');
  
  console.log('\n📊 SUMMARY:');
  console.log(`   🔴 High Priority:   ${highPriority.length} components`);
  console.log(`   🟡 Medium Priority: ${mediumPriority.length} components`);
  console.log(`   🔵 Low Priority:    ${lowPriority.length} components`);
  console.log(`   ⚪ Not Recommended: ${results.length - highPriority.length - mediumPriority.length - lowPriority.length} components`);
  
  // Top candidates
  console.log('\n🎯 TOP LAZY LOADING CANDIDATES:\n');
  
  const topCandidates = sortedResults.slice(0, 15);
  
  topCandidates.forEach((result, index) => {
    const color = getScoreColor(result.recommendation);
    const reset = '\x1b[0m';
    
    console.log(`${color}${index + 1}. ${result.fileName}${reset}`);
    console.log(`   📁 Path: ${result.filePath}`);
    console.log(`   📊 Score: ${result.score} (${result.recommendation})`);
    console.log(`   📦 Size: ${result.fileSizeKB}KB`);
    console.log(`   🔧 Complexity: ${result.complexity}`);
    console.log(`   📚 Heavy deps: ${result.heavyDependencies}`);
    console.log(`   💡 Reasons: ${result.reasons.join(', ')}`);
    console.log('');
  });
  
  // Recommendations
  console.log('\n💡 IMPLEMENTATION RECOMMENDATIONS:\n');
  
  if (highPriority.length > 0) {
    console.log('🔴 HIGH PRIORITY (Implement first):');
    highPriority.slice(0, 5).forEach(result => {
      console.log(`   • ${result.fileName} - ${result.reasons[0]}`);
    });
    console.log('');
  }
  
  if (mediumPriority.length > 0) {
    console.log('🟡 MEDIUM PRIORITY (Implement next):');
    mediumPriority.slice(0, 5).forEach(result => {
      console.log(`   • ${result.fileName} - ${result.reasons[0]}`);
    });
    console.log('');
  }
  
  // Estimated impact
  const totalScore = sortedResults.reduce((sum, r) => sum + r.score, 0);
  const implementableScore = [...highPriority, ...mediumPriority].reduce((sum, r) => sum + r.score, 0);
  
  console.log('📈 ESTIMATED IMPACT:');
  console.log(`   • Bundle size reduction: ${Math.round(implementableScore / totalScore * 100)}%`);
  console.log(`   • Initial load improvement: ${Math.round(implementableScore / 100)}% faster`);
  console.log(`   • Components to lazy load: ${highPriority.length + mediumPriority.length}`);
  console.log('');
  
  console.log('⚡ NEXT STEPS:');
  console.log('   1. Start with high-priority components');
  console.log('   2. Use lazy loading utilities from utils/lazyComponent.tsx');
  console.log('   3. Implement route-level splitting first');
  console.log('   4. Add component-level splitting for heavy widgets');
  console.log('   5. Measure bundle size before/after changes');
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const targetPath = args[0] || './src';
  
  if (!fs.existsSync(targetPath)) {
    console.error(`❌ Path does not exist: ${targetPath}`);
    process.exit(1);
  }
  
  console.log(`🔍 Analyzing components in: ${targetPath}`);
  console.log('📊 Identifying code splitting candidates...\n');
  
  const startTime = Date.now();
  const results = processDirectory(targetPath);
  const endTime = Date.now();
  
  if (results.length === 0) {
    console.log('❌ No components found to analyze');
    return;
  }
  
  generateReport(results);
  
  console.log(`\n⏱️  Analysis completed in ${endTime - startTime}ms`);
  console.log(`📁 Analyzed ${results.length} components`);
}

// Export for use as module
module.exports = {
  analyzeFile,
  processDirectory,
  generateReport,
  ANALYSIS_WEIGHTS,
  HEAVY_DEPENDENCIES,
  LAZY_LOAD_PATTERNS
};

// Run if called directly
if (require.main === module) {
  main();
}