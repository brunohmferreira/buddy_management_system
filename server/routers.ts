import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getBuddies,
  getBuddyById,
  getBuddyByUserId,
  createBuddy,
  updateBuddy,
  deleteBuddy,
  getNewHires,
  getNewHireById,
  getNewHireByUserId,
  createNewHire,
  updateNewHire,
  deleteNewHire,
  getAssociations,
  getAssociationById,
  getAssociationsByBuddyId,
  getAssociationsByNewHireId,
  createAssociation,
  updateAssociation,
  deleteAssociation,
  getTasksByAssociationId,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskAssignmentsByTaskId,
  createTaskAssignment,
  deleteTaskAssignment,
  getMeetingsByAssociationId,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getMeetingNotesByMeetingId,
  createMeetingNote,
  updateMeetingNote,
  deleteMeetingNote,
  getDashboardMetrics,
} from "./db";

// Admin procedure - only admins can access
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Dashboard
  dashboard: router({
    getMetrics: protectedProcedure.query(async () => {
      return await getDashboardMetrics();
    }),
  }),

  // Buddies
  buddies: router({
    list: protectedProcedure.query(async () => {
      return await getBuddies();
    }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getBuddyById(input.id);
      }),
    create: protectedProcedure
      .input(
        z.object({
          userId: z.number(),
          nickname: z.string().optional(),
          team: z.string().optional(),
          level: z.string().optional(),
          status: z.enum(['available', 'unavailable', 'inactive']).default('available'),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only admin or the user themselves can create a buddy profile
        if (ctx.user.role !== 'admin' && ctx.user.id !== input.userId) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return await createBuddy(input);
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          nickname: z.string().optional(),
          team: z.string().optional(),
          level: z.string().optional(),
          status: z.enum(['available', 'unavailable', 'inactive']).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const buddy = await getBuddyById(input.id);
        if (!buddy) throw new TRPCError({ code: 'NOT_FOUND' });
        
        if (ctx.user.role !== 'admin' && ctx.user.id !== buddy.userId) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        const { id, ...data } = input;
        return await updateBuddy(id, data);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteBuddy(input.id);
      }),
  }),

  // New Hires
  newHires: router({
    list: protectedProcedure.query(async () => {
      return await getNewHires();
    }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getNewHireById(input.id);
      }),
    create: protectedProcedure
      .input(
        z.object({
          userId: z.number(),
          nickname: z.string().optional(),
          team: z.string().optional(),
          level: z.string().optional(),
          status: z.enum(['onboarding', 'active', 'completed', 'inactive']).default('onboarding'),
          startDate: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only admin or the user themselves can create a new hire profile
        if (ctx.user.role !== 'admin' && ctx.user.id !== input.userId) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return await createNewHire(input);
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          nickname: z.string().optional(),
          team: z.string().optional(),
          level: z.string().optional(),
          status: z.enum(['onboarding', 'active', 'completed', 'inactive']).optional(),
          startDate: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const newHire = await getNewHireById(input.id);
        if (!newHire) throw new TRPCError({ code: 'NOT_FOUND' });
        
        if (ctx.user.role !== 'admin' && ctx.user.id !== newHire.userId) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        const { id, ...data } = input;
        return await updateNewHire(id, data);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteNewHire(input.id);
      }),
  }),

  // Associations
  associations: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === 'admin') {
        return await getAssociations();
      }
      
      // For buddy or newHire, only show their own associations
      if (ctx.user.role === 'buddy') {
        const buddy = await getBuddyByUserId(ctx.user.id);
        if (!buddy) return [];
        return await getAssociationsByBuddyId(buddy.id);
      }
      
      if (ctx.user.role === 'newHire') {
        const newHire = await getNewHireByUserId(ctx.user.id);
        if (!newHire) return [];
        return await getAssociationsByNewHireId(newHire.id);
      }
      
      return [];
    }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const association = await getAssociationById(input.id);
        if (!association) throw new TRPCError({ code: 'NOT_FOUND' });
        
        // Check access
        if (ctx.user.role !== 'admin') {
          const buddy = await getBuddyByUserId(ctx.user.id);
          const newHire = await getNewHireByUserId(ctx.user.id);
          
          if (
            (buddy && association.buddyId !== buddy.id) &&
            (newHire && association.newHireId !== newHire.id)
          ) {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
        }
        
        return association;
      }),
    create: protectedProcedure
      .input(
        z.object({
          buddyId: z.number(),
          newHireId: z.number(),
          startDate: z.date(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        return await createAssociation({
          ...input,
          status: 'active',
        });
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(['active', 'completed', 'paused', 'inactive']).optional(),
          endDate: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const association = await getAssociationById(input.id);
        if (!association) throw new TRPCError({ code: 'NOT_FOUND' });
        
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        const { id, ...data } = input;
        return await updateAssociation(id, data);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteAssociation(input.id);
      }),
  }),

  // Tasks
  tasks: router({
    listByAssociation: protectedProcedure
      .input(z.object({ associationId: z.number() }))
      .query(async ({ input, ctx }) => {
        const association = await getAssociationById(input.associationId);
        if (!association) throw new TRPCError({ code: 'NOT_FOUND' });
        
        // Check access
        if (ctx.user.role !== 'admin') {
          const buddy = await getBuddyByUserId(ctx.user.id);
          const newHire = await getNewHireByUserId(ctx.user.id);
          
          if (
            (buddy && association.buddyId !== buddy.id) &&
            (newHire && association.newHireId !== newHire.id)
          ) {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
        }
        
        return await getTasksByAssociationId(input.associationId);
      }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getTaskById(input.id);
      }),
    create: protectedProcedure
      .input(
        z.object({
          associationId: z.number(),
          title: z.string(),
          description: z.string().optional(),
          usefulLink: z.string().optional(),
          status: z.enum(['pending', 'inProgress', 'completed', 'overdue']).default('pending'),
          dueDate: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const association = await getAssociationById(input.associationId);
        if (!association) throw new TRPCError({ code: 'NOT_FOUND' });
        
        // Check access
        if (ctx.user.role !== 'admin') {
          const buddy = await getBuddyByUserId(ctx.user.id);
          const newHire = await getNewHireByUserId(ctx.user.id);
          
          if (
            (buddy && association.buddyId !== buddy.id) &&
            (newHire && association.newHireId !== newHire.id)
          ) {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
        }
        
        return await createTask(input);
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          usefulLink: z.string().optional(),
          status: z.enum(['pending', 'inProgress', 'completed', 'overdue']).optional(),
          dueDate: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const task = await getTaskById(input.id);
        if (!task) throw new TRPCError({ code: 'NOT_FOUND' });
        
        const association = await getAssociationById(task.associationId);
        if (!association) throw new TRPCError({ code: 'NOT_FOUND' });
        
        // Check access
        if (ctx.user.role !== 'admin') {
          const buddy = await getBuddyByUserId(ctx.user.id);
          const newHire = await getNewHireByUserId(ctx.user.id);
          
          if (
            (buddy && association.buddyId !== buddy.id) &&
            (newHire && association.newHireId !== newHire.id)
          ) {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
        }
        
        const { id, ...data } = input;
        return await updateTask(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const task = await getTaskById(input.id);
        if (!task) throw new TRPCError({ code: 'NOT_FOUND' });
        
        const association = await getAssociationById(task.associationId);
        if (!association) throw new TRPCError({ code: 'NOT_FOUND' });
        
        // Check access
        if (ctx.user.role !== 'admin') {
          const buddy = await getBuddyByUserId(ctx.user.id);
          const newHire = await getNewHireByUserId(ctx.user.id);
          
          if (
            (buddy && association.buddyId !== buddy.id) &&
            (newHire && association.newHireId !== newHire.id)
          ) {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
        }
        
        return await deleteTask(input.id);
      }),
  }),

  // Meetings
  meetings: router({
    listByAssociation: protectedProcedure
      .input(z.object({ associationId: z.number() }))
      .query(async ({ input, ctx }) => {
        const association = await getAssociationById(input.associationId);
        if (!association) throw new TRPCError({ code: 'NOT_FOUND' });
        
        // Check access
        if (ctx.user.role !== 'admin') {
          const buddy = await getBuddyByUserId(ctx.user.id);
          const newHire = await getNewHireByUserId(ctx.user.id);
          
          if (
            (buddy && association.buddyId !== buddy.id) &&
            (newHire && association.newHireId !== newHire.id)
          ) {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
        }
        
        return await getMeetingsByAssociationId(input.associationId);
      }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getMeetingById(input.id);
      }),
    create: protectedProcedure
      .input(
        z.object({
          associationId: z.number(),
          title: z.string().optional(),
          scheduledAt: z.date(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const association = await getAssociationById(input.associationId);
        if (!association) throw new TRPCError({ code: 'NOT_FOUND' });
        
        // Check access
        if (ctx.user.role !== 'admin') {
          const buddy = await getBuddyByUserId(ctx.user.id);
          const newHire = await getNewHireByUserId(ctx.user.id);
          
          if (
            (buddy && association.buddyId !== buddy.id) &&
            (newHire && association.newHireId !== newHire.id)
          ) {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
        }
        
        return await createMeeting(input);
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          scheduledAt: z.date().optional(),
          completedAt: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const meeting = await getMeetingById(input.id);
        if (!meeting) throw new TRPCError({ code: 'NOT_FOUND' });
        
        const association = await getAssociationById(meeting.associationId);
        if (!association) throw new TRPCError({ code: 'NOT_FOUND' });
        
        // Check access
        if (ctx.user.role !== 'admin') {
          const buddy = await getBuddyByUserId(ctx.user.id);
          const newHire = await getNewHireByUserId(ctx.user.id);
          
          if (
            (buddy && association.buddyId !== buddy.id) &&
            (newHire && association.newHireId !== newHire.id)
          ) {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
        }
        
        const { id, ...data } = input;
        return await updateMeeting(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const meeting = await getMeetingById(input.id);
        if (!meeting) throw new TRPCError({ code: 'NOT_FOUND' });
        
        const association = await getAssociationById(meeting.associationId);
        if (!association) throw new TRPCError({ code: 'NOT_FOUND' });
        
        // Check access
        if (ctx.user.role !== 'admin') {
          const buddy = await getBuddyByUserId(ctx.user.id);
          const newHire = await getNewHireByUserId(ctx.user.id);
          
          if (
            (buddy && association.buddyId !== buddy.id) &&
            (newHire && association.newHireId !== newHire.id)
          ) {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
        }
        
        return await deleteMeeting(input.id);
      }),
  }),

  // Meeting Notes
  meetingNotes: router({
    listByMeeting: protectedProcedure
      .input(z.object({ meetingId: z.number() }))
      .query(async ({ input }) => {
        return await getMeetingNotesByMeetingId(input.meetingId);
      }),
    create: protectedProcedure
      .input(
        z.object({
          meetingId: z.number(),
          content: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const meeting = await getMeetingById(input.meetingId);
        if (!meeting) throw new TRPCError({ code: 'NOT_FOUND' });
        
        const association = await getAssociationById(meeting.associationId);
        if (!association) throw new TRPCError({ code: 'NOT_FOUND' });
        
        // Check access
        if (ctx.user.role !== 'admin') {
          const buddy = await getBuddyByUserId(ctx.user.id);
          const newHire = await getNewHireByUserId(ctx.user.id);
          
          if (
            (buddy && association.buddyId !== buddy.id) &&
            (newHire && association.newHireId !== newHire.id)
          ) {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
        }
        
        return await createMeetingNote({
          ...input,
          userId: ctx.user.id,
        });
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          content: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        return await updateMeetingNote(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteMeetingNote(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
