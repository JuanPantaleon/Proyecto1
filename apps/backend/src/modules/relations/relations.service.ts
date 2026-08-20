import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateConnectionDto, RespondConnectionDto } from '@ranked-fitness/shared';

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  imageUrl: true,
  role: true,
  gymId: true,
  streakDays: true,
};

@Injectable()
export class RelationsService {
  constructor(private prisma: PrismaService) {}

  private async getUserOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  private fullName(user: any): string {
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Usuario';
  }

  async createRequest(requesterId: string, data: CreateConnectionDto) {
    if (requesterId === data.addresseeId) {
      throw new BadRequestException('No podés enviarte una solicitud a vos mismo');
    }
    await this.getUserOrThrow(data.addresseeId);

    const existing = await this.prisma.connection.findUnique({
      where: {
        requesterId_addresseeId_type: {
          requesterId,
          addresseeId: data.addresseeId,
          type: data.type,
        },
      },
    });
    if (existing) {
      if (existing.status === 'PENDING') {
        throw new BadRequestException('Ya existe una solicitud pendiente');
      }
      if (existing.status === 'ACCEPTED') {
        throw new BadRequestException('Ya están conectados');
      }
      if (existing.status === 'BLOCKED') {
        throw new BadRequestException('La conexión está bloqueada');
      }
      return this.prisma.connection.update({
        where: { id: existing.id },
        data: { status: 'PENDING' },
        include: { addressee: { select: USER_SELECT } },
      });
    }

    const reverse = await this.prisma.connection.findUnique({
      where: {
        requesterId_addresseeId_type: {
          requesterId: data.addresseeId,
          addresseeId: requesterId,
          type: data.type,
        },
      },
    });
    if (reverse && (reverse.status === 'PENDING' || reverse.status === 'ACCEPTED')) {
      throw new BadRequestException('Ya existe una solicitud en la dirección inversa');
    }

    return this.prisma.connection.create({
      data: {
        requesterId,
        addresseeId: data.addresseeId,
        type: data.type,
        status: 'PENDING',
      },
      include: { addressee: { select: USER_SELECT } },
    });
  }

  async respond(id: string, addresseeId: string, data: RespondConnectionDto) {
    const connection = await this.prisma.connection.findUnique({ where: { id } });
    if (!connection) throw new NotFoundException('Solicitud no encontrada');
    if (connection.addresseeId !== addresseeId) {
      throw new BadRequestException('No tenés permisos para responder esta solicitud');
    }
    if (connection.status !== 'PENDING') {
      throw new BadRequestException('La solicitud ya fue respondida');
    }

    if (data.status === 'ACCEPTED' && connection.type === 'COACH_ATHLETE') {
      await this.alignGym(connection.requesterId, connection.addresseeId);
    }

    return this.prisma.connection.update({
      where: { id },
      data: { status: data.status },
    });
  }

  async block(id: string, userId: string) {
    const connection = await this.prisma.connection.findUnique({ where: { id } });
    if (!connection) throw new NotFoundException('Solicitud no encontrada');
    const isParticipant =
      connection.requesterId === userId || connection.addresseeId === userId;
    if (!isParticipant) {
      throw new BadRequestException('No tenés permisos para bloquear esta conexión');
    }
    return this.prisma.connection.update({
      where: { id },
      data: { status: 'BLOCKED' },
    });
  }

