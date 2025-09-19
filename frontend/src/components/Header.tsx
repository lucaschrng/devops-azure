import { useState } from 'react'
import { LogOut, User as UserIcon } from 'lucide-react'
import UserForm from './UserForm'
import type { User } from '../types/api'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface HeaderProps {
  currentUser: User | null
  onUserCreated: (user: User) => void
  onLogout: () => void
}

export default function Header({ currentUser, onUserCreated, onLogout }: HeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleUserCreated = (user: User) => {
    onUserCreated(user)
    setIsDialogOpen(false)
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">🗳️ Bayrou Meter</h1>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentUser.pseudo.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{currentUser.pseudo}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Se déconnecter</span>
                </Button>
              </div>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4" />
                    <span>Se connecter</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Identification</DialogTitle>
                    <DialogDescription>
                      Connectez-vous ou créez un compte pour participer au vote
                    </DialogDescription>
                  </DialogHeader>
                  <UserForm onUserCreated={handleUserCreated} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
