import React, { Suspense, use, useState, startTransition } from 'react';
import { Card, Button, Spin, Alert, Typography, Space, Divider } from 'antd';
import { ThunderboltOutlined, RocketOutlined, ExperimentOutlined, BugOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// Simulate an async data fetcher for the new 'use' hook
function fetchUserData(): Promise<{ name: string; id: number; status: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: 'John Doe',
        id: 123,
        status: 'Active Next.js 15 User'
      });
    }, 1500);
  });
}

// Component demonstrating the new 'use' hook from React 19
function UserProfile({ userPromise }: { userPromise: Promise<any> }) {
  const user = use(userPromise);
  
  return (
    <Card size="small" style={{ marginTop: 16 }}>
      <Space>
        <Text strong>User:</Text>
        <Text>{user.name}</Text>
        <Text type="secondary">({user.status})</Text>
      </Space>
    </Card>
  );
}

// Enhanced Error Boundary for React 19
class ModernErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('NextJS15 Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback;
      return <Fallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Error fallback component
function ErrorFallback({ error }: { error: Error }) {
  return (
    <Alert
      message="React 19 Error Boundary"
      description={`Error: ${error.message}`}
      type="error"
      showIcon
      action={
        <Button size="small" onClick={() => window.location.reload()}>
          Reload
        </Button>
      }
    />
  );
}

// Main component showcasing Next.js 15 and React 19 features
export default function NextJS15Features() {
  const [userPromise, setUserPromise] = useState<Promise<any> | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [showConcurrentFeature, setShowConcurrentFeature] = useState(false);

  const handleFetchUser = () => {
    startTransition(() => {
      setIsPending(true);
      const promise = fetchUserData();
      setUserPromise(promise);
      promise.finally(() => setIsPending(false));
    });
  };

  const toggleConcurrentFeature = () => {
    startTransition(() => {
      setShowConcurrentFeature(!showConcurrentFeature);
    });
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Card
        title={
          <Space>
            <RocketOutlined />
            <Title level={3} style={{ margin: 0 }}>
              Next.js 15 & React 19 Features
            </Title>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Paragraph>
          This component demonstrates the latest features in Next.js 15 and React 19,
          including the new <Text code>use</Text> hook, enhanced Suspense,
          concurrent features, and improved error boundaries.
        </Paragraph>

        <Divider orientation="left">
          <Space>
            <ThunderboltOutlined />
            React 19 'use' Hook with Suspense
          </Space>
        </Divider>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            type="primary" 
            onClick={handleFetchUser}
            loading={isPending}
            icon={<ExperimentOutlined />}
          >
            Fetch User with 'use' Hook
          </Button>

          {userPromise && (
            <ModernErrorBoundary fallback={ErrorFallback}>
              <Suspense 
                fallback={
                  <Card size="small" style={{ marginTop: 16 }}>
                    <Space>
                      <Spin size="small" />
                      <Text>Loading user data with React 19 Suspense...</Text>
                    </Space>
                  </Card>
                }
              >
                <UserProfile userPromise={userPromise} />
              </Suspense>
            </ModernErrorBoundary>
          )}
        </Space>

        <Divider orientation="left">
          <Space>
            <BugOutlined />
            Concurrent Features
          </Space>
        </Divider>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            onClick={toggleConcurrentFeature}
            type={showConcurrentFeature ? 'default' : 'primary'}
          >
            Toggle Concurrent Feature (startTransition)
          </Button>

          {showConcurrentFeature && (
            <Alert
              message="Concurrent Feature Active"
              description="This state update was wrapped in startTransition for better performance during heavy renders."
              type="info"
              showIcon
            />
          )}
        </Space>

        <Divider orientation="left">Next.js 15 Configuration Features</Divider>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Card size="small">
            <Text strong>✅ React Compiler:</Text> Enabled for automatic optimization
          </Card>
          <Card size="small">
            <Text strong>✅ Turbopack:</Text> Enhanced development mode performance
          </Card>
          <Card size="small">
            <Text strong>✅ Partial Prerendering (PPR):</Text> Improved static/dynamic rendering
          </Card>
          <Card size="small">
            <Text strong>✅ Enhanced Image Optimization:</Text> AVIF and WebP support
          </Card>
          <Card size="small">
            <Text strong>✅ Optimized Bundle Splitting:</Text> Better caching and performance
          </Card>
          <Card size="small">
            <Text strong>✅ SVG as React Components:</Text> Direct SVG imports with @svgr/webpack
          </Card>
        </Space>
      </Card>
    </div>
  );
}