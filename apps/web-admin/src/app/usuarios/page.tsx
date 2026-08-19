'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  X,
  UserPlus,
  UserCheck,
  UserX,
  Mail,
  Dumbbell
} from 'lucide-react';
import { formatDate, getRoleLabel, getRoleColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

const mockUsers = [
  { id: '1', clerkId: 'clerk_1', email: 'admin@ranked.com', firstName: 'Admin', lastName: 'Principal', imageUrl: null, currentWeightKg: 85, heightCm: 180, streakDays: 45, role: 'SUPER_ADMIN', gymId: null, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z' },
  { id: '2', clerkId: 'clerk_2', email: 'trainer@ranked.com', firstName: 'Carlos', lastName: 'Entrenador', imageUrl: null, currentWeightKg: 80, heightCm: 175, streakDays: 30, role: 'TRAINER', gymId: 'gym_1', createdAt: '2024-02-01T10:00:00Z', updatedAt: '2024-02-01T10:00:00Z' },
  { id: '3', clerkId: 'clerk_3', email: 'gymadmin@ranked.com', firstName: 'Laura', lastName: 'Gerente', imageUrl: null, currentWeightKg: 65, heightCm: 165, streakDays: 15, role: 'GYM_ADMIN', gymId: 'gym_1', createdAt: '2024-03-01T10:00:00Z', updatedAt: '2024-03-01T10:00:00Z' },
  { id: '4', clerkId: 'clerk_4', email: 'juan@test.com', firstName: 'Juan', lastName: 'Pérez', imageUrl: null, currentWeightKg: 75, heightCm: 170, streakDays: 7, role: 'USER', gymId: 'gym_1', createdAt: '2024-04-01T10:00:00Z', updatedAt: '2024-04-01T10:00:00Z' },
  { id: '5', clerkId: 'clerk_5', email: 'maria@test.com', firstName: 'María', lastName: 'García', imageUrl: null, currentWeightKg: 60, heightCm: 160, streakDays: 12, role: 'USER', gymId: 'gym_2', createdAt: '2024-04-15T10:00:00Z', updatedAt: '2024-04-15T10:00:00Z' },
  { id: '6', clerkId: 'clerk_6', email: 'pedro@test.com', firstName: 'Pedro', lastName: 'López', imageUrl: null, currentWeightKg: 90, heightCm: 185, streakDays: 3, role: 'USER', gymId: null, createdAt: '2024-05-01T10:00:00Z', updatedAt: '2024-05-01T10:00:00Z' },
];

export default function UsuariosPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleCounts = mockUsers.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra usuarios, roles y permisos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Usuario (Mock)</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">La creación real se hace via Clerk Dashboard.</p>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Usuarios</p>
                <p className="text-2xl font-bold">{mockUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{roleCounts.SUPER_ADMIN || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entrenadores</p>
                <p className="text-2xl font-bold">{roleCounts.TRAINER || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gym Admins</p>
                <p className="text-2xl font-bold">{roleCounts.GYM_ADMIN || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <UserX className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usuarios</p>
                <p className="text-2xl font-bold">{roleCounts.USER || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los roles</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="TRAINER">Entrenador</SelectItem>
                  <SelectItem value="GYM_ADMIN">Admin Gimnasio</SelectItem>
                  <SelectItem value="USER">Usuario</SelectItem>
                </SelectContent>
              </Select>
              {(search || roleFilter) && (
                <Button variant="outline" size="icon" onClick={() => { setSearch(''); setRoleFilter(''); }}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Gimnasio</TableHead>
                  <TableHead>Peso / Altura</TableHead>
                  <TableHead>Racha</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-muted-foreground">{user.clerkId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(getRoleColor(user.role))}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.gymId || '—'}</TableCell>
                    <TableCell className="font-mono text-sm">{user.currentWeightKg}kg / {user.heightCm}cm</TableCell>
                    <TableCell>
                      <span className={user.streakDays > 0 ? 'text-accent font-medium' : 'text-muted-foreground'}>
                        {user.streakDays} {user.streakDays === 1 ? 'día' : 'días'}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" disabled>
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!filteredUsers.length && (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron usuarios
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}