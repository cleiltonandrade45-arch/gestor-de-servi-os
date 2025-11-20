
import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import { useNotifications } from '../contexts/NotificationContext';

const AuthForm: React.FC = () => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const { login, register } = useAuth();
  const { addNotification } = useNotifications();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      const success = await register(username, password, email);
      if (success) {
        addNotification('Registro bem-sucedido! Faça login.', 'success');
        setIsRegister(false); // Switch to login after successful registration
      } else {
        addNotification('Erro ao registrar. O usuário pode já existir.', 'error');
      }
    } else {
      const success = await login(username, password);
      if (success) {
        addNotification('Login bem-sucedido!', 'success');
      } else {
        addNotification('Nome de usuário ou senha incorretos.', 'error');
      }
    }
  }, [isRegister, username, password, email, login, register, addNotification]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {isRegister ? 'Registrar' : 'Login'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Nome de Usuário
            </label>
            <input
              type="text"
              id="username"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {isRegister && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          <Button type="submit" variant="primary" size="lg" className="w-full">
            {isRegister ? 'Registrar' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            variant="secondary"
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            {isRegister ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Registre-se'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;