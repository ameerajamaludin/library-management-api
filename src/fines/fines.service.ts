import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Fine } from './entities/fine.entity';
import { Borrow } from '../borrows/entities/borrow.entity';

import { CreateFineDto } from './dto/create-fine.dto';
import { UpdateFineDto } from './dto/update-fine.dto';

@Injectable()
export class FinesService {
  constructor(
    @InjectRepository(Fine)
    private readonly finesRepository: Repository<Fine>,

    @InjectRepository(Borrow)
    private readonly borrowsRepository: Repository<Borrow>,
  ) {}

  private toResponse(fine: Fine) {
    return {
      fine_id: fine.fine_id,
      copy_id: fine.borrow?.copy?.copy_id ?? null,
      amount: fine.amount,
      reason: fine.reason,
      status: fine.status,
      paid_at: fine.paid_at,

      user: fine.borrow?.user
        ? {
            user_id: fine.borrow.user.user_id,
            name: fine.borrow.user.name,
            email: fine.borrow.user.email,
          }
        : null,

      copy: fine.borrow?.copy
        ? {
            copy_id: fine.borrow.copy.copy_id,
            barcode: fine.borrow.copy.barcode,
            status: fine.borrow.copy.status,
          }
        : null,

      book: fine.borrow?.copy?.book
        ? {
            openlibrary_work_id:
              fine.borrow.copy.book.openlibrary_work_id,
            title: fine.borrow.copy.book.title,
            isbn: fine.borrow.copy.book.isbn,
          }
        : null,
    };
  }

  // ==========================================
  // POST /fines
  // ==========================================

  async create(
    createFineDto: CreateFineDto,
  ) {
    const borrow =
      await this.borrowsRepository.findOne({
        where: {
          borrow_id:
            createFineDto.borrow_id,
        },
        relations: {
          user: true,
          copy: {
            book: true,
          },
        },
      });

    if (!borrow) {
      throw new NotFoundException(
        `Borrow ${createFineDto.borrow_id} not found`,
      );
    }

    const fine =
      this.finesRepository.create({
        borrow_id:
          createFineDto.borrow_id,
        amount: createFineDto.amount,
        reason: createFineDto.reason,
        status: createFineDto.status,
        paid_at:
          createFineDto.paid_at ?? null,
      });

    const savedFine =
      await this.finesRepository.save(fine);

    return this.findOne(
      savedFine.fine_id,
    );
  }

  // ==========================================
  // GET /fines
  // ==========================================

  async findAll() {
    const fines = await this.finesRepository.find({
      relations: {
        borrow: {
          user: true,
          copy: {
            book: true,
          },
        },
      },
      order: {
        fine_id: 'DESC',
      },
    });

    return fines.map((fine) =>
      this.toResponse(fine),
    );
  }

  // ==========================================
  // GET /fines/:id
  // ==========================================

  async findOne(id: number) {
    const fine =
      await this.finesRepository.findOne({
        where: {
          fine_id: id,
        },
        relations: {
          borrow: {
            user: true,
            copy: {
              book: true,
            },
          },
        },
      });

    if (!fine) {
      throw new NotFoundException(
        `Fine ${id} not found`,
      );
    }

    return this.toResponse(fine);
  }

  // ==========================================
  // GET /fines/borrow/:borrowId
  // ==========================================

  async findByBorrowId(
    borrowId: number,
  ) {
    const borrow =
      await this.borrowsRepository.findOne({
        where: {
          borrow_id: borrowId,
        },
      });

    if (!borrow) {
      throw new NotFoundException(
        `Borrow ${borrowId} not found`,
      );
    }

    const fines = await this.finesRepository.find({
      where: {
        borrow_id: borrowId,
      },
      relations: {
        borrow: {
          user: true,
          copy: {
            book: true,
          },
        },
      },
      order: {
        fine_id: 'DESC',
      },
    });

    return fines.map((fine) =>
      this.toResponse(fine),
    );
  }

  // ==========================================
  // PATCH /fines/:id
  // ==========================================

  async update(
    id: number,
    updateFineDto: UpdateFineDto,
  ) {
    const fine =
      await this.finesRepository.findOne({
        where: {
          fine_id: id,
        },
      });

    if (!fine) {
      throw new NotFoundException(
        `Fine ${id} not found`,
      );
    }

    Object.assign(
      fine,
      updateFineDto,
    );

    return this.finesRepository.save(fine);
  }

  // ==========================================
  // PATCH /fines/:id/pay
  // ==========================================

  async pay(id: number) {
    const fine =
      await this.finesRepository.findOne({
        where: {
          fine_id: id,
        },
      });

    if (!fine) {
      throw new NotFoundException(
        `Fine ${id} not found`,
      );
    }

    if (fine.status === 'PAID') {
      throw new ConflictException(
        `Fine ${id} has already been paid`,
      );
    }

    fine.status = 'PAID';
    fine.paid_at = new Date();

    await this.finesRepository.save(fine);

    return this.findOne(id);
  }

  // ==========================================
  // DELETE /fines/:id
  // ==========================================

  async remove(id: number) {
    const fine =
      await this.finesRepository.findOne({
        where: {
          fine_id: id,
        },
      });

    if (!fine) {
      throw new NotFoundException(
        `Fine ${id} not found`,
      );
    }

    await this.finesRepository.remove(fine);

    return {
      message: `Fine ${id} deleted successfully`,
    };
  }
}