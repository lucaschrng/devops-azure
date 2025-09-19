import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiMutations } from '../lib/api'
import type { User } from '../types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface UserFormProps {
  onUserCreated: (user: User) => void
}

export default function UserForm({ onUserCreated }: UserFormProps) {
  const [pseudo, setPseudo] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoginMode, setIsLoginMode] = useState(false)

  const createUserMutation = useMutation({
    ...apiMutations.createUser(),
    onSuccess: (data) => {
      onUserCreated(data.user)
      setPseudo('')
      setEmail('')
      setPassword('')
    },
  })

  const loginUserMutation = useMutation({
    ...apiMutations.loginUser(),
    onSuccess: (data) => {
      onUserCreated(data.user)
      setEmail('')
      setPassword('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isLoginMode) {
      // Mode login - email et mot de passe requis
      if (email.trim() && password.trim()) {
        loginUserMutation.mutate({ 
          email: email.trim(), 
          password: password.trim() 
        })
      }
    } else {
      // Mode register - pseudo, email et mot de passe requis
      if (pseudo.trim() && email.trim() && password.trim()) {
        createUserMutation.mutate({ 
          pseudo: pseudo.trim(), 
          email: email.trim(),
          password: password.trim()
        })
      }
    }
  }

  const currentMutation = isLoginMode ? loginUserMutation : createUserMutation

  return (
    <div className="w-full">
        <Tabs 
          value={isLoginMode ? "login" : "register"} 
          onValueChange={(value) => setIsLoginMode(value === "login")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="register">S'inscrire</TabsTrigger>
            <TabsTrigger value="login">Se connecter</TabsTrigger>
          </TabsList>
          
          <TabsContent value="register" className="space-y-4 mt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pseudo">Pseudo</Label>
                <Input
                  type="text"
                  id="pseudo"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  placeholder="Votre pseudo"
                  required
                  disabled={currentMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-register">Email</Label>
                <Input
                  type="email"
                  id="email-register"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  disabled={currentMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-register">Mot de passe</Label>
                <Input
                  type="password"
                  id="password-register"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  disabled={currentMutation.isPending}
                />
              </div>

              {currentMutation.error && (
                <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                  {currentMutation.error.message}
                </div>
              )}

              <Button
                type="submit"
                disabled={
                  currentMutation.isPending || 
                  !email.trim() || 
                  !pseudo.trim() ||
                  !password.trim()
                }
                className="w-full"
              >
                {currentMutation.isPending ? 'Inscription...' : 'S\'inscrire'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="login" className="space-y-4 mt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login">Email</Label>
                <Input
                  type="email"
                  id="email-login"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre email existant"
                  required
                  disabled={currentMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-login">Mot de passe</Label>
                <Input
                  type="password"
                  id="password-login"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  disabled={currentMutation.isPending}
                />
              </div>

              {currentMutation.error && (
                <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                  {currentMutation.error.message}
                </div>
              )}

              <Button
                type="submit"
                disabled={
                  currentMutation.isPending || 
                  !email.trim() ||
                  !password.trim()
                }
                className="w-full"
              >
                {currentMutation.isPending ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
    </div>
  )
}
