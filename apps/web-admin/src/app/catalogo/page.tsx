'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Loader2
} from 'lucide-react';
import { useExercises, useMuscleGroups, useCreateExercise, useUpdateExercise, useDeleteExercise } from '@/lib/hooks';
import { formatISG, getMuscleGroupLabel, getLevelLabel } from '@/lib/utils';

const levels = ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'];
const muscleGroups = ['PECHO', 'ESPALDA', 'PIERNAS', 'HOMBROS', 'BRAZOS', 'CORE', 'CARDIO', 'OTROS'];

export default function CatalogoPage() {
  const [search, setSearch] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [level, setLevel] = useState('');
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    muscleGroup: 'PECHO',
    level: 'PRINCIPIANTE',
    massValue: 5,
    demandValue: 5,
    complexityValue: 4,
    impactValue: 4,
  });

  const { data: exercises, isLoading, error } = useExercises({
    muscleGroup: muscleGroup || undefined,
    level: level || undefined,
    search: search || undefined,
  });

  useMuscleGroups();
  const createMutation = useCreateExercise();
  const updateMutation = useUpdateExercise();
  const deleteMutation = useDeleteExercise();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExercise) {
      updateMutation.mutate({ id: editingExercise.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
    setEditingExercise(null);
    resetForm();
  };

  const handleEdit = (exercise: any) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      level: exercise.level,
      massValue: exercise.massValue,
      demandValue: exercise.demandValue,
      complexityValue: exercise.complexityValue,
      impactValue: exercise.impactValue,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este ejercicio?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      muscleGroup: 'PECHO',
      level: 'PRINCIPIANTE',
      massValue: 5,
      demandValue: 5,
      complexityValue: 4,
      impactValue: 4,
    });
  };

  const exerciseFactor = ((formData.massValue + formData.demandValue + formData.complexityValue + formData.impactValue) / 4).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Ejercicios</h1>
          <p className="text-muted-foreground">Gestiona la base de datos de ejercicios y sus factores ISG</p>
        </div>
        <Dialog open={!!editingExercise} onOpenChange={(open) => !open && setEditingExercise(null)}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingExercise(null); }}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Ejercicio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingExercise ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Press Banca Plana"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="muscleGroup">Grupo Muscular *</Label>
                    <Select value={formData.muscleGroup} onValueChange={(v) => setFormData({ ...formData, muscleGroup: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {muscleGroups.map((g) => (
                          <SelectItem key={g} value={g}>{getMuscleGroupLabel(g)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="level">Nivel *</Label>
                    <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {levels.map((l) => (
                          <SelectItem key={l} value={l}>{getLevelLabel(l)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Valores M,D,C,I (Factor ISG: {exerciseFactor})</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label htmlFor="massValue">M (Masa)</Label>
                      <Input
                        id="massValue"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.massValue}
                        onChange={(e) => setFormData({ ...formData, massValue: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="demandValue">D (Demanda)</Label>
                      <Input
                        id="demandValue"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.demandValue}
                        onChange={(e) => setFormData({ ...formData, demandValue: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="complexityValue">C (Complejidad)</Label>
                      <Input
                        id="complexityValue"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.complexityValue}
                        onChange={(e) => setFormData({ ...formData, complexityValue: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="impactValue">I (Impacto)</Label>
                      <Input
                        id="impactValue"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.impactValue}
                        onChange={(e) => setFormData({ ...formData, impactValue: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingExercise(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Ejercicios ({exercises?.length || 0})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ejercicios..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={muscleGroup} onValueChange={setMuscleGroup}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Grupo muscular" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {muscleGroups.map((g) => (
                    <SelectItem key={g} value={g}>{getMuscleGroupLabel(g)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {levels.map((l) => (
                    <SelectItem key={l} value={l}>{getLevelLabel(l)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(search || muscleGroup || level) && (
                <Button variant="outline" size="icon" onClick={() => { setSearch(''); setMuscleGroup(''); setLevel(''); }}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">Error al cargar ejercicios</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead className="text-right">Factor ISG</TableHead>
                    <TableHead>Valores M,D,C,I</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exercises?.map((exercise) => (
                    <TableRow key={exercise.id}>
                      <TableCell className="font-medium">{exercise.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getMuscleGroupLabel(exercise.muscleGroup)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={exercise.level === 'PRINCIPIANTE' ? 'default' : exercise.level === 'INTERMEDIO' ? 'secondary' : 'destructive'}
                        >
                          {getLevelLabel(exercise.level)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-primary">
                        {formatISG(exercise.exerciseFactor)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {exercise.massValue},{exercise.demandValue},{exercise.complexityValue},{exercise.impactValue}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(exercise)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(exercise.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!exercises?.length && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron ejercicios
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}