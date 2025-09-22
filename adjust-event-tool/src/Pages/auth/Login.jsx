import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError(signInError?.message);
      } else if (data?.user) {
        navigate('/game-event-manager');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-6 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-md">
            {/* Login Form Card */}
            <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center w-16 h-16 bg-primary/20 rounded-lg mx-auto mb-4">
                  <Icon name="LogIn" size={32} className="text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
                <p className="text-muted-foreground mt-2">
                  Access your KSG Event Tester account
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                  <div className="flex items-center space-x-2">
                    <Icon name="AlertCircle" size={16} className="text-red-600" />
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e?.target?.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e?.target?.value)}
                      required
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading || !email || !password}
                  className="w-full"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Icon name="TestTube" size={20} className="text-primary" />
                <span>Demo Credentials</span>
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use these test accounts to explore the application:
              </p>
              
              <div className="space-y-3">
                {/* Admin Account */}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Admin Account</p>
                      <p className="text-sm text-muted-foreground">admin@ksgtest.com</p>
                      <p className="text-sm text-muted-foreground">admin123</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin('admin@ksgtest.com', 'admin123')}
                    >
                      Use
                    </Button>
                  </div>
                </div>

                {/* Tester Account */}
                <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Tester Account</p>
                      <p className="text-sm text-muted-foreground">tester@ksgtest.com</p>
                      <p className="text-sm text-muted-foreground">tester123</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin('tester@ksgtest.com', 'tester123')}
                    >
                      Use
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;