  private async alignGym(requesterId: string, addresseeId: string) {
    const [requester, addressee] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: requesterId } }),
      this.prisma.user.findUnique({ where: { id: addresseeId } }),
    ]);
    const gymId = requester?.gymId ?? addressee?.gymId;
    if (!gymId) return;
    if (!requester?.gymId) {
      await this.prisma.user.update({ where: { id: requesterId }, data: { gymId } });
    }
    if (!addressee?.gymId) {
      await this.prisma.user.update({ where: { id: addresseeId }, data: { gymId } });
    }
  }

  async listIncoming(userId: string) {
    const requests = await this.prisma.connection.findMany({
      where: { addresseeId: userId, status: 'PENDING' },
      include: { requester: { select: USER_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
    return requests.map((r) => ({
      id: r.id,
      type: r.type,
      status: r.status,
      createdAt: r.createdAt,
      user: { ...r.requester, name: this.fullName(r.requester) },
    }));
  }

  async listOutgoing(userId: string) {
    const requests = await this.prisma.connection.findMany({
      where: { requesterId: userId, status: 'PENDING' },
      include: { addressee: { select: USER_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
    return requests.map((r) => ({
      id: r.id,
      type: r.type,
      status: r.status,
      createdAt: r.createdAt,
      user: { ...r.addressee, name: this.fullName(r.addressee) },
    }));
  }

  async listConnections(userId: string) {
    const [sent, received] = await Promise.all([
      this.prisma.connection.findMany({
        where: { requesterId: userId, status: 'ACCEPTED' },
        include: { addressee: { select: USER_SELECT } },
      }),
      this.prisma.connection.findMany({
        where: { addresseeId: userId, status: 'ACCEPTED' },
        include: { requester: { select: USER_SELECT } },
      }),
    ]);
    return [
      ...sent.map((c) => ({
        id: c.id,
        type: c.type,
        user: { ...c.addressee, name: this.fullName(c.addressee) },
      })),
      ...received.map((c) => ({
        id: c.id,
        type: c.type,
        user: { ...c.requester, name: this.fullName(c.requester) },
      })),
    ];
  }

  async coachAthletes(coachId: string) {
    await this.getUserOrThrow(coachId);
    const [asRequester, asAddressee] = await Promise.all([
      this.prisma.connection.findMany({
        where: { requesterId: coachId, type: 'COACH_ATHLETE', status: 'ACCEPTED' },
        include: { addressee: { select: USER_SELECT } },
      }),
      this.prisma.connection.findMany({
        where: { addresseeId: coachId, type: 'COACH_ATHLETE', status: 'ACCEPTED' },
        include: { requester: { select: USER_SELECT } },
      }),
    ]);
    return [
      ...asRequester.map((c) => ({
        id: c.id,
        athlete: { ...c.addressee, name: this.fullName(c.addressee) },
      })),
      ...asAddressee.map((c) => ({
        id: c.id,
        athlete: { ...c.requester, name: this.fullName(c.requester) },
      })),
    ];
  }

  private async assertCoachAthlete(coachId: string, athleteId: string) {
    const connection = await this.prisma.connection.findFirst({
      where: {
        type: 'COACH_ATHLETE',
        status: 'ACCEPTED',
        OR: [
          { requesterId: coachId, addresseeId: athleteId },
          { requesterId: athleteId, addresseeId: coachId },
        ],
      },
    });
    if (!connection) {
      throw new ForbiddenException(
        'No tenés una relación activa de entrenador-atleta con este usuario',
      );
    }
    return connection;
  }

  /**
   * Detalle de un atleta VINCULADO (COACH_ATHLETE ACCEPTED) con sus sesiones.
   * Ningún entrenador puede ver datos de atletas no vinculados.
   */
  async coachAthleteDetail(coachId: string, athleteId: string) {
    await this.getUserOrThrow(athleteId);
    await this.assertCoachAthlete(coachId, athleteId);

    const athlete = await this.prisma.user.findUnique({
      where: { id: athleteId },
      select: {
        ...USER_SELECT,
        currentWeightKg: true,
        heightCm: true,
      },
    });

    const sessions = await this.prisma.session.findMany({
      where: { userId: athleteId },
      include: {
        sets: {
          include: { exercise: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 15,
    });

    return { athlete: { ...athlete, name: this.fullName(athlete) }, sessions };
  }

  /** Jugadores afiliados/asistentes al centro del gym admin (solo su propio centro). */
  async gymPlayers(gymAdminId: string) {
    const admin = await this.getUserOrThrow(gymAdminId);
    if (!admin.gymId) {
      throw new BadRequestException('Tu gimnasio no tiene un centro asociado');
    }
    const players = await this.prisma.user.findMany({
      where: { gymId: admin.gymId, role: 'USER' },
      select: USER_SELECT,
      orderBy: { streakDays: 'desc' },
    });
    return players.map((p) => ({ ...p, name: this.fullName(p) }));
  }

  /** Ranking local del gimnasio: suma ISG de los jugadores del propio centro. */
  async gymRanking(gymAdminId: string) {
    const admin = await this.getUserOrThrow(gymAdminId);
    if (!admin.gymId) {
      throw new BadRequestException('Tu gimnasio no tiene un centro asociado');
    }
    const grouped = await this.prisma.set.groupBy({
      by: ['userId'],
      where: { user: { gymId: admin.gymId, role: 'USER' } },
      _sum: { isgScore: true },
    });
    const scoreMap = new Map<string, number>(
      grouped.map((g) => [g.userId, g._sum.isgScore?.toNumber() ?? 0]),
    );
    const players = await this.prisma.user.findMany({
      where: { gymId: admin.gymId, role: 'USER' },
      select: USER_SELECT,
    });
    return players
      .map((p) => ({
        id: p.id,
        name: this.fullName(p),
        isgScore: scoreMap.get(p.id) ?? 0,
        streakDays: p.streakDays,
      }))
      .sort((a, b) => b.isgScore - a.isgScore);
  }
}