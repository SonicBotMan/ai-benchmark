import { NextResponse } from 'next/server';

export function apiError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function badRequest(message: string, extra?: Record<string, unknown>) {
  return apiError(message, 400, extra);
}

export function unauthorized(message = 'Missing or invalid Authorization header') {
  return apiError(message, 401);
}

export function forbidden(message: string) {
  return apiError(message, 403);
}

export function notFound(message: string) {
  return apiError(message, 404);
}

export function paymentRequired(message: string, extra?: Record<string, unknown>) {
  return apiError(message, 402, extra);
}

export function internalError(message = 'Internal server error') {
  return apiError(message, 500);
}
