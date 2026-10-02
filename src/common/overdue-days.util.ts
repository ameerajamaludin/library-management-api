/**
 * Overdue days are the completed 24-hour periods
 * elapsed after a borrow's due date; the due date
 * itself does not count, and a borrow becomes
 * overdue once one full calendar day has passed.
 *
 * Pass `asOf` as the borrow's returned_at to freeze
 * the count once the borrow has been returned.
 */
export function calculateOverdueDays(
  dueAt: Date,
  asOf: Date | null = new Date(),
): number {
  const asOfDate = asOf ?? new Date();

  return Math.floor(
    (asOfDate.getTime() - dueAt.getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

/**
 * The cutoff a borrow's due date has to fall before for
 * that borrow to count as overdue, derived from the same
 * rule `calculateOverdueDays` applies. Queries that filter
 * on overdue borrows share this cutoff instead of each
 * repeating the one-day arithmetic.
 */
export function overdueCutoff(
  asOf: Date | null = new Date(),
): Date {
  return new Date(
    (asOf ?? new Date()).getTime() -
      1000 * 60 * 60 * 24,
  );
}