import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { BenefitFormat, SaveBenefitFormatInput } from '../types/benefit-format.model';
import { BENEFIT_FORMATS_FIXTURE } from '../utils/benefit-format.fixture';
import { sortBenefitFormats } from '../utils/benefit-format.mapper';
import { BenefitFormatRepository } from './benefit-format.repository';

export const MOCK_LATENCY_MS = 250;

const NAME_MAX_LENGTH = 40;
const DESCRIPTION_MAX_LENGTH = 200;

function badRequest(errors: Record<string, string>): HttpErrorResponse {
  return new HttpErrorResponse({ status: 400, error: { errors, status: 400 } });
}

function conflict(message: string): HttpErrorResponse {
  return new HttpErrorResponse({ status: 409, error: message });
}

interface ValidInput {
  readonly displayName: string;
  readonly description: string;
  readonly active: boolean;
}

/** In-memory formats that enforce the same rules as `/benefit-formats` of the backend. */
@Injectable()
export class MockBenefitFormatRepository implements BenefitFormatRepository {
  private formats: readonly BenefitFormat[] = BENEFIT_FORMATS_FIXTURE;
  private nextId = 1;

  getFormats(): Observable<readonly BenefitFormat[]> {
    return this.respond(() => sortBenefitFormats(this.formats));
  }

  createFormat(input: SaveBenefitFormatInput): Observable<BenefitFormat> {
    return this.respond(() => {
      const { displayName, description, active } = this.validate(input, true);
      const code = input.code!;
      if (this.formats.some((format) => format.code === code)) {
        throw conflict(`The format ${code} is already in the catalog`);
      }
      this.assertNameFree(displayName, null);
      const created: BenefitFormat = {
        id: `format-mock-${this.nextId++}`,
        code,
        displayName,
        description,
        active,
        usageCount: 0,
      };
      this.formats = [...this.formats, created];
      return created;
    });
  }

  updateFormat(id: string, input: SaveBenefitFormatInput): Observable<BenefitFormat> {
    return this.respond(() => {
      const { displayName, description, active } = this.validate(input, false);
      const current = this.formats.find((format) => format.id === id);
      if (!current) {
        throw new HttpErrorResponse({ status: 404, error: 'Benefit format not found' });
      }
      this.assertNameFree(displayName, current.id);
      const updated: BenefitFormat = { ...current, displayName, description, active };
      this.formats = this.formats.map((format) => (format.id === id ? updated : format));
      return updated;
    });
  }

  /** Runs the operation after the simulated latency; a thrown error reaches the subscriber. */
  private respond<T>(operation: () => T): Observable<T> {
    try {
      return of(operation()).pipe(delay(MOCK_LATENCY_MS));
    } catch (error) {
      return throwError(() => error).pipe(delay(MOCK_LATENCY_MS));
    }
  }

  /** Throws the backend validation error, or returns the input trimmed with `active` defaulted. */
  private validate(input: SaveBenefitFormatInput, requiresCode: boolean): ValidInput {
    const displayName = (input.displayName ?? '').trim();
    const description = (input.description ?? '').trim();
    const errors: Record<string, string> = {};
    if (requiresCode && !input.code) {
      errors['code'] = 'The format is required';
    }
    if (!displayName) {
      errors['displayName'] = 'The name is required';
    } else if (displayName.length > NAME_MAX_LENGTH) {
      errors['displayName'] = `The name must have at most ${NAME_MAX_LENGTH} characters`;
    }
    if (!description) {
      errors['description'] = 'The description is required';
    } else if (description.length > DESCRIPTION_MAX_LENGTH) {
      errors['description'] =
        `The description must have at most ${DESCRIPTION_MAX_LENGTH} characters`;
    }
    if (Object.keys(errors).length > 0) {
      throw badRequest(errors);
    }
    return { displayName, description, active: input.active ?? true };
  }

  private assertNameFree(displayName: string, selfId: string | null): void {
    const taken = this.formats.some(
      (format) =>
        format.id !== selfId &&
        format.displayName.trim().toLowerCase() === displayName.toLowerCase(),
    );
    if (taken) {
      throw conflict(`A benefit type named ${displayName} already exists`);
    }
  }
}
