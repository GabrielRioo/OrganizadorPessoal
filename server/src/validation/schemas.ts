import { z } from "zod";
import { isAllowedCoverUrl } from "../lib/coverUrl.js";

const notes = z.string().trim().max(2000).optional().nullable();

const coverUrl = z
  .string()
  .trim()
  .max(500)
  .nullable()
  .optional()
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value == null || isAllowedCoverUrl(value), "Invalid cover URL");

export const loginSchema = z
  .object({
    password: z.string().trim().min(1).max(200),
  })
  .strict();

export const accessPasswordCreateSchema = z
  .object({
    label: z.string().trim().min(1).max(80),
    password: z
      .string()
      .trim()
      .max(200)
      .optional()
      .nullable()
      .transform((value) => (!value ? undefined : value))
      .refine((value) => value === undefined || value.length >= 8, "Password too short"),
  })
  .strict();

export const gameCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    platform: z.string().trim().min(1).max(80),
    status: z.enum(["WISHLIST", "BACKLOG", "PLAYING", "PAUSED", "PLAYED", "ABANDONED", "SHELVED", "ONLINE", "CASUAL", "EVENTUAL"]),
    queuePosition: z.number().int().min(1).max(999).optional().nullable(),
    notes,
    coverUrl,
    playtimeHours: z.number().int().min(1).max(9999).optional().nullable(),
  })
  .strict();

export const gameUpdateSchema = gameCreateSchema.partial();

export const mediaCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    kind: z.enum(["MOVIE", "SERIES", "ANIME"]),
    status: z.enum(["WATCHLIST", "WATCHING", "PAUSED", "WAITING", "WATCHED"]),
    currentSeason: z.number().int().min(0).max(999).optional().nullable(),
    currentEpisode: z.number().int().min(0).max(9999).optional().nullable(),
    rating: z.enum(["GOOD", "OKAY", "BAD"]).optional().nullable(),
    genre: z.string().trim().max(80).optional().nullable(),
    watchedOn: z.string().trim().max(80).optional().nullable(),
    notes,
    coverUrl,
    year: z.number().int().min(1870).max(2100).optional().nullable(),
  })
  .strict();

export const mediaUpdateSchema = mediaCreateSchema.partial();

export const travelCreateSchema = z
  .object({
    place: z.string().trim().min(1).max(200),
    country: z.string().trim().max(80).optional().nullable(),
    status: z.enum(["VISITED", "PLANNING"]),
    visitedAt: z.string().date().optional().nullable(),
    notes,
  })
  .strict();

export const travelUpdateSchema = travelCreateSchema.partial();

export const projectCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    status: z.enum(["PLANNED", "IN_PROGRESS", "PAUSED", "DONE"]),
    description: z.string().trim().max(4000).optional().nullable(),
    deadline: z.string().date().optional().nullable(),
    published: z.boolean().optional(),
    monetize: z.boolean().optional(),
  })
  .strict();

export const projectUpdateSchema = projectCreateSchema.partial();

export const taskCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    kind: z.enum(["TASK", "IDEA"]),
    status: z.enum(["TODO", "DOING", "DONE"]),
    notes,
  })
  .strict();

export const taskUpdateSchema = taskCreateSchema.partial();

export const countdownCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    targetDate: z.string().date(),
    notes,
  })
  .strict();

export const countdownUpdateSchema = countdownCreateSchema.partial();

export const pomodoroCreateSchema = z
  .object({
    startedAt: z.string().datetime(),
    endedAt: z.string().datetime().optional().nullable(),
    durationMin: z.number().int().min(1).max(180),
    label: z.string().trim().max(120).optional().nullable(),
  })
  .strict();

const money = z.number().finite().min(0).max(99_999_999.99).optional().nullable();

const httpUrl = z
  .string()
  .trim()
  .max(500)
  .url()
  .refine((value) => /^https?:\/\//i.test(value), "URL must be http or https");

const buyLinkSchema = z
  .object({
    url: httpUrl,
    label: z.string().trim().max(80).optional().nullable(),
  })
  .strict();

export const buyItemCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().max(4000).optional().nullable(),
    category: z.string().trim().max(80).optional().nullable(),
    currentPrice: money,
    targetPrice: money,
    currency: z.enum(["BRL", "USD", "EUR"]).optional(),
    quantity: z.number().int().min(1).max(999).optional(),
    priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
    status: z.enum(["WANT", "RESEARCHING", "WAITING_DEAL", "BOUGHT", "DROPPED"]),
    links: z.array(buyLinkSchema).max(8).optional(),
    notes,
  })
  .strict();

export const buyItemUpdateSchema = buyItemCreateSchema.partial();
