'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Loader2,
  Calendar,
  Clock,
  Dumbbell
} from 'lucide-react';
import { useSessions, useSession, useStartSession, useEndSession } from '@/lib/hooks';
import { formatDate, formatDateTime, formatTime, formatISG } from '@/lib/utils';

const statusColors: Record<string, string> = {
  RUNNING: 'bg-primary/20 text-primary border-primary/30',
  PAUSED: 'bg-accent/20 text-accent border-accent/30',
  STOPPED: 'bg-muted text-muted-foreground border-border',
};

export default function EntrenamientosPage() {
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('list');

  const { data: sessions, isLoading, refetch } = useSessions();
  const startMutation = useStartSession();
  const endMutation = useEndSession();

  const { data: sessionDetail } = useSession(selectedSession?.id || '', {
    enabled: !!selectedSession,
  });

  const handleStartSession = async () => {
    await startMutation.mutateAsync();
    refetch();
  };

  const handleEndSession = async (id: string) => {
    await endMutation.mutateAsync(id);
    refetch();
    setSelectedSession(null);
  };

  const handleViewSession = (session: any) => {
    setSelectedSession(session);
    setActiveTab('detail');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entrenamientos</h1>
          <p className="text-muted-foreground">Gestiona y supervisa las sesiones de entrenamiento</p>
        </div>
        <Button onClick={handleStartSession} disabled={startMutation.isPending}>
          <Plus className="mr-2 h-4 w-4" />
          {startMutation.isPending ? 'Iniciando...' : 'Nueva Sesión'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lista de Sesiones</TabsTrigger>
          <TabsTrigger value="detail" disabled={!selectedSession}>Detalle de Sesión</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Sesiones ({sessions?.length || 0})</CardTitle>
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar sesiones..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Sets</TableHead>
                        <TableHead>Calorías</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions
                        ?.filter((s) =>
                          s.id.toLowerCase().includes(search.toLowerCase()) ||
                          formatDate(s.startedAt).toLowerCase().includes(search.toLowerCase())
                        )
                        .map((session) => (
                          <TableRow key={session.id} onClick={() => handleViewSession(session)} className="cursor-pointer hover:bg-accent">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{formatDateTime(session.startedAt)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColors[session.timerState]}>
                                {session.timerState === 'RUNNING' ? 'En curso' : session.timerState === 'PAUSED' ? 'Pausada' : session.endedAt ? 'Finalizada' : 'Detenida'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{session.accumulatedTime ? formatTime(session.accumulatedTime) : '--:--:--'}</span>
                              </div>
                            </TableCell>
                            <TableCell>{session.sets?.length || 0}</TableCell>
                            <TableCell>{session.estimatedCalories || 0} kcal</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleViewSession(session); }}>
                                <Dumbbell className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  {!sessions?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay sesiones registradas
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detail" className="space-y-4">
          {selectedSession && sessionDetail ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Sesión #{selectedSession.id.slice(0, 8)}</CardTitle>
                      <p className="text-muted-foreground">Iniciada: {formatDateTime(selectedSession.startedAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={statusColors[sessionDetail.timerState]}>
                        {sessionDetail.timerState === 'RUNNING' ? 'En curso' : sessionDetail.timerState === 'PAUSED' ? 'Pausada' : 'Finalizada'}
                      </Badge>
                      {!sessionDetail.endedAt && (
                        <Button variant="outline" onClick={() => handleEndSession(selectedSession.id)}>
                          Finalizar Sesión
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">Duración Total</p>
                      <p className="text-2xl font-bold font-mono">{sessionDetail.accumulatedTime ? formatTime(sessionDetail.accumulatedTime) : '--:--:--'}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">Sets Realizados</p>
                      <p className="text-2xl font-bold">{sessionDetail.sets?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">Calorías Est.</p>
                      <p className="text-2xl font-bold">{sessionDetail.estimatedCalories || 0} kcal</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">ISG Promedio</p>
                      <p className="text-2xl font-bold text-primary">
                        {sessionDetail.sets?.length
                          ? formatISG(sessionDetail.sets.reduce((a: number, s: any) => a + s.isgScore, 0) / sessionDetail.sets.length)
                          : '--'}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-3">Sets Registrados</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ejercicio</TableHead>
                          <TableHead>Peso (kg)</TableHead>
                          <TableHead>Reps</TableHead>
                          <TableHead className="text-right">ISG Score</TableHead>
                          <TableHead>PR</TableHead>
                          <TableHead>Fecha</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessionDetail.sets?.map((set: any) => (
                          <TableRow key={set.id}>
                            <TableCell className="font-medium">{set.exercise?.name || 'N/A'}</TableCell>
                            <TableCell>{set.weightKg} kg</TableCell>
                            <TableCell>{set.reps}</TableCell>
                            <TableCell className="text-right font-bold text-primary">{formatISG(set.isgScore)}</TableCell>
                            <TableCell>
                              {set.isRecordPr && <Badge variant="success">PR</Badge>}
                            </TableCell>
                            <TableCell>{formatDateTime(set.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {!sessionDetail.sets?.length && (
                      <div className="text-center py-8 text-muted-foreground">
                        No hay sets registrados en esta sesión
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Dumbbell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">Selecciona una sesión</h3>
                <p className="text-muted-foreground">Haz clic en una sesión de la lista para ver su detalle</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}