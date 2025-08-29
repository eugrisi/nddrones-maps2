import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simular verificação de login
    setTimeout(() => {
      if (username === 'admin' && password === 'nddrones2024') {
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/admin');
      } else {
        setError('Usuário ou senha incorretos');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-nd-beige flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-nd-green-light/30">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/nd-logo.png" 
              alt="ND Drones" 
              className="w-16 h-16 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex');
              }}
            />
            <div className="w-16 h-16 bg-nd-green-dark rounded-xl flex items-center justify-center" style={{ display: 'none' }}>
              <span className="text-nd-beige font-black text-xl">ND</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-nd-green-dark">
            ND Drones
          </CardTitle>
          <p className="text-nd-green-dark/70 text-sm">
            Área Administrativa
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-nd-green-dark font-semibold">
                Usuário
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                required
                className="border-nd-green-light/30 focus:border-nd-orange focus:ring-nd-orange"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-nd-green-dark font-semibold">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="border-nd-green-light/30 focus:border-nd-orange focus:ring-nd-orange"
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-nd-green-dark hover:bg-nd-green-light text-nd-beige font-bold py-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-nd-beige mr-2"></div>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-nd-green-dark/70 hover:text-nd-green-dark text-sm font-medium transition-colors"
            >
              ← Voltar ao mapa
            </button>
          </div>

          <div className="mt-8 p-4 bg-nd-green-light/10 rounded-lg border border-nd-green-light/20">
            <p className="text-xs text-nd-green-dark/60 text-center">
              Acesso restrito apenas para administradores autorizados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login; 