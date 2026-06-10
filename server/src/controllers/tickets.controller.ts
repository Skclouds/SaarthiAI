import { NextFunction, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { TicketPriority, TicketStatus } from '../models';
import * as ticketService from '../services/ticket.service';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const status = req.query.status as TicketStatus | undefined;
    const priority = req.query.priority as TicketPriority | undefined;

    const tickets = await ticketService.listTickets(req.user.businessId, { status, priority });
    res.json({ tickets });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const ticket = await ticketService.getTicket(String(req.params.id), req.user.businessId);
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const { status } = req.body;
    const ticket = await ticketService.updateTicketStatus(
      String(req.params.id),
      req.user.businessId,
      status,
    );
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const { customerName, email, query, priority, conversationId } = req.body;
    const ticket = await ticketService.createTicket(req.user.businessId, {
      customerName,
      email,
      query,
      priority,
      conversationId,
    });
    res.status(201).json({ ticket });
  } catch (err) {
    next(err);
  }
}